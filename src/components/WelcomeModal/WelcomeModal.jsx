import React, { useState, useEffect } from 'react';
import styles from './WelcomeModal.module.css';

const WelcomeModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // CAMBIO: Ahora usamos sessionStorage para que dure solo esta sesión
    const hasSeenModal = sessionStorage.getItem('hasSeenWelcomeModal');
    
    if (!hasSeenModal) {
      setIsVisible(true);
    }
  }, []); 

  // NUEVO: Bloquear el scroll mientras el modal esté visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Función de limpieza al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    // CAMBIO: Guardamos en sessionStorage
    sessionStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Bienvenido al panel de tu microred</h2>
        <p>Aquí podrás monitorear el estado de la red, visualizar métricas de consumo, el estado de las zonas y detectar fallos en tiempo real.</p>
        
        <button 
          className={styles.btnPrimary} 
          onClick={handleClose}
        >
          Entendido, ver panel
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;