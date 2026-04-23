import React from 'react';
import styles from './HourSlider.module.css';

const HourSlider = ({ selectedHour = 0, onHourChange }) => {
  const handleSliderChange = (e) => {
    onHourChange(parseInt(e.target.value));
  };

  return (
    <div className={styles.sliderContainer}>
      <label className={styles.label}>Hora del día: </label>
      <div className={styles.sliderWrapper}>
        <span className={styles.hourValue}>{selectedHour.toString().padStart(2, '0')}:00</span>
        <input
          type="range"
          min="0"
          max="23"
          value={selectedHour}
          onChange={handleSliderChange}
          className={styles.slider}
        />
      </div>
    </div>
  );
};

export default HourSlider;
