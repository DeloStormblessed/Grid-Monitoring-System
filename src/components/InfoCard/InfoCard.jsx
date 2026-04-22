import React from 'react';
import styles from './InfoCard.module.css';

const InfoCard = ({ title, value, className }) => {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      <p className={styles.title}>{title}</p>
      <h3 className={styles.value}>{value}</h3>
    </div>
  );
};

export default InfoCard;