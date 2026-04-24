// Archivo: src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/loginbg.jpg'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // CAMBIO 1: Cambiamos un booleano por un texto de error dinámico
  const [errorMessage, setErrorMessage] = useState(''); 
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); 
    
    // CAMBIO 2: Verificamos si los campos están vacíos antes de nada
    if (username.trim() === '' || password.trim() === '') {
      setErrorMessage('Por favor, rellena todos los campos.');
      return; // Detiene la función para no seguir comprobando
    }

    const tokenCorrecto = import.meta.env.VITE_APP_PASSWORD;
    const usuarioCorrecto = import.meta.env.VITE_APP_USERNAME || 'admin';

    if (username === usuarioCorrecto && password === tokenCorrecto) {
      console.log('¡Acceso concedido!');
      sessionStorage.removeItem('hasSeenWelcomeModal');
      navigate('/dashboard'); 
    } else {
      setErrorMessage('Usuario o contraseña incorrectos.');
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errorMessage) setErrorMessage(''); // Limpia el error al escribir
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage(''); // Limpia el error al escribir
  };

  return (
    <div style={{ ...styles.pageContainer, backgroundImage: `url(${bgImage})` }}>
      
      <div style={styles.overlay}></div>

      <div style={styles.contentWrapper}>
        
        <div style={styles.headerTitles}>
          <h1 style={styles.mainTitle}>Grid Monitoring System</h1>
          <h2 style={styles.subTitle}>DEMANDA DE TU MICRORED EN TIEMPO REAL</h2>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={handleUsernameChange} 
              placeholder="Introduce tu usuario"
              /* CAMBIO 3: Eliminamos la palabra 'required' de aquí */
              style={{
                ...styles.input,
                borderColor: errorMessage ? 'var(--ind-danger)' : '#555',
                backgroundColor: errorMessage ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 255, 255, 0.1)'
              }}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={handlePasswordChange} 
              placeholder="Introduce tu contraseña"
              /* CAMBIO 3: Eliminamos la palabra 'required' de aquí */
              style={{
                ...styles.input,
                borderColor: errorMessage ? 'var(--ind-danger)' : '#555',
                backgroundColor: errorMessage ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 255, 255, 0.1)'
              }}
            />
          </div>

          {/* CAMBIO 4: Mostramos el texto de la variable errorMessage. 
              Si está vacía, mostramos un texto invisible para mantener el espacio y evitar el salto visual */}
          <span style={{
            ...styles.errorMessage,
            visibility: errorMessage ? 'visible' : 'hidden'
          }}>
            {errorMessage || 'Espacio reservado'}
          </span>

          <button type="submit" style={styles.button}>ENTRAR AL SISTEMA</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    width: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: '0 auto',
    padding: '0'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    zIndex: 1,
  },
  contentWrapper: {
    zIndex: 2, 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '50px', 
    width: '100%',
    padding: '20px',
  },
  headerTitles: {
    textAlign: 'center',
    color: 'var(--ind-text-on-dark)',
  },
  mainTitle: {
    fontSize: '3.5rem',
    fontWeight: 'normal',
    margin: '0 0 15px 0',
    letterSpacing: '1px',
  },
  subTitle: {
    fontSize: '1.2rem',
    fontWeight: '300',
    letterSpacing: '1.5px',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%',
    maxWidth: '320px',
    padding: '30px',
    backgroundColor: 'rgba(1, 59, 59, 0.75)', 
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    color: 'var(--ind-text-on-dark)', 
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.9rem',
    color: 'var(--ind-text-on-dark)',
  },
  input: {
    padding: '12px',
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '1px',
    outline: 'none', 
    color: 'var(--ind-text-on-dark)', 
    transition: 'border-color 0.3s, background-color 0.3s' 
  },
  errorMessage: {
    color: 'var(--ind-danger)',
    fontSize: '13px',
    textAlign: 'center',
    margin: '-5px 0 -5px 0',
    fontWeight: 'bold',
  },
  button: {
    padding: '12px',
    backgroundColor: '#1a1a1a', 
    color: 'var(--ind-text-on-dark)',
    border: '1px solid #333',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: '1px',
    marginTop: '5px',
    transition: 'background-color 0.3s'
  }
};

export default Login;