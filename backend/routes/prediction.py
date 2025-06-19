# backend/routes/prediction.py
from flask import Blueprint, jsonify
from ._predict_engine import predict_direction   # (1-b’de tanımlıyoruz)

prediction_bp = Blueprint("prediction", __name__, url_prefix="/api")

@prediction_bp.route("/predict/<string:symbol>", methods=["GET"])
def get_prediction(symbol):
    try:
        direction = predict_direction(symbol.upper())
        return jsonify({"symbol": symbol.upper(), "direction": direction}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
