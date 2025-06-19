// src/components/TransactionForm.js
import React, { useState } from "react";
import axios from "axios";
import "./TransactionForm.css";

export default function TransactionForm({ onSuccess }) {
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount || !date) {
      return setError("Kategori, tutar ve tarih zorunlu");
    }
    try {
      // ← will go to http://localhost:5000/api/transactions/
      await axios.post("/transactions/", {
        type,
        category,
        amount: parseFloat(amount),
        date,
        description,
      });
      setCategory("");
      setAmount("");
      setDate("");
      setDescription("");
      setError("");
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.msg ||
          "Veri eklenirken hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  return (
    <form className="trx-form" onSubmit={handleSubmit}>
      <h4>Yeni İşlem Ekle</h4>
      {error && <div className="error">{error}</div>}
      <div className="row">
        <label>Tip:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="income">Gelir</option>
          <option value="expense">Gider</option>
        </select>
      </div>
      <div className="row">
        <label>Kategori:</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="örn. Maaş, Market"
        />
      </div>
      <div className="row">
        <label>Tutar:</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="örn. 1500.00"
        />
      </div>
      <div className="row">
        <label>Tarih:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="row">
        <label>Açıklama:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="opsiyonel"
        />
      </div>
      <button type="submit">Ekle</button>
    </form>
  );
}
