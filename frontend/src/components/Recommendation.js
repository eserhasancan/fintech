import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Recommendation = () => {
    const [recommendation, setRecommendation] = useState({});
    const [error, setError] = useState('');

    const fetchRecommendation = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/analysis/recommendation', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendation(response.data);
        } catch (err) {
            setError('Öneriler alınırken hata oluştu.');
        }
    };

    useEffect(() => {
        fetchRecommendation();
    }, []);

    return (
        <div>
            <h2>Yatırım Önerileri</h2>
            {error && <p style={{color:'red'}}>{error}</p>}
            {recommendation.recommendation ? (
                <div>
                    <p>Gelir Toplamı: {recommendation.income_total} TL</p>
                    <p>Gider Toplamı: {recommendation.expense_total} TL</p>
                    <p>Birikim: {recommendation.savings} TL</p>
                    <h3>Öneri:</h3>
                    <p>{recommendation.recommendation}</p>
                </div>
            ) : (
                <p>Öneriler yükleniyor...</p>
            )}
        </div>
    );
};

export default Recommendation;
