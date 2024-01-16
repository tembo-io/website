import React from 'react';
import LayoutProvider from '@theme/Layout/Provider';
import Navbar from '@theme/Navbar';
import styles from './styles.module.css';
import clsx from 'clsx';

// Customized version of Layout component with gradient background
export default function LayoutBackdrop({
	children,
	waitlist = false,
}: {
	children: React.ReactNode;
	waitlist: boolean;
}): JSX.Element {
	console.log(waitlist, styles.waitlistBackdrop);
	return (
		<LayoutProvider>
			<main
				className={clsx(
					styles.backdrop,
					'backdrop-nav',
					'dark:bg-black',
					waitlist ? styles.waitlistBackdrop : null,
				)}
			>
				<Navbar />
				{children}
			</main>
		</LayoutProvider>
	);
}
