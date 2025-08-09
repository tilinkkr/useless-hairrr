#!/usr/bin/env python3
"""
Python bridge for hair analysis from Next.js API
"""

import sys
import json
import base64
import numpy as np
import cv2
from pathlib import Path
import traceback

# Add the utils directory to Python path
sys.path.append(str(Path(__file__).parent))

try:
    from hair_analysis import analyze_hair_images
except ImportError as e:
    print(f"Error importing hair_analysis: {e}")
    sys.exit(1)

def main():
    """Main entry point for the Python hair analysis bridge."""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        # Extract image buffers and view names
        image_buffers = []
        view_names = []
        
        for key in ['front', 'back', 'left', 'right']:
            if key in data:
                # Decode base64 image data
                image_data = base64.b64decode(data[key])
                image_buffers.append(image_data)
                view_names.append(key.capitalize())
        
        if len(image_buffers) != 4:
            raise ValueError("Exactly 4 images required")
        
        # Run analysis
        results = analyze_hair_images(image_buffers, view_names)
        
        # Convert numpy arrays to lists for JSON serialization
        for key in ['density_maps', 'confidence_maps']:
            if key in results:
                results[key] = [arr.tolist() for arr in results[key]]
        
        # Return results as JSON
        print(json.dumps({
            'success': True,
            'results': results
        }))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
