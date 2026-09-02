import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf


# ============================================================
# PATH CONFIGURATION
# ============================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

# ML folder
ML_DIR = os.path.join(
    PROJECT_ROOT,
    "backend",
    "ml"
)

# Processed stock data
DATA_DIR = os.path.join(
    ML_DIR,
    "data",
    "processed"
)

# Trained GRU models
MODEL_DIR = os.path.join(
    ML_DIR,
    "models",
    "gru_models"
)


# ============================================================
# SETTINGS
# ============================================================

LOOKBACK = 60


# ============================================================
# GET AVAILABLE STOCKS
# ============================================================

def get_available_stocks():
    """
    Returns a list of stocks that have trained GRU models.
    """

    if not os.path.exists(MODEL_DIR):
        return []

    stocks = []

    for file in os.listdir(MODEL_DIR):

        if file.endswith("_gru.keras"):

            stock = file.replace("_gru.keras", "")

            stocks.append(stock)

    return sorted(stocks)


# ============================================================
# LOAD MODEL AND SCALER
# ============================================================

def load_stock_model(stock):

    stock = stock.upper()

    model_path = os.path.join(
        MODEL_DIR,
        f"{stock}_gru.keras"
    )

    scaler_path = os.path.join(
        MODEL_DIR,
        f"{stock}_scaler.pkl"
    )

    # Check model
    if not os.path.exists(model_path):

        raise FileNotFoundError(
            f"GRU model not found for {stock}"
        )

    # Check scaler
    if not os.path.exists(scaler_path):

        raise FileNotFoundError(
            f"Scaler not found for {stock}"
        )

    # Load model
    model = tf.keras.models.load_model(
        model_path
    )

    # Load scaler
    scaler = joblib.load(
        scaler_path
    )

    return model, scaler


# ============================================================
# LOAD STOCK DATA
# ============================================================

def load_stock_data(stock):

    stock = stock.upper()

    data_path = os.path.join(
        DATA_DIR,
        f"{stock}.csv"
    )

    if not os.path.exists(data_path):

        raise FileNotFoundError(
            f"Processed data not found for {stock}"
        )

    df = pd.read_csv(data_path)

    # Convert Date
    df["Date"] = pd.to_datetime(
        df["Date"],
        errors="coerce"
    )

    # Convert Close to numeric
    df["Close"] = pd.to_numeric(
        df["Close"],
        errors="coerce"
    )

    # Remove missing values
    df = df.dropna(
        subset=["Date", "Close"]
    )

    # Sort by date
    df = df.sort_values(
        "Date"
    ).reset_index(drop=True)

    return df


# ============================================================
# PREDICT NEXT DAY PRICE
# ============================================================

def predict_next_close(stock):

    stock = stock.upper()

    # ----------------------------------------
    # Load model and scaler
    # ----------------------------------------

    model, scaler = load_stock_model(
        stock
    )

    # ----------------------------------------
    # Load historical data
    # ----------------------------------------

    df = load_stock_data(
        stock
    )

    # Check enough records
    if len(df) < LOOKBACK:

        raise ValueError(
            f"Not enough data for {stock}. "
            f"Need at least {LOOKBACK} records."
        )

    # ----------------------------------------
    # Get latest 60 closing prices
    # ----------------------------------------

    latest_prices = df[
        "Close"
    ].values[-LOOKBACK:]

    # Reshape for scaler
    latest_prices = latest_prices.reshape(
        -1,
        1
    )

    # ----------------------------------------
    # Scale prices
    # ----------------------------------------

    scaled_prices = scaler.transform(
        latest_prices
    )

    # ----------------------------------------
    # Reshape for GRU
    #
    # Expected shape:
    # (samples, timesteps, features)
    #
    # (1, 60, 1)
    # ----------------------------------------

    X = scaled_prices.reshape(
        1,
        LOOKBACK,
        1
    )

    # ----------------------------------------
    # Make prediction
    # ----------------------------------------

    scaled_prediction = model.predict(
        X,
        verbose=0
    )

    # ----------------------------------------
    # Convert prediction back to real price
    # ----------------------------------------

    predicted_price = scaler.inverse_transform(
        scaled_prediction
    )[0][0]

    # ----------------------------------------
    # Latest actual price
    # ----------------------------------------

    latest_price = df[
        "Close"
    ].iloc[-1]

    latest_date = df[
        "Date"
    ].iloc[-1]

    # ----------------------------------------
    # Calculate expected change
    # ----------------------------------------

    price_change = (
        predicted_price - latest_price
    )

    percentage_change = (
        price_change / latest_price
    ) * 100

    # ----------------------------------------
    # Prediction direction
    # ----------------------------------------

    if percentage_change > 0.5:

        direction = "UP"

    elif percentage_change < -0.5:

        direction = "DOWN"

    else:

        direction = "NEUTRAL"

    # ----------------------------------------
    # Return results
    # ----------------------------------------

    result = {

        "stock": stock,

        "last_date": str(
            latest_date.date()
        ),

        "last_close": round(
            float(latest_price),
            2
        ),

        "predicted_close": round(
            float(predicted_price),
            2
        ),

        "price_change": round(
            float(price_change),
            2
        ),

        "percentage_change": round(
            float(percentage_change),
            2
        ),

        "direction": direction

    }

    return result


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("GRU MULTI-STOCK PREDICTION TEST")
    print("=" * 60)

    test_stocks = [
        "SBIN",
        "RELIANCE",
        "TCS",
        "INFY",
        "HDFCBANK"
    ]

    for stock in test_stocks:

        print("\n" + "=" * 60)
        print(f"PREDICTING: {stock}")
        print("=" * 60)

        try:

            result = predict_next_close(stock)

            for key, value in result.items():
                print(f"{key}: {value}")

        except Exception as e:

            print(f"ERROR: {e}")