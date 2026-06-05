import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

# This script trains a diabetes prediction model from a CSV file.
# Place the diabetes CSV file in the same folder as this script or update the dataset_path below.

def main():
    # Path to the diabetes dataset CSV file
    dataset_path = "diabetes.csv"

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(
            f"Dataset file not found: {dataset_path}.\n"
            "Please place your diabetes CSV file next to this script."
        )

    # Load the dataset into a pandas DataFrame
    data = pd.read_csv(dataset_path)
    print(f"Loaded dataset with {len(data)} rows and {len(data.columns)} columns.")

    # The target column is expected to be named 'Outcome'.
    # If your dataset uses a different name, update this variable.
    target_column = "Outcome"
    if target_column not in data.columns:
        raise ValueError(
            f"Expected target column '{target_column}' not found in dataset columns: {list(data.columns)}"
        )

    # Use the same fields that the API sends for prediction
    feature_columns = [
        "Pregnancies",
        "Glucose",
        "BloodPressure",
        "SkinThickness",
        "Insulin",
        "BMI",
        "DiabetesPedigreeFunction",
        "Age",
    ]
    missing_features = [col for col in feature_columns if col not in data.columns]
    if missing_features:
        raise ValueError(
            f"Missing expected feature columns in the dataset: {missing_features}"
        )

    # Separate the selected features from the target label
    X = data[feature_columns]
    y = data[target_column]

    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Training on {len(X_train)} rows and testing on {len(X_test)} rows.")

    # Create the RandomForestClassifier model
    model = RandomForestClassifier(n_estimators=100, random_state=42)

    # Train the model on the training data
    model.fit(X_train, y_train)

    # Use the model to make predictions on the testing data
    predictions = model.predict(X_test)

    # Calculate accuracy of the model
    accuracy = accuracy_score(y_test, predictions)
    print(f"Model accuracy: {accuracy:.4f}")

    # Save the trained model to disk for later use
    output_path = "model.pkl"
    joblib.dump(model, output_path)
    print(f"Saved trained model to {output_path}")


if __name__ == "__main__":
    main()
