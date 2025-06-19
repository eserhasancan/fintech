# backend/routes/recommendations.py
import os
import joblib
import numpy as np
import yfinance as yf
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from joblib import Parallel, delayed

from ._predict_engine import _today_inputs

recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/api')

# Dizin ayarları
BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, 'saved_models')
SCALER_DIR = os.path.join(BASE_DIR, 'saved_scalers')
TICKERS_FILE = os.path.join(BASE_DIR, 'tickers_200.txt')

# Model ve scaler yükleme

def load_model_scaler(ticker):
    """Diskten model ve scaler'ı yükler."""
    model_path = os.path.join(MODEL_DIR, f"{ticker}.joblib")
    scaler_path = os.path.join(SCALER_DIR, f"{ticker}_scaler.joblib")
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    return model, scaler

# Tek bir ticker için olasılık hesaplama

def predict_one(ticker):
    """Tek bir ticker için UP olasılığını hesaplar."""
    try:
        model, scaler = load_model_scaler(ticker)
        X_today = _today_inputs(ticker, scaler)
        proba = model.predict_proba(X_today)[0][1]
        return ticker, float(proba)
    except Exception:
        return None

@recommendations_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    # Route’a kimlik doğrulaması
    user_id = get_jwt_identity()

    # Ticker listesini oku
    with open(TICKERS_FILE) as f:
        tickers = [line.strip() for line in f if line.strip()]

    # Paralel tahmin (tüm çekirdekleri kullanır)
    raw_results = Parallel(n_jobs=-1)(delayed(predict_one)(t) for t in tickers)
    # Geçersiz sonuçları filtrele
    results = [r for r in raw_results if r]

    # Olasılığa göre sırala ve ilk 10’u al
    results.sort(key=lambda x: x[1], reverse=True)
    top10 = results[:10]

    # JSON formatında döndür
    recs = [{'symbol': sym, 'probability': prob} for sym, prob in top10]
    return jsonify(recs), 200