import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Eğer kullanıcı zaten giriş yapmışsa (token varsa) dashboard'a yönlendir
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password
      });
      // Başarılı kayıt sonrası login sayfasına yönlendir
      navigate('/login');
    } catch (err) {
      setError('Kayıt yapılamadı. Lütfen bilgilerinizi kontrol ediniz.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Kayıt Ol</h2>
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleRegister} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>İsim:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Parola:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.submitButton}>
          Kayıt Ol
        </button>
      </form>

      <p style={styles.redirectText}>
        Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
      </p>
    </div>
  );
};

// Basit stiller (Inline CSS objesi)
const styles = {
  container: {
    width: '360px',
    margin: '60px auto',
    padding: '20px',
    backgroundColor: '#1a1e27',
    borderRadius: '8px',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#4cafb2',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '10px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: '#2b2f38',
    color: '#fff',
    outline: 'none',
  },
  submitButton: {
    backgroundColor: '#4cafb2',
    color: '#000',
    border: 'none',
    padding: '10px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  redirectText: {
    textAlign: 'center',
    marginTop: '15px',
  },
};

export default Register;
