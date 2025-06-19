// src/components/MarketDetail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowUp, FaArrowDown, FaArrowLeft } from "react-icons/fa";
import "./MarketDetail.css";

// Finnhub proxy üzerinden istek (setupProxy.js ile '/finnhub' → 'https://finnhub.io/api/v1')
const FINNHUB_KEY = "cva1t91r01qpd9sa8bi0cva1t91r01qpd9sa8big";
const finnhub = axios.create({
  baseURL: "/finnhub",
  headers: { "X-Finnhub-Token": FINNHUB_KEY }
});

// Backend predict endpoint
const BACKEND_URL = "http://localhost:5000/api";

export default function MarketDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [quote, setQuote] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // 1) Şirket profili yükleme
  useEffect(() => {
    finnhub
      .get("/stock/profile2", { params: { symbol } })
      .then(res => setProfile(res.data))
      .catch(err => console.error("Profil hatası:", err));
  }, [symbol]);

  // 2) Fiyat verisi yükleme
  useEffect(() => {
    finnhub
      .get("/quote", { params: { symbol } })
      .then(res => setQuote(res.data))
      .catch(err => console.error("Quote hatası:", err));
  }, [symbol]);

  // 3) Model tahminini çekme
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${BACKEND_URL}/predict/${symbol.toUpperCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setPrediction(res.data.direction))
      .catch(err => console.error("Tahmin hatası:", err));
  }, [symbol]);

  // Yükleniyor durumu
  if (!profile || !quote || prediction === null) {
    return (
      <div style={{ color: "#f1f5f9", textAlign: "center", padding: "3rem" }}>
        Yükleniyor…
      </div>
    );
  }

  const isUp = prediction === "UP";
  const ArrowIcon = isUp ? FaArrowUp : FaArrowDown;

  return (
    <div className="market-wrapper">
      <div className="card">
        <div className="back-btn" onClick={() => navigate("/")}>
          <FaArrowLeft /> Geri
        </div>

        <h2>{profile.name} Detay Sayfası</h2>

        <div className="details-row">
          <span>Sembol: {profile.ticker}</span>
          <span>Ülke: {profile.country}</span>
          <span>Borsa: {profile.exchange}</span>
        </div>

        <div className={`price-row ${quote.d >= 0 ? "up" : "down"}`}>
          Güncel Fiyat: ${quote.c.toFixed(2)}
          <span className="change">
            {quote.d.toFixed(2)} ({quote.dp.toFixed(2)}%)
          </span>
        </div>

        <div className={`prediction ${isUp ? "up" : "down"}`}>
          Model Tahmini: {prediction} <ArrowIcon />
        </div>

        <p className="note">
          *Karar ağacı modeli, geçmiş fiyat ve haber duyarlılığına göre {isUp ? 'artış' : 'azalış'} bekliyor.*
        </p>
      </div>
    </div>
  );
}