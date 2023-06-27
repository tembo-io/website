import React, {  useState } from 'react';
import clsx from 'clsx';
// import Link from '@docusaurus/Link';

import styles from './waitlist.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import LayoutBackdrop from '../components/LayoutBackdrop';
import Footer from '../components/Footer';

export default function Waitlist(): JSX.Element {
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [currentProvider, setCurrentProvider] = useState("")
  const [formCompleted, setFormCompleted] = useState(false)

  const submitForm = (e) => {
    e.preventDefault()

    prefinery('addUser', {
      email,
      custom_var1: currentProvider,
      custom_var2: company,
    }, (user) => {
      window.scrollTo(0, 0)
      setFormCompleted(true)
    })
  }

  return (
    <LayoutBackdrop waitlist>
      <div className="relative flex flex-col flex-1 min-h-screen">
        <section className="content-margin flex-1">

          {formCompleted ?
            <>
              <p className="text-xl mt-20">We'll be in touch soon!</p>
              <h1 className={clsx(styles.successMessage, "text-6xl font-headline font-bold mb-80")}>
                Get ready to love your database.
              </h1>
            </> :
            <>
              <h1 className="pt-24 text-7xl font-headline font-bold">
                Request Access
              </h1>
              <p className="mt-6 text-2xl lg:w-1/2 font-body">
                Join our private beta waitlist and our team will reach out to you as soon as possible.
              </p>
            </>
          }

          <div className={clsx(formCompleted ? "hidden" : "")}>
            <form className={clsx(styles.waitlistForm)} onSubmit={submitForm}>
              <label className={styles.waitlistLabel} htmlFor="email">Email Address</label>
              <input className={styles.waitlistInput} type="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className={styles.waitlistLabel} htmlFor="company">Company</label>
              <input className={styles.waitlistInput} type="text" name="company" required value={company} onChange={(e) => setCompany(e.target.value)} />
              <div className={clsx(styles.waitlistInput, "mb-16")}>
                <select className="bg-transparent border-none font-body text-xl w-full mb-4" name="provider" required value={currentProvider} onChange={(e) => setCurrentProvider(e.target.value)}>
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
              <button className={clsx(styles.waitlistButton, "bg-transparent border-none p-0 text-left")} type="submit">
                <img src={useBaseUrl("img/request-cta.svg")} />
              </button>
            </form>
          </div>
        </section>
        <Footer className={styles.footer} hideCTA />
      </div>
    </LayoutBackdrop>
  );
}
