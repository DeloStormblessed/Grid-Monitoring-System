import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import styles from './Navbar.module.css';

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
      setIsOpen(!isOpen);
  };

return (
    <header className={styles.header}>
        {/*Bloque: logo*/}
        <div className={styles.logo}>
            Grid Monitoring System
        </div>

        <div className={styles.rightGroups}>
          <div className={styles.admin}>
            <FaUserCircle size={25} title='Admin' />
          </div>
          <button className={styles.hamburger} onClick={toggleMenu}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>


        <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
            <ul className={styles.navLinks}>
              <li><Link to="/" onClick={() => setIsOpen(false)}>GENERAL</Link></li>
              <li><Link to="/" onClick={() => setIsOpen(false)}>LÍNEAS</Link></li>
              <li><Link to="/" onClick={() => setIsOpen(false)}>ZONAS</Link></li>
              <li><Link to="/" onClick={() => setIsOpen(false)}>CARGAS</Link></li>
            </ul>
        </nav>
    </header>
  );
};

export default Navbar;