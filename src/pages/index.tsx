import React, { useLayoutEffect } from "react"
import clsx from "clsx"
// import Link from '@docusaurus/Link';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"

import styles from "./index.module.css"
import useBaseUrl from "@docusaurus/useBaseUrl"
import LayoutBackdrop from "../components/LayoutBackdrop"
import Footer from "../components/Footer"
import SolarSystem from "../components/SolarSystem"
import Head from "@docusaurus/Head"

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()

  useLayoutEffect(() => {
    // Track scroll state for CSS animation of CTA
    const callback = () => {
      document.body.style.setProperty(
        "--scroll",
        (window.pageYOffset / window.innerHeight).toString()
      )
    }
    window.addEventListener("scroll", callback, false)

    return () => window.removeEventListener("scroll", callback)
  }, [])

  return (
    <>
      <Head>
        <script
          src="https://tag.clearbitscripts.com/v1/pk_46db31c05ac5fad3ee1f5c9122b8da26/tags.js"
          referrerpolicy="strict-origin-when-cross-origin"
        ></script>
      </Head>
      <LayoutBackdrop>
        <section className="content-margin overflow-hidden">
          <div className="relative">
            <p className="text-xl mb-2 font-body font-semibold">
              Goodbye Database Sprawl
            </p>
            <h1 className={styles.headline}>
              Hello
              <br />
              Postgres
            </h1>
            <p className="mt-2 font-body md:hidden">
              Collapse the database sprawl of the modern data stack with a
              unified developer platform.
            </p>
            <p className="mt-2 font-body hidden md:block">
              Collapse the database sprawl of the modern <br /> data stack with
              a unified developer platform.
            </p>
            <a
              className={clsx(styles.cta, styles.heroCTA, "absolute")}
              href="https://cloud.tembo.io"
            ></a>
            <div className="solarWrapper">
              <SolarSystem />
            </div>
          </div>
        </section>
        <section className={clsx(styles.content)}>
          <img
            className={clsx(
              styles.screenshot,
              styles.screenshot1,
              "z-20 md:hidden"
            )}
            src={useBaseUrl("img/home-mobile-cmp-2.png")}
          />
          <img
            className={clsx(
              styles.screenshot,
              styles.screenshot1,
              "z-20 hidden md:block"
            )}
            src={useBaseUrl("img/home-cmp-2.png")}
          />

          <div className={clsx(styles.goalText)}>
            <p className="text-base mb-4 font-display font-bold uppercase">
              The Postgres Developer Platform
            </p>
            <h2 className="md:text-5xl sm:text-3xl text-xl font-display font-normal">
              Deploy any data service on Postgres{" "}
              <span className="font-bold">with Stacks</span>
            </h2>
          </div>
          <img
            className={clsx(styles.screenshot, "md:hidden")}
            src={useBaseUrl("img/cluster-mobile-cmp-2.png")}
          />
          <img
            className={clsx(styles.screenshot, "hidden md:block")}
            src={useBaseUrl("img/cluster-cmp-2.png")}
          />
        </section>
        <Footer className={clsx(styles.indexFooter, "relative")} />
      </LayoutBackdrop>
    </>
  )
}
