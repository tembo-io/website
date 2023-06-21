import React from 'react';
import LayoutProvider from '@theme/Layout/Provider';
import Navbar from '@theme/Navbar';
import styles from './styles.module.css'
import clsx from 'clsx';

// Customized version of Layout component with gradient background
export default function LayoutBackdrop({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <LayoutProvider>
      <main className={clsx(styles.backdrop, "backdrop-nav", "dark:bg-black")}>
        <Navbar />
        {children}
      </main>
    </LayoutProvider>
  )
}