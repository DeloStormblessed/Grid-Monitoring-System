import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
import styles from './Navbar.module.css';

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Cargar preferencia del tema al montar el componente
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleMenu = () => {
      setIsOpen(!isOpen);
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

return (
    <header className={styles.header}>
        {/*Bloque: logo*/}
        <div className={styles.logo}>
            GMS
        </div>

        <div className={styles.rightGroups}>
          <button className={styles.themeToggle} onClick={toggleTheme} title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}>
            {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
          <div className={styles.admin}>
            <FaUserCircle size={25} title='Admin' />
          </div>
          <button className={styles.hamburger} onClick={toggleMenu}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>


        <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
            <ul className={styles.navLinks}>
              <li><Link to="/dashboard" onClick={() => setIsOpen(false)}>GENERAL</Link></li>
              <li><Link to="/lineas" onClick={() => setIsOpen(false)}>LÍNEAS</Link></li>
              <li><Link to="/zonas" onClick={() => setIsOpen(false)}>ZONAS</Link></li>
              <li><Link to="/cargas" onClick={() => setIsOpen(false)}>CARGAS</Link></li>
            </ul>
        </nav>
    </header>
  );
};

export default Navbar;