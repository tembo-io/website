import React from 'react';
import clsx from 'clsx';
// import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface FooterProps {
  hideCTA?: boolean;
  className?: string;
}

export default function Footer({ className, hideCTA }: FooterProps): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <footer className={clsx(styles.footer, className)}>
      {hideCTA ? null : <button className={clsx(styles.cta, "bg-transparent border-none")} />}
      <div className="flex flex-col flex-1 justify-center">
        <p className={styles.footerCallout}>
          We Believe Everything Is <br /> Possible With <span className="font-bold">POSTGRES</span>
        </p>
        <a className={clsx(styles.joinCTA, "mx-auto mt-28")} href="./waitlist.html"></a>
      </div>
      <div className={styles.footerLinks}>
        <a className={clsx(styles.link, "dark:text-black text-white")}>Careers</a>
        <img src={useBaseUrl("img/footer-separator.svg")} />
        <a className={clsx(styles.link, "dark:text-black text-white")}>Trunk</a>
        <img src={useBaseUrl("img/footer-separator.svg")} />
        <a className={clsx(styles.link, "dark:text-black text-white")}>Docs</a>
        <img src={useBaseUrl("img/footer-separator.svg")} />
        <a className={clsx(styles.link, "dark:text-black text-white")}>Twitter</a>
        <img src={useBaseUrl("img/footer-separator.svg")} />
        <a className={clsx(styles.link, "dark:text-black text-white")}>LinkedIn</a>
      </div>
    </footer>
  );
}
