import React, { useState, useEffect } from 'react';
import './WelcomeModal.module.css';

const WelcomeModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // CAMBIO: Ahora usamos sessionStorage para que dure solo esta sesión
    const hasSeenModal = sessionStorage.getItem('hasSeenWelcomeModal');
    
    if (!hasSeenModal) {
      setIsVisible(true);
    }
  }, []); 

  const handleClose = () => {
    setIsVisible(false);
    // CAMBIO: Guardamos en sessionStorage
    sessionStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>¡Bienvenido al Panel de la Red Eléctrica!</h2>
        <p>Aquí podrás monitorear el estado de distribución, visualizar métricas de consumo y analizar el rendimiento en tiempo real.</p>
        <p>Haz clic en el botón de abajo para empezar a explorar las gráficas.</p>
        
        <button 
          className="btn-primary" 
          onClick={handleClose}
        >
          Entendido, ver panel
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;