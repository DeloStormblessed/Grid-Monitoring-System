// src/pages/Login.jsx
import React from 'react';
import bgImage from '../assets/loginbg.jpg'; 
import LoginForm from '../components/LoginForm/LoginForm.jsx'; 
// Importamos los estilos responsivos
import styles from './Login.module.css';

function Login() {
  return (
    <div className={styles.pageContainer} style={{ backgroundImage: `url(${bgImage})` }}>
      <div className={styles.overlay}></div>

      <div className={styles.contentWrapper}>
        <div className={styles.headerTitles}>
          <h1 className={styles.mainTitle}>Grid Monitoring System</h1>
          <h2 className={styles.subTitle}>DEMANDA DE TU MICRORED EN TIEMPO REAL</h2>
        </div>

        {/* El componente del formulario */}
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;