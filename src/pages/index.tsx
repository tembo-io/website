import React from 'react';
import clsx from 'clsx';
// import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './index.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import LayoutBackdrop from '../components/LayoutBackdrop';
import Footer from '../components/Footer'

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <LayoutBackdrop>
      <div className="relative">
        <section className="content-margin">
          <p className="text-xl mb-2 font-body font-semibold">Goodbye Database Sprawl</p>
          <h1 className={styles.headline}>
            Hello<br />
            Postgres
          </h1>
          <p className="mt-2 font-body">
            Collapse the database sprawl of the modern <br /> data stack with a unified developer platform.
          </p>
          <a className={clsx(styles.cta, styles.heroCTA, "absolute")} href="./waitlist.html"></a>
          <div className={styles.solarSystem}>
            <div className="planet z-10"></div>
            <canvas id="orbit-canvas"></canvas>
          </div>
        </section>
        <section className={clsx(styles.section, styles.content, "relative")}>
          <img className={clsx(styles.screenshot, styles.screenshot1, "z-20 absolute")} src={useBaseUrl("img/tembo-screenshot-1.png")} />
          <div className="text-center pt-0 pb-32">
            <p className="text-base mb-4 font-display font-bold uppercase">Our Goal</p>
            <h2 className="md:text-5xl sm:text-3xl text-xl font-display">Build a database for every need.<div className="font-bold">Tembo makes it easy.</div></h2>
          </div>
          <img className={clsx(styles.screenshot, styles.screenshot2, "bottom-0 absolute")} src={useBaseUrl("img/tembo-screenshot-2.png")}/>
        </section>
        <Footer className='absolute' />
      </div>
    </LayoutBackdrop>
  );
}
