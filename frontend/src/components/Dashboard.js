// src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TransactionForm from "./TransactionForm";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [history, setHistory] = useState([]);
  const [recs, setRecs] = useState([]);

  const fetchData = () => {
    // Gelir/Gider özet
    axios
      .get("/transactions/summary")
      .then((res) => setTotals(res.data))
      .catch((e) => console.error("Summary hata:", e));

    // Günlük/aylık history
    axios
      .get("/transactions/history")
      .then((res) => setHistory(res.data))
      .catch((e) => console.error("History hata:", e));

    // Dinamik öneriler
    axios
      .get("/recommendations")
      .then((res) => setRecs(res.data))
      .catch((e) => console.error("Recommendations hata:", e));
  };

  useEffect(fetchData, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Anasayfa butonu */}
      <div className="home-button-container">
        <button className="home-button" onClick={handleHome}>
          Anasayfa
        </button>
      </div>

      <TransactionForm onSuccess={fetchData} />

      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <h3>Toplam Gelir</h3>
          <p>₺{totals.income.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Toplam Gider</h3>
          <p>₺{totals.expense.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Kalan Bakiye</h3>
          <p>₺{(totals.income - totals.expense).toLocaleString()}</p>
        </div>
      </div>

      <div className="content-row">
        <div className="chart-card">
          <h4>Gelir / Gider Grafiği</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={history}
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Gelir" fill="#22c55e" />
              <Bar dataKey="Gider" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Yatırım Önerileri</h4>
          <ul style={{ paddingLeft: "1rem", margin: 0, color: "#334155" }}>
            {recs.length > 0 ? (
              recs.map((r) => (
                <li key={r.symbol}>
                  {r.symbol}
                </li>
              ))
            ) : (
              <li>Öneri yükleniyor...</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
