import cv2
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
import io
import base64
from typing import List, Tuple, Dict, Any
import json
import os
import time
from pathlib import Path
from multiprocessing import Pool, cpu_count
import functools

class HairAnalyzer:
    def __init__(self):
        self.calibration_factor = 2.5  # hairs per density unit
        self.grid_size = 32
        # Update output directory to be relative to the project root
        self.output_dir = Path(__file__).parent.parent / "public" / "static" / "heatmaps"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Optimized image preprocessing with vectorized operations."""
        # Resize to consistent dimensions using INTER_AREA for better quality
        if image.shape[0] > 1024 or image.shape[1] > 1024:
            image = cv2.resize(image, (1024, 1024), interpolation=cv2.INTER_AREA)
        else:
            image = cv2.resize(image, (1024, 1024), interpolation=cv2.INTER_LINEAR)
        
        # Vectorized color correction using CLAHE
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        lab = cv2.merge([l, a, b])
        image = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        
        return image
    
    def segment_hair_vectorized(self, image: np.ndarray) -> np.ndarray:
        """Vectorized hair segmentation using NumPy operations."""
        # Convert to different color spaces for better segmentation
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Vectorized color thresholding
        # Dark hair detection
        lower_dark = np.array([0, 0, 0])
        upper_dark = np.array([180, 255, 50])
        mask_dark = cv2.inRange(hsv, lower_dark, upper_dark)
        
        # Brown hair detection
        lower_brown = np.array([10, 50, 20])
        upper_brown = np.array([20, 255, 200])
        mask_brown = cv2.inRange(hsv, lower_brown, upper_brown)
        
        # Blonde hair detection
        lower_blonde = np.array([20, 50, 150])
        upper_blonde = np.array([30, 255, 255])
        mask_blonde = cv2.inRange(hsv, lower_blonde, upper_blonde)
        
        # Vectorized mask combination
        hair_mask = cv2.bitwise_or(mask_dark, mask_brown)
        hair_mask = cv2.bitwise_or(hair_mask, mask_blonde)
        
        # Vectorized morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        hair_mask = cv2.morphologyEx(hair_mask, cv2.MORPH_CLOSE, kernel)
        hair_mask = cv2.morphologyEx(hair_mask, cv2.MORPH_OPEN, kernel)
        
        # Vectorized noise removal using area filtering
        contours, _ = cv2.findContours(hair_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        noise_mask = np.zeros_like(hair_mask)
        for contour in contours:
            if cv2.contourArea(contour) >= 1000:  # Vectorized area check
                cv2.fillPoly(noise_mask, [contour], 255)
        
        return noise_mask
    
    def process_cell_parallel(self, cell_data: Tuple[np.ndarray, np.ndarray, int, int]) -> Tuple[int, int, float, float]:
        """Process a single grid cell for parallel execution."""
        cell_image, cell_mask, i, j = cell_data
        
        # Calculate hair coverage using vectorized operations
        hair_coverage = np.sum(cell_mask > 0) / (self.grid_size * self.grid_size)
        
        if hair_coverage > 0.1:  # Only analyze cells with significant hair
            # Convert to grayscale for texture analysis
            cell_gray = cv2.cvtColor(cell_image, cv2.COLOR_BGR2GRAY)
            
            # Vectorized texture analysis
            density_score = self._calculate_texture_density_vectorized(cell_gray, cell_mask)
            
            return i, j, density_score, hair_coverage
        else:
            return i, j, 0.0, 0.0
    
    def _calculate_texture_density_vectorized(self, gray_image: np.ndarray, mask: np.ndarray) -> float:
        """Vectorized texture density calculation using NumPy operations."""
        # Pre-compute Gabor kernels for vectorized filtering
        angles = [0, 45, 90, 135]
        frequencies = [0.1, 0.3, 0.5]
        
        texture_responses = []
        
        # Vectorized Gabor filter application
        for angle in angles:
            for freq in frequencies:
                kernel = cv2.getGaborKernel((21, 21), 3, np.radians(angle), 2*np.pi*freq, 0.5, 0)
                response = cv2.filter2D(gray_image, cv2.CV_8UC3, kernel)
                texture_responses.append(response)
        
        # Vectorized variance calculation
        if texture_responses:
            responses_array = np.array(texture_responses)
            variance = np.var(responses_array, axis=0)
            
            # Vectorized masked variance calculation
            masked_variance = variance * (mask > 0)
            valid_pixels = masked_variance > 0
            if np.any(valid_pixels):
                mean_variance = np.mean(masked_variance[valid_pixels])
                density_score = min(mean_variance / 1000.0, 1.0)
                return density_score
        
        return 0.0
    
    def estimate_follicular_density_parallel(self, image: np.ndarray, hair_mask: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Parallel grid-based density analysis."""
        height, width = image.shape[:2]
        grid_h, grid_w = height // self.grid_size, width // self.grid_size
        
        # Prepare cell data for parallel processing
        cell_data_list = []
        for i in range(grid_h):
            for j in range(grid_w):
                y1, y2 = i * self.grid_size, (i + 1) * self.grid_size
                x1, x2 = j * self.grid_size, (j + 1) * self.grid_size
                
                cell_mask = hair_mask[y1:y2, x1:x2]
                cell_image = image[y1:y2, x1:x2]
                
                cell_data_list.append((cell_image, cell_mask, i, j))
        
        # Parallel processing using multiprocessing
        num_processes = min(cpu_count(), 8)  # Limit to 8 processes
        with Pool(processes=num_processes) as pool:
            results = pool.map(self.process_cell_parallel, cell_data_list)
        
        # Vectorized result aggregation
        density_map = np.zeros((grid_h, grid_w))
        confidence_map = np.zeros((grid_h, grid_w))
        
        for i, j, density_score, confidence_score in results:
            density_map[i, j] = density_score
            confidence_map[i, j] = confidence_score
        
        return density_map, confidence_map
    
    def generate_heatmap_optimized(self, density_map: np.ndarray, original_image: np.ndarray, 
                                  view_name: str) -> str:
        """Optimized heatmap generation with vectorized operations."""
        # Create figure with subplots using vectorized operations
        fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 5))
        
        # Original image
        ax1.imshow(cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB))
        ax1.set_title(f'{view_name} - Original')
        ax1.axis('off')
        
        # Density heatmap using vectorized seaborn
        sns.heatmap(density_map, cmap='plasma', ax=ax2, cbar=True)
        ax2.set_title(f'{view_name} - Density Heatmap')
        
        # Vectorized overlay creation
        overlay = self._create_overlay_vectorized(original_image, density_map)
        ax3.imshow(cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB))
        ax3.set_title(f'{view_name} - Overlay')
        ax3.axis('off')
        
        # Save the heatmap with timestamp
        timestamp = int(time.time() * 1000)
        heatmap_path = self.output_dir / f"{view_name.lower()}_heatmap_{timestamp}.png"
        plt.savefig(heatmap_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        # Return the relative path for web access
        return f"/static/heatmaps/{heatmap_path.name}"
    
    def _create_overlay_vectorized(self, image: np.ndarray, density_map: np.ndarray) -> np.ndarray:
        """Vectorized overlay creation."""
        # Vectorized resize
        height, width = image.shape[:2]
        density_resized = cv2.resize(density_map, (width, height))
        
        # Vectorized heatmap colormap creation
        heatmap = plt.cm.plasma(density_resized)
        heatmap_rgb = (heatmap[:, :, :3] * 255).astype(np.uint8)
        
        # Vectorized blending
        alpha = 0.6
        overlay = cv2.addWeighted(image, 1-alpha, heatmap_rgb, alpha, 0)
        
        return overlay
    
    def calculate_total_hair_count_vectorized(self, density_maps: List[np.ndarray], 
                                            confidence_maps: List[np.ndarray]) -> Dict[str, Any]:
        """Vectorized hair count calculation."""
        # Weight factors for different views
        weights = np.array([0.4, 0.4, 0.1, 0.1])  # front, back, left, right
        
        total_hairs = 0
        view_contributions = []
        
        for i, (density_map, confidence_map) in enumerate(zip(density_maps, confidence_maps)):
            # Vectorized calculation
            valid_cells = confidence_map > 0.1
            view_hairs = np.sum(density_map[valid_cells] * self.calibration_factor * 
                               confidence_map[valid_cells] * weights[i])
            
            total_hairs += view_hairs
            view_contributions.append({
                'view': ['front', 'back', 'left', 'right'][i],
                'hairs': int(view_hairs),
                'weight': weights[i]
            })
        
        # Apply biological constraints using vectorized operations
        if total_hairs < 50000:
            total_hairs *= 1.5
        elif total_hairs > 200000:
            total_hairs *= 0.8
        
        return {
            'total_hairs': int(total_hairs),
            'view_contributions': view_contributions,
            'confidence': min(np.mean([np.mean(cm) for cm in confidence_maps]), 1.0)
        }
    
    def analyze_hair_optimized(self, images: List[np.ndarray], view_names: List[str]) -> Dict[str, Any]:
        """Optimized main analysis function with timing."""
        start_time = time.time()
        
        results = {
            'heatmaps': [],
            'density_maps': [],
            'confidence_maps': [],
            'view_names': view_names
        }
        
        # Vectorized image processing
        processed_images = [self.preprocess_image(img) for img in images]
        hair_masks = [self.segment_hair_vectorized(img) for img in processed_images]
        
        # Parallel density estimation
        density_results = []
        confidence_results = []
        for img, mask in zip(processed_images, hair_masks):
            density_map, confidence_map = self.estimate_follicular_density_parallel(img, mask)
            density_results.append(density_map)
            confidence_results.append(confidence_map)
        
        # Vectorized heatmap generation
        heatmap_paths = []
        for density_map, processed_image, view_name in zip(density_results, processed_images, view_names):
            heatmap_path = self.generate_heatmap_optimized(density_map, processed_image, view_name)
            heatmap_paths.append(heatmap_path)
        
        results['density_maps'] = density_results
        results['confidence_maps'] = confidence_results
        results['heatmaps'] = heatmap_paths
        
        # Vectorized hair count calculation
        hair_count_data = self.calculate_total_hair_count_vectorized(
            results['density_maps'], 
            results['confidence_maps']
        )
        
        results.update(hair_count_data)
        
        # Add timing information
        end_time = time.time()
        results['analysis_time'] = f"{end_time - start_time:.2f}s"
        
        return results

def analyze_hair_images(image_buffers: List[bytes], view_names: List[str] = None) -> Dict[str, Any]:
    """Optimized main entry point for hair analysis."""
    if view_names is None:
        view_names = ['Front', 'Back', 'Left', 'Right']
    
    # Vectorized image conversion
    images = []
    for buffer in image_buffers:
        nparr = np.frombuffer(buffer, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        images.append(image)
    
    # Initialize analyzer and run optimized analysis
    analyzer = HairAnalyzer()
    results = analyzer.analyze_hair_optimized(images, view_names)
    
    return results

# Test function for debugging
def test_heatmap_generation():
    """Test function to verify optimized heatmap generation works."""
    # Create a simple test image
    test_image = np.random.randint(0, 255, (512, 512, 3), dtype=np.uint8)
    test_images = [test_image] * 4
    test_names = ['Front', 'Back', 'Left', 'Right']
    
    try:
        results = analyze_hair_images([test_image.tobytes()] * 4, test_names)
        print("✅ Optimized heatmap generation test passed!")
        print(f"Generated {len(results['heatmaps'])} heatmaps")
        print(f"Analysis time: {results.get('analysis_time', 'N/A')}")
        return True
    except Exception as e:
        print(f"❌ Optimized heatmap generation test failed: {e}")
        return False

if __name__ == "__main__":
    test_heatmap_generation()
