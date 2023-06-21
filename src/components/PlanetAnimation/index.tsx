import React, { useRef } from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';
import { usePlanetAnimation } from './usePlanetAnimation';

export default function PlanetAnimation(): JSX.Element {
  const canvasRef = usePlanetAnimation()

  return (
    <div className={styles.planetAnimation}>
      <div className={clsx(styles.planet, "z-10")}></div>
      <canvas id="orbit-canvas" ref={canvasRef}></canvas>
    </div>
  )
}