import React, { Fragment } from 'react';
import clsx from 'clsx';
// import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { SimpleFooter } from '@docusaurus/theme-common';

import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';

interface FooterProps {
  hideCTA?: boolean;
  className?: string;
}

export default function Footer({ className, hideCTA }: FooterProps): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  const footerLinks =  (siteConfig.themeConfig.footer as SimpleFooter).links ?? []
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
        {footerLinks.map((link, i) => (
          <Fragment key={i}>
            <Link href={link.href} className={clsx(styles.link, "dark:text-black text-white")}>{link.label}</Link>
            {i < footerLinks.length - 1 && <img src={useBaseUrl("img/footer-separator.svg")} />}
          </Fragment>
        ))}
        
      </div>
    </footer>
  );
}
