from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, case
from datetime import datetime

from models import db, FinancialTransaction, Category

# Blueprint'i '/api/transactions' altında expose ediyoruz
transactions_bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    txs = (FinancialTransaction.query
           .filter_by(user_id=user_id)
           .order_by(FinancialTransaction.transaction_date.desc())
           .all())
    return jsonify([t.to_dict() for t in txs]), 200

@transactions_bp.route('/', methods=['POST'])
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    kind     = data.get('type')      # 'income' veya 'expense'
    cat_name = data.get('category', '').upper()
    amount   = data.get('amount')
    date_str = data.get('date')
    desc     = data.get('description', '')

    if not all([kind, cat_name, amount is not None, date_str]):
        return jsonify(msg="type, category, amount ve date zorunlu"), 400

    try:
        tx_date = datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        return jsonify(msg="Invalid date format. Use YYYY-MM-DD."), 400

    # Kategori kontrolü/oluşturma
    category = Category.query.filter_by(
        user_id=user_id, name=cat_name, type=kind
    ).first()
    if not category:
        category = Category(user_id=user_id, name=cat_name, type=kind)
        db.session.add(category)
        db.session.flush()

    trx = FinancialTransaction(
        user_id=user_id,
        category_id=category.id,
        amount=amount,
        transaction_date=tx_date,
        description=desc
    )
    db.session.add(trx)
    db.session.commit()
    return jsonify(trx.to_dict()), 201

@transactions_bp.route('/summary', methods=['GET'])
@jwt_required()
def transactions_summary():
    user_id = get_jwt_identity()
    rows = (db.session.query(
                Category.type.label('kind'),
                func.coalesce(func.sum(FinancialTransaction.amount), 0).label('total')
            )
            .join(FinancialTransaction, FinancialTransaction.category_id==Category.id)
            .filter(Category.user_id==user_id)
            .group_by(Category.type)
            .all())

    result = {'income': 0.0, 'expense': 0.0}
    for kind, total in rows:
        result[kind] = float(total)
    return jsonify(result), 200

@transactions_bp.route('/history', methods=['GET'])
@jwt_required()
def transactions_history():
    user_id = get_jwt_identity()
    rows = (db.session.query(
                func.to_char(FinancialTransaction.transaction_date, 'YYYY-MM').label('month'),
                func.sum(case((Category.type=='income', FinancialTransaction.amount), else_=0)).label('Gelir'),
                func.sum(case((Category.type=='expense', FinancialTransaction.amount), else_=0)).label('Gider')
            )
            .join(Category, FinancialTransaction.category_id==Category.id)
            .filter(Category.user_id==user_id)
            .group_by('month')
            .order_by('month')
            .all())

    data = [{'name': r.month, 'Gelir': float(r.Gelir), 'Gider': float(r.Gider)} for r in rows]
    return jsonify(data), 200
