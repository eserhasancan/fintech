import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        type: 'income',
        category: '',
        amount: '',
        date: '',
        description: ''
    });
    const [error, setError] = useState('');

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/transactions/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data);
        } catch (err) {
            setError('İşlemler alınırken hata oluştu.');
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/transactions/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTransactions();
            setFormData({
                type: 'income',
                category: '',
                amount: '',
                date: '',
                description: ''
            });
        } catch (err) {
            setError('İşlem eklenirken hata oluştu.');
        }
    };

    return (
        <div>
            <h2>Gelir/Gider İşlemleri</h2>
            {error && <p style={{color:'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tür:</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="income">Gelir</option>
                        <option value="expense">Gider</option>
                    </select>
                </div>
                <div>
                    <label>Kategori:</label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange} required/>
                </div>
                <div>
                    <label>Tutar:</label>
                    <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} required/>
                </div>
                <div>
                    <label>Tarih:</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required/>
                </div>
                <div>
                    <label>Açıklama:</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange}/>
                </div>
                <button type="submit">Ekle</button>
            </form>
            <hr/>
            <h3>İşlem Listesi</h3>
            <ul>
                {transactions.map(t => (
                    <li key={t.id}>
                        {t.date} - {t.category} - {t.type} - {t.amount} TL
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Transactions;
