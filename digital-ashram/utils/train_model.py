import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
import joblib
from pathlib import Path


def create_synthetic_data():
    """Creates a synthetic dataset for training our density classifier."""
    # Features: [Mean Pixel Intensity, Texture Variance]
    # We will generate fake data representing 4 classes.
    # Class 0: Bald/Skin (Low intensity, low variance)
    # Class 1: Low Density (Medium intensity, medium variance)
    # Class 2: Medium Density (Medium intensity, high variance)
    # Class 3: High Density (Dark intensity, very high variance)

    np.random.seed(42)

    bald = np.random.rand(50, 2) * np.array([150, 20]) + np.array([50, 5])
    low_density = np.random.rand(50, 2) * np.array([100, 40]) + np.array([40, 20])
    medium_density = np.random.rand(50, 2) * np.array([80, 60]) + np.array([30, 60])
    high_density = np.random.rand(50, 2) * np.array([60, 80]) + np.array([10, 100])

    X = np.vstack([bald, low_density, medium_density, high_density])
    y = np.array([0] * 50 + [1] * 50 + [2] * 50 + [3] * 50)

    return X, y


def train_and_save_model():
    """Trains a Support Vector Machine (SVM) and saves it to a file."""
    X, y = create_synthetic_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # We use a Support Vector Classifier, which is powerful and fast.
    model = SVC(kernel="rbf", probability=True, gamma="auto")
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    print(f"Model trained with an accuracy of: {accuracy*100:.2f}%")

    # Save the trained model to a file using joblib for efficiency
    utils_dir = Path(__file__).parent
    model_path = utils_dir / "hair_density_model.pkl"
    joblib.dump(model, model_path)
    print(f"Model saved successfully to {model_path}")


if __name__ == "__main__":
    train_and_save_model()