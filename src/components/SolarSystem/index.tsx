import React, { useRef } from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';
import { OrbitCanvas } from './OrbitCanvas';

export default function SolarSystem(): JSX.Element {
  return (
    <div className={styles.solarSystem}>
      <div className={clsx(styles.planet, "z-10")}></div>
      <OrbitCanvas />
    </div>
  )
}