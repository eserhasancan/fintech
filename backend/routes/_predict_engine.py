# backend/routes/_predict_engine.py
import pathlib

import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.utils import resample
from datetime import datetime, timedelta
from newsapi import NewsApiClient, newsapi_exception
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

nltk.download("vader_lexicon", quiet=True)
sia = SentimentIntensityAnalyzer()

START_DATE = "2009-02-14"
END_DATE   = "2020-06-12"
NEWS_KEY   = "4656311750dd4e31b7c395067cc397ce"   # kendi NewsAPI anahtarın
LOOKBACK   = 3
SENT_THR   = 0.05

def _fetch_prices(ticker):
    data = yf.download(
        ticker,
        start=START_DATE,
        end=END_DATE,
        progress=False,
        group_by="column",
        auto_adjust=False,
    )
    if data.empty:
        raise ValueError(f"{ticker}: price data empty")

    # ── 1️⃣  Sütunları düzleştir ───────────────────────────────
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = [
            " ".join([str(x) for x in col if x]).strip() for col in data.columns
        ]
    # ──────────────────────────────────────────────────────────

    # ── 2️⃣  'Adj Close' / 'Close' sütununu bul ───────────────
    def _find_close(cols):
        for c in cols:
            low = c.lower()
            if "adj close" in low or "adjclose" in low:
                return c
        for c in cols:
            if "close" in c.lower():
                return c
        raise ValueError("Neither 'Adj Close' nor 'Close' column found")

    close_col = _find_close(data.columns)
    # ──────────────────────────────────────────────────────────

    df = (
        data[[close_col]]
        .reset_index()
        .rename(columns={"Date": "date", close_col: "adj_close"})
    )
    df["date"] = pd.to_datetime(df["date"])
    return df


def _fetch_sentiments():
    # ① CSV yolu = bu .py dosyasının bulunduğu klasör
    csv_path = pathlib.Path(__file__).with_name("analyst_ratings_with_sentiment_cleaned.csv")
    df = pd.read_csv(csv_path)
    df["date"] = pd.to_datetime(df["date"], utc=True).dt.tz_convert(None)
    return df

def _prepare(prices, sentiments):
    df = pd.merge(prices, sentiments, on="date", how="inner").sort_values("date")
    if df.empty:
        raise ValueError("No overlapping price-sentiment data")
    scaler = MinMaxScaler()
    df["ps"] = scaler.fit_transform(df[["adj_close"]])
    df["future"] = df["ps"].shift(-1)
    df.dropna(inplace=True)
    df["label"] = (df["future"] > df["ps"]).astype(int)
    X = df[["ps", "sentiment"]].values
    y = df["label"].values
    return X, y, scaler

def _balance(X, y):
    idx_up   = np.where(y == 1)[0]
    idx_down = np.where(y == 0)[0]
    if len(idx_up) == 0 or len(idx_down) == 0:
        return X, y
    if len(idx_up) < len(idx_down):
        idx_up = resample(idx_up, replace=True, n_samples=len(idx_down), random_state=42)
    else:
        idx_down = resample(idx_down, replace=True, n_samples=len(idx_up), random_state=42)
    idx = np.concatenate([idx_up, idx_down])
    np.random.shuffle(idx)
    return X[idx], y[idx]

def _today_inputs(ticker, scaler):
    bar = yf.Ticker(ticker).history(period="1d", auto_adjust=False)
    if bar.empty:
        raise ValueError("today price missing")
    price_norm = scaler.transform([[bar["Close"].iloc[-1]]])[0][0]
    price_norm = max(0.001, min(0.999, price_norm))
    today = pd.to_datetime(bar.index[-1]).normalize()

    try:
        news = NewsApiClient(api_key=NEWS_KEY).get_everything(
            q=f'"{ticker}" OR {ticker}',
            language="en",
            sort_by="publishedAt",
            from_param=str((today - timedelta(days=LOOKBACK-1)).date()),
            to=str(today.date()),
            page_size=100,
        )
        labs = []
        for art in news.get("articles", []):
            c = sia.polarity_scores(
                f"{art.get('title','')}. {art.get('description','')}"
            )["compound"]
            labs.append(1 if c >  SENT_THR else -1 if c < -SENT_THR else 0)
        sent = float(np.mean(labs)) if labs else 0.0
    except newsapi_exception.NewsAPIException:
        sent = 0.0
    return np.array([[price_norm, sent]])

def predict_direction(ticker: str) -> str:
    prices = _fetch_prices(ticker)
    sentiments = _fetch_sentiments()
    X, y, scaler = _prepare(prices, sentiments)
    X_bal, y_bal = _balance(X, y)

    model = DecisionTreeClassifier(random_state=42).fit(X_bal, y_bal)
    # scaler'a bugün fiyatı ekleyip yeniden fit
    today_close = yf.Ticker(ticker).history(period="1d")["Close"].iloc[-1]
    scaler.fit(np.append(prices["adj_close"], today_close).reshape(-1, 1))

    X_today = _today_inputs(ticker, scaler)
    pred = model.predict(X_today)[0]
    return "UP" if pred == 1 else "DOWN"
