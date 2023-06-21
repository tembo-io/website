import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.header}>
      <h2 className={styles.headerLogo}>
        <img src="@site/static/img/logo-color.png" />
        tembo
      </h2>
      <div className="md:flex hidden">
        <a className={styles.link}>Blog</a>
        <span className={styles.headerDivider}>/</span>
        <a className={styles.link}>Docs</a>
        <span className={styles.headerDivider}>/</span>
        <a className={styles.link}>Waitlist</a>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <main className="dark:bg-black">
        <div className="relative">
          <section className={clsx(styles.section, styles.hero)}>
            <header className={styles.header}>
              <h2 className={styles.headerLogo}>
                <img src="@site/static/img/logo-color.png" />
                tembo
              </h2>
              <div className="md:flex hidden">
                <a className={styles.link}>Blog</a>
                <span className={styles.headerDivider}>/</span>
                <a className={styles.link}>Docs</a>
                <span className={styles.headerDivider}>/</span>
                <a className={styles.link}>Waitlist</a>
              </div>
            </header>
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
          <footer className={clsx(styles.footer, "absolute")}>
            <button className={styles.CTA}></button>
            <div className="flex flex-col flex-1 justify-center">
              <p className={styles.footerCallout}>
                We Believe Everything Is <br /> Possible With <span className="font-bold">POSTGRES</span>
              </p>
              <a className={clsx(styles.joinCTA, "mx-auto mt-28")} href="./waitlist.html"></a>
            </div>
            <div className={styles.footerLinks}>
              <a className={styles.link}>Careers</a>
              <img src="@site/static/img/footer-separator.svg" />
              <a className={styles.link}>Trunk</a>
              <img src="@site/static/img/footer-separator.svg" />
              <a className={styles.link}>Docs</a>
              <img src="@site/static/img/footer-separator.svg" />
              <a className={styles.link}>Twitter</a>
              <img src="@site/static/img/footer-separator.svg" />
              <a className={styles.link}>LinkedIn</a>
            </div>
          </footer>
        </div>
      </main>
    </Layout>
  );
}
