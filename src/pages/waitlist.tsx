import React from 'react';
import clsx from 'clsx';
// import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './waitlist.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import LayoutBackdrop from '../components/LayoutBackdrop';
import Footer from '../components/Footer';

export default function Waitlist(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <LayoutBackdrop>
      <div className="relative flex flex-col flex-1 min-h-screen">
        <section className="content-margin flex-1">
          <h1 className="pt-24 text-7xl font-display font-bold">
            Request Access
          </h1>
          <p className="mt-6 text-2xl lg:w-1/2 font-body">
            Join our private beta waitlist and our team will reach out to you as soon as possible.
          </p>
          {/* TODO: send form submission to backend to log waitlist */}
          <form className={styles.waitlistForm} method="post">
            <label className={styles.waitlistLabel} htmlFor="email">Email Address</label>
            <input className={styles.waitlistInput} type="text" name="email" />
            <label className={styles.waitlistLabel} htmlFor="company">Company</label>
            <input className={styles.waitlistInput} type="text" name="company" />
            <div className={clsx(styles.waitlistInput, "mb-16")}>
              <select className="bg-transparent border-none font-body text-xl w-full mb-4" name="provider">
                <option value="">Current Postgres provider</option>
                <option value="Amazon RDS">Amazon RDS</option>
                <option value="Amazon Aurora">Amazon Aurora</option>
                <option value="Azure PostgreSQL">Azure PostgreSQL</option>
                <option value="Google Cloud SQL">Google Cloud SQL</option>
                <option value="Self-managed">Self-managed</option>
                <option value="Heroku">Heroku</option>
                <option value="Digital Ocean">Digital Ocean</option>
                <option value="Aiven">Aiven</option>
                <option value="Other">Other</option>
                <option value="Not using Postgres">Not using Postgres</option>
              </select>
            </div>
            <button className="bg-transparent border-none" type="submit">
              <img src={useBaseUrl("img/request-cta.svg")} />
            </button>
          </form>
        </section>
        <Footer className={styles.footer} hideCTA />
      </div>
    </LayoutBackdrop>
  );
}
