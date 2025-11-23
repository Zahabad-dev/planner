import { useState } from 'react';
import styles from '../styles/Login.module.css';

export default function Login({ onLogin }) {
  const [email] = useState('kodart@planner.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar credenciales localmente
    if (password === 'Losmejores2025@') {
      onLogin();
    } else {
      setError('Contraseña incorrecta');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <h1>📱 Content Planner</h1>
          <p>KODART - Sistema de Gestión de Contenido</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label>Usuario</label>
            <input
              type="text"
              value="KODART"
              disabled
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className={styles.input}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>Sistema exclusivo para KODART</p>
        </div>
      </div>
    </div>
  );
}
