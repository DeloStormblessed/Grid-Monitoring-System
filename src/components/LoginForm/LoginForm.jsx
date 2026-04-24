// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css'; // Importación del módulo CSS

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); 
    if (username.trim() === '' || password.trim() === '') {
      setErrorMessage('Por favor, rellena todos los campos.');
      return; 
    }

    const tokenCorrecto = import.meta.env.VITE_APP_PASSWORD;
    const usuarioCorrecto = import.meta.env.VITE_APP_USERNAME || 'admin';

    if (username === usuarioCorrecto && password === tokenCorrecto) {
      sessionStorage.removeItem('hasSeenWelcomeModal');
      navigate('/dashboard'); 
    } else {
      setErrorMessage('Usuario o contraseña incorrectos.');
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errorMessage) setErrorMessage(''); 
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage(''); 
  };

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>Usuario</label>
        <input 
          type="text" 
          value={username}
          onChange={handleUsernameChange} 
          placeholder="Introduce tu usuario (admin)"
          className={`${styles.input} ${errorMessage ? styles.inputError : ''}`}
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label className={styles.label}>Contraseña</label>
        <input 
          type="password" 
          value={password}
          onChange={handlePasswordChange} 
          placeholder="Introduce tu contraseña (1234)"
          className={`${styles.input} ${errorMessage ? styles.inputError : ''}`}
        />
      </div>

      <span className={styles.errorMessage} style={{ visibility: errorMessage ? 'visible' : 'hidden' }}>
        {errorMessage || 'Espacio reservado'}
      </span>

      <button type="submit" className={styles.button}>ENTRAR AL SISTEMA</button>
    </form>
  );
}

export default LoginForm;