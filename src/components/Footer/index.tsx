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
    <footer className={clsx(styles.footerWrapper, className, "relative")}>
      {hideCTA ? null : <Link href="/waitlist" className={clsx(styles.cta, "bg-transparent border-none")} />}
      <div className="flex flex-col flex-1 justify-center">
        <p className={clsx(styles.footerCallout, "relative")}>
          The Modern Data Stack is built on {' '}
          <span className="font-bold">Postgres</span>
        </p>
        <Link className={clsx(styles.joinCTA, "relative mx-auto mt-20")} target='_blank' href="https://tembo.breezy.hr/" />
      </div>
      <div className={clsx(styles.footerLinks, "relative")}>
        {footerLinks.map((link, i) => (
          <Fragment key={i}>
            <Link href={link.href} target="_blank" className={clsx(styles.link, "dark:text-black text-white")}>{link.label}</Link>
            {i < footerLinks.length - 1 && <img src={useBaseUrl("img/footer-separator.svg")} />}
          </Fragment>
        ))}
      </div>
    </footer>
  );
}
