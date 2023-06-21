import React from 'react';
import clsx from 'clsx';
// import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';

interface FooterProps {
  hideCTA?: boolean;
  className?: string;
}

export default function Footer({ className, hideCTA }: FooterProps): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <footer className={clsx(styles.footerWrapper, className)}>
      {hideCTA ? null : <Link href="/waitlist" className={clsx(styles.cta, "bg-transparent border-none")} />}
      <div className="flex flex-col flex-1 justify-center">
        <p className={styles.footerCallout}>
          We Believe Everything Is Possible With <span className="font-bold">POSTGRES</span>
        </p>
        <Link className={clsx(styles.joinCTA, "mx-auto mt-28")} href="https://tembo.breezy.hr/" />
      </div>
      <div className={styles.footerLinks}>
        <Link href="https://tembo.breezy.hr/" className={clsx(styles.link, "dark:text-black text-white")}>Careers</Link>
        <img src={useBaseUrl("img/footer-separator.svg")} />
        <Link href="https://pgtrunk.io/" className={clsx(styles.link, "dark:text-black text-white")}>Trunk</Link>
        <img src={useBaseUrl("img/footer-separator.svg")} />
        <Link href="/docs" className={clsx(styles.link, "dark:text-black text-white")}>Docs</Link>
        <img src={useBaseUrl("img/footer-separator.svg")} />
        <a className={clsx(styles.link, "dark:text-black text-white")}>Twitter</a>
        <img src={useBaseUrl("img/footer-separator.svg")} />
        <a className={clsx(styles.link, "dark:text-black text-white")}>LinkedIn</a>
      </div>
    </footer>
  );
}
