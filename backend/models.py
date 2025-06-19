# backend/models.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from passlib.hash import pbkdf2_sha256 as sha256

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name    = db.Column(db.String(100))
    last_name     = db.Column(db.String(100))
    created_at    = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    investment_instruments  = db.relationship(
        "InvestmentInstrument", backref="user", cascade="all, delete-orphan"
    )
    investment_transactions = db.relationship(
        "InvestmentTransaction", backref="user", cascade="all, delete-orphan"
    )
    financial_transactions  = db.relationship(
        "FinancialTransaction", backref="user", cascade="all, delete-orphan"
    )
    recommendations         = db.relationship(
        "Recommendation", backref="user", cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = sha256.hash(password)

    def check_password(self, password):
        return sha256.verify(password, self.password_hash)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "created_at": self.created_at.isoformat(),
        }


class InvestmentInstrument(db.Model):
    __tablename__ = 'investment_instruments'

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    instrument_name  = db.Column(db.String(255), nullable=False)
    symbol           = db.Column(db.String(50))
    instrument_type  = db.Column(db.String(50))
    created_at       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    investment_transactions = db.relationship(
        "InvestmentTransaction", backref="instrument", cascade="all, delete-orphan"
    )
    recommendations = db.relationship(
        "Recommendation", backref="instrument", cascade="all, delete-orphan"
    )


class InvestmentTransaction(db.Model):
    __tablename__ = 'investment_transactions'

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    instrument_id    = db.Column(db.Integer, db.ForeignKey('investment_instruments.id', ondelete="CASCADE"), nullable=False)
    transaction_type = db.Column(db.String(50), nullable=False)  # e.g. 'buy', 'sell'
    total_amount     = db.Column(db.Numeric(14, 2), nullable=False, default=0)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    note             = db.Column(db.Text)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class Category(db.Model):
    __tablename__ = 'categories'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    name       = db.Column(db.String(255), nullable=False)
    type       = db.Column(db.String(50), nullable=False)  # 'income' or 'expense'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    financial_transactions = db.relationship(
        "FinancialTransaction", backref="category", cascade="all, delete-orphan"
    )


class FinancialTransaction(db.Model):
    __tablename__ = 'financial_transactions'

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    category_id      = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete="CASCADE"), nullable=False)
    amount           = db.Column(db.Numeric(14, 2), nullable=False, default=0)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    description      = db.Column(db.Text)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "category_id": self.category_id,
            "amount": float(self.amount),
            "date": self.transaction_date.strftime("%Y-%m-%d"),
            "description": self.description,
        }


class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id                   = db.Column(db.Integer, primary_key=True)
    user_id              = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    instrument_id        = db.Column(db.Integer, db.ForeignKey('investment_instruments.id', ondelete="CASCADE"), nullable=False)
    recommendation_text  = db.Column(db.Text, nullable=False)
    confidence_score     = db.Column(db.Numeric(5, 2))
    created_at           = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at           = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
