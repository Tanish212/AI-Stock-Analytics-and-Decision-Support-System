# STOCK VISTA — AI-POWERED STOCK ANALYTICS AND DECISION SUPPORT SYSTEM

**Stock Vista** is an AI-powered stock market analytics and decision support 
platform built with Python, FastAPI, React, and GRU deep-learning models. 
It uses historical OHLCV market data to forecast stock prices, evaluate model 
performance, and generate data-driven Buy/Hold/Sell signals through an interactive dashboard.

## FEATURES

• Historical Stock Data Analysis

• Analyzes historical OHLCV data for supported Indian and NSE-listed stocks.

• Uses Open, High, Low, Close, and Volume data for stock analysis and forecasting.

• GRU-Based Price Forecasting

• Uses individual GRU deep-learning models for different stocks.

• Uses the previous 60 trading days as input for prediction.

• Forecasts the expected future closing price.

• Maintains separate trained models and scalers for supported stocks.

• Buy/Hold/Sell Signals

• Compares the current stock price with the predicted price.

• Generates data-driven Buy, Hold, or Sell signals based on predicted price movement.

• Model Performance Evaluation

• Evaluates predictions using MAE, RMSE, MAPE, and R² Score.

• Displays stock-specific model performance.

• Provides a reliability classification based on prediction error.

• Individual Stock Analysis

• Displays the current price and predicted price.

• Calculates the predicted percentage change.

• Shows the generated trading signal.

• Presents the model evaluation metrics.

• Stock Comparison

• Allows users to compare multiple supported stocks.

• Compares predicted price movements and model performance.

• Financial News

• Displays relevant financial and stock-market news.

• Helps users understand market developments alongside model predictions.

• Interactive Dashboard

• Provides a centralized interface for stock analysis.

• Combines forecasting, comparison, model evaluation, and financial news.

• Offers a responsive and user-friendly experience.

## WORKFLOW

1. Historical OHLCV Data

2. Data Preprocessing

3. Data Scaling

4. 60-Day Input Sequence Creation

5. Stock-Specific GRU Model

6. Future Price Prediction

7. Predicted Percentage Change Calculation

8. Buy/Hold/Sell Signal Generation

9. Model Performance Evaluation

10. Dashboard Visualization

## TECHNOLOGIES USED

• Python

• FastAPI

• PostgreSQL

• TensorFlow/Keras

• GRU Deep Learning

• Pandas

• NumPy

• Scikit-learn

• yfinance

• Joblib

• React

• Vite

• JavaScript

• HTML/CSS

• Matplotlib/Plotly

• News API

## MODEL DETAILS

• Model Type: GRU Deep Learning

• Number of Models: 103 individual stock models

• Input Data: Historical closing prices

• Lookback Window: 60 trading days

• Training Split: Chronological 80/20 split

• Batch Size: 64

• Maximum Epochs: 100

• Early Stopping: Enabled

• Model Format: Keras

• Scaler Format: Pickle

## MODEL PERFORMANCE

The trained models were evaluated on historical test data.

• Average MAE: ₹53.40

• Average RMSE: ₹68.83

• Average MAPE: 2.42%

• Average R² Score: 0.9225

• Stocks with MAPE below 3%: 85 out of 103

### METRIC EXPLANATION

• MAE measures the average absolute difference between actual and predicted prices.

• RMSE measures prediction error while giving greater importance to larger errors.

• MAPE measures the average prediction error as a percentage.

• R² Score measures how well the model explains the variation in actual prices.

## GETTING STARTED

### Clone the Repository

```bash
git clone https://github.com/Tanish212/AI-Stock-Analytics-and-Decision-Support-System.git
cd AI-Stock-Analytics-and-Decision-Support-System
```

### Create a Virtual Environment

```bash
python -m venv venv
```

### Activate the Virtual Environment

On Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

### Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

## ENVIRONMENT CONFIGURATION

Create a `.env` file in the project directory and configure the required environment variables.

```env
DATABASE_URL=your_database_connection_string
NEWS_API_KEY=your_news_api_key
```

Do not upload the `.env` file to GitHub.

## RUN THE PROJECT

### Start the Backend

From the project root:

```bash
uvicorn backend.main:app --reload
```

### Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## PROJECT STRUCTURE

```text
AI-Stock-Analytics-System/
│
├── assets/
├── backend/
│   ├── ml/
│   │   ├── models/
│   │   └── results/
│   └── main.py
│
├── config/
├── database/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── notebooks/
├── pages/
├── src/
│   └── gru_predictor.py
│
├── tests/
├── app.py
├── requirements.txt
├── .env
└── README.md
```

## EXAMPLE USAGE

1. Open the Stock Vista dashboard.

2. Select a supported Indian stock.

3. View the current market price.

4. Load the stock-specific GRU model.

5. Generate the predicted future price.

6. View the predicted percentage change.

7. Review the Buy/Hold/Sell signal.

8. Check the model performance metrics.

9. Compare the stock with other supported stocks.

10. Review relevant financial news.

## FUTURE IMPROVEMENTS

• Portfolio tracking

• Price alerts

• Real-time market-data integration

• Backtesting of generated signals

• Downloadable analysis reports

• Production deployment and scalability

• Improved performance for highly volatile stocks

• Additional risk-analysis features

## DISCLAIMER

Stock Vista is an educational and analytical decision-support platform. Its predictions and Buy/Hold/Sell signals are generated using historical market data and GRU model forecasts. Predictions are not guaranteed to be accurate and should not be considered financial advice. Users should conduct their own research and consult a qualified financial professional before making investment decisions.
