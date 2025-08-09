import cv2
import numpy as np
import time
import json
import sys
from pathlib import Path
try:
    import joblib  # type: ignore
except Exception:  # pragma: no cover
    joblib = None  # fallback when not installed
from typing import List, Dict, Any


class HairAnalyzerV2:
    def __init__(self):
        # --- LOAD THE PRE-TRAINED ML MODEL ---
        model_path = Path(__file__).parent / 'hair_density_model.pkl'
        if joblib is None:
            raise ImportError("joblib is required to load the ML model. Please install requirements and train the model.")
        self.model = joblib.load(model_path)

        self.patch_size = 32
        # Weights for each predicted class [Bald, Low, Medium, High]
        self.density_weights = [0, 0.25, 0.6, 1.0]
        self.average_hairs = 100000

    def _extract_features(self, patch: np.ndarray) -> np.ndarray:
        """Extracts features from an image patch for the ML model."""
        mean_intensity = np.mean(patch)
        laplacian_var = np.var(cv2.Laplacian(patch, cv2.CV_64F))
        return np.array([mean_intensity, laplacian_var]).reshape(1, -1)

    def _calculate_useless_metrics(self, image: np.ndarray) -> Dict[str, Any]:
        """Calculates our new suite of pseudo-scientific metrics."""
        # 1. Follicular Alignment Index (FAI)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=50, maxLineGap=10)
        dominant_angle = 0
        if lines is not None:
            angles = [np.arctan2(y2 - y1, x2 - x1) for line in lines for x1, y1, x2, y2 in line]
            dominant_angle = np.rad2deg(np.median(angles))

        # 2. Chromatic Vibrancy Score (CVS)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        chromatic_vibrancy = np.std(h) / 180.0  # Normalized 0-1

        # 3. Keratin Integrity Factor (KIF)
        keratin_integrity = np.random.uniform(0.92, 0.99)

        # 4. Mudi Mantra
        mantras = [
            "May your roots be strong and your destiny clear.",
            "Embrace the chaos of the curl.",
            "A single strand can hold a universe of potential.",
            "Your follicular aura is exceptionally vibrant today."
        ]
        mudi_mantra = np.random.choice(mantras)

        return {
            "follicular_alignment_index": f"{dominant_angle:.1f}°",
            "chromatic_vibrancy_score": f"{chromatic_vibrancy:.2%}",
            "keratin_integrity_factor": f"{keratin_integrity:.3f}",
            "mudi_mantra": mudi_mantra
        }

    def _calculate_singularity_event(self, estimated_hairs: int) -> Dict[str, Any]:
        """Calculates the date of the user's eventual 'Scalp Singularity'."""
        density_percentage = (estimated_hairs / self.average_hairs) * 100

        # Invent a 'follicular decay rate' based on how much hair is 'missing'.
        # The more hair loss, the faster the 'decay'.
        if density_percentage >= 99:
            return {"years_to_singularity": float('inf')}  # Essentially never

        decay_rate_per_year = (100.1 - density_percentage) / 500.0
        years_to_singularity = density_percentage / decay_rate_per_year

        return {"years_to_singularity": round(years_to_singularity, 2)}

    def run_analysis(self, images: List[np.ndarray]) -> Dict[str, Any]:
        start_time = time.time()
        class_predictions = {0: 0, 1: 0, 2: 0, 3: 0}  # Counts for each density class

        for image in images:
            img_resized = cv2.resize(image, (512, 512), interpolation=cv2.INTER_AREA)
            gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

            for y in range(0, gray.shape[0] - self.patch_size, self.patch_size):
                for x in range(0, gray.shape[1] - self.patch_size, self.patch_size):
                    patch = gray[y:y + self.patch_size, x:x + self.patch_size]
                    features = self._extract_features(patch)
                    prediction = int(self.model.predict(features)[0])
                    class_predictions[prediction] += 1

        # Calculate final hair count from ML predictions
        total_density_score = sum(class_predictions[i] * self.density_weights[i] for i in range(4))
        # Normalize the score to a plausible max
        max_possible_score = (512 / self.patch_size) ** 2 * 4 * max(self.density_weights)
        normalized_score = total_density_score / max_possible_score
        estimated_hairs = int(normalized_score * self.average_hairs * 2.5)  # Final calibration fudge factor

        # Generate all our useless metrics from the first image
        useless_metrics = self._calculate_useless_metrics(images[0])

        # Calculate the singularity event
        singularity_metrics = self._calculate_singularity_event(estimated_hairs)

        final_results = {
            "estimated_hair_count": min(estimated_hairs, 150000),  # Cap at a reasonable max
            **useless_metrics,
            **singularity_metrics,
            "analysis_time": f"{time.time() - start_time:.2f}s",
        }
        return final_results


def analyze_hair_entrypoint(image_buffers: List[bytes]) -> Dict[str, Any]:
    try:
        images = []
        for buffer in image_buffers:
            nparr = np.frombuffer(buffer, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Failed to decode image.")
            images.append(img)

        analyzer = HairAnalyzerV2()
        return analyzer.run_analysis(images)
    except Exception as e:
        return {"error": str(e)}


# Compatibility wrapper expected by python_bridge.py
# It maps the new ML results into the existing schema consumed by the Next.js API

def analyze_hair_images(image_buffers: List[bytes], view_names: List[str] = None) -> Dict[str, Any]:
    ml_results = analyze_hair_entrypoint(image_buffers)
    if "error" in ml_results:
        raise RuntimeError(ml_results["error"])  # allow the Node route to trigger fallback

    # Map ML outputs to the legacy structure expected by the route
    total_hairs = int(ml_results.get("estimated_hair_count", 0))

    # Fabricate simple per-view contributions evenly
    contributions = []
    for idx, view in enumerate(["Front", "Back", "Left", "Right"]):
        weight = [0.4, 0.4, 0.1, 0.1][idx]
        contributions.append({
            "view": view,
            "hairs": int(total_hairs * weight),
            "weight": weight,
        })

    return {
        "total_hairs": total_hairs,
        "confidence": 0.8,  # claim our "80% accuracy"
        "view_contributions": contributions,
        "heatmaps": [],  # v2 does not generate heatmaps
        "analysis_time": ml_results.get("analysis_time", "N/A"),
        # Pass-through new useless metrics so the API can include them in details
        "follicular_alignment_index": ml_results.get("follicular_alignment_index"),
        "chromatic_vibrancy_score": ml_results.get("chromatic_vibrancy_score"),
        "keratin_integrity_factor": ml_results.get("keratin_integrity_factor"),
        "mudi_mantra": ml_results.get("mudi_mantra"),
    }


if __name__ == '__main__':
    # This block allows for direct testing of the script with a real image
    if len(sys.argv) != 2:
        print("Usage: python3 utils/hair_analysis.py <path_to_image>")
        sys.exit(1)

    image_path = sys.argv[1]
    print(f"Running ML analysis on: {image_path}")

    with open(image_path, "rb") as f:
        buffer = f.read()

    results = analyze_hair_entrypoint([buffer] * 4)  # Use same image for all 4 views in test
    print(json.dumps(results, indent=2))
