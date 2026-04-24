// src/pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentBox}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Enlace No Encontrado</h2>
        <p className={styles.description}>
          La sección del sistema al que intentas acceder no existe, ha sido movido, o se encuentra actualmente en fase de construcción.
        </p>
        
        <button 
          className={styles.btnPrimary}
          onClick={() => navigate(-1)}
        >
          VOLVER
        </button>
      </div>
    </div>
  );
};

export default NotFound;