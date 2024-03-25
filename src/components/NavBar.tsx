import React, { useEffect, useState } from 'react';
import Container from './Container';
import Button from './Button';
import cx from 'classnames';
import { navigate } from 'astro:transitions/client';
import MobileMenu from './MobileMenu';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { set } from 'astro/zod';

interface Props {
	currentPage: string;
	isProgressBar?: boolean;
	isBanner?: boolean;
}

const NavBar: React.FC<Props> = ({
	currentPage,
	isProgressBar = false,
	isBanner = false,
}) => {
	const [scrollY, setScrollY] = useState(0);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [progressWidth, setProgressWidth] = useState(101);
	const [
		isScreenGreaterThanOrEqualTo900px,
		setIsScreenGreaterThanOrEqualTo900px,
	] = useState(false);

	const variants = {
		open: {
			opacity: 1,
			transition: {
				ease: 'linear',
				duration: 0.15,
			},
		},
		closed: { opacity: 0 },
	};

	useEffect(() => {
		const handleScroll = () => {
			if (isProgressBar) {
				const blogPost = document.getElementById('tembo-blog-post');
				const { top, height } = (
					blogPost as any
				)?.getBoundingClientRect();
				let scrollDistance = -top;

				let progressPercentage =
					(scrollDistance /
						(height - document.documentElement.clientHeight)) *
					100;
				setProgressWidth(progressPercentage);
			}

			setScrollY(window.scrollY);
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll);

		const handleResize = () => {
			const isScreenGreaterThanOrEqualTo900px = window.innerWidth >= 900;
			setIsScreenGreaterThanOrEqualTo900px(
				isScreenGreaterThanOrEqualTo900px,
			);
			if (isScreenGreaterThanOrEqualTo900px) {
				document.body.style.overflow = 'scroll';
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	let isActive = progressWidth <= 100;

	return (
		<div
			className={cx(
				'fixed top-0 w-full z-50 transition duration-100',
				scrollY > 20 ? 'backdrop-blur-lg safari-blur' : '',
				isMenuOpen && !isScreenGreaterThanOrEqualTo900px && 'h-screen',
			)}
		>
			{isBanner && (
				<a href='/blog/postgres-14-and-16'>
					<div
						className={`flex items-center text-[12px] min-[400px]:text-sm justify-center gap-4 news-banner-container top-0 w-full text-center bg-[#131313] shadow-[0_-20px_36px_0_rgba(240,102,141,0.13)_inset] text-white px-[20px] mobile:px-[95px] py-3.5 sm:py-2.5 z-50`}
					>
						<span className='truncate'>
							Announcing Support for Postgres 14 and 16
						</span>
						<span className='bg-gradient-to-r from-salmon via-purple to-lightPurple inline-block text-transparent bg-clip-text font-semibold text-sm whitespace-nowrap'>
							Read more
						</span>
					</div>
				</a>
			)}

			<div className='bg-gradient-rainbow h-[4px] w-full' />
			<Container styles='relative'>
				<nav
					className={cx(
						'flex w-full items-center justify-between transition-all duration-100 relative',
						scrollY > 20 &&
							(!isMenuOpen || isScreenGreaterThanOrEqualTo900px)
							? 'py-3 mid:py-4'
							: 'py-8',
					)}
				>
					<Logo />
					<div className='mid:flex hidden items-center gap-12 m-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
						<a
							href='/'
							className={cx(
								'font-secondary font-medium z-10',
								currentPage == '/'
									? 'text-neon'
									: 'text-white opacity-70',
							)}
						>
							Home
						</a>
						<a
							href='/pricing'
							className={cx(
								'font-secondary font-medium z-10',
								currentPage == '/pricing' ||
									currentPage == '/pricing/'
									? 'text-neon'
									: 'text-white opacity-70',
							)}
							target='_blank'
							rel='noreferrer'
						>
							Pricing
						</a>
						<a
							href='/docs'
							className={cx(
								'font-secondary font-medium z-10',
								currentPage == '/docs' ||
									currentPage == '/docs/'
									? 'text-neon'
									: 'text-white opacity-70',
							)}
						>
							Docs
						</a>
						<a
							href='/blog'
							className={cx(
								'font-secondary font-medium z-10',
								currentPage == '/blog' ||
									currentPage == '/blog/'
									? 'text-neon'
									: 'text-white opacity-70',
							)}
						>
							Blog
						</a>
					</div>
					<div className='hidden mid:flex gap-8 items-center self-end'>
						<a
							href='https://github.com/tembo-io/tembo'
							target='_blank'
							className={cx(
								'font-secondary font-medium z-10 flex items-center gap-2 ',
								'text-white opacity-70',
							)}
						>
							<img
								src='/github.svg'
								alt='github icon'
								className='w-[20px] h-[20px]'
							/>
							Github
						</a>
						<Button
							variant='neon'
							styles='z-100'
							onClick={() => navigate('https://cloud.tembo.io')}
						>
							Try Free
						</Button>
					</div>
					<button
						onClick={() => {
							document.body.style.overflow = !isMenuOpen
								? 'hidden'
								: 'scroll';
							setIsShowingBanner(false);
							setIsMenuOpen(!isMenuOpen);
						}}
						className={cx(
							'mid:hidden flex flex-col gap-[2.5px] items-center justify-center bg-neon hover:bg-[#D1E278] rounded-full w-[32.57px] h-[32.57px] z-50',
							isMenuOpen ? 'p-2' : 'p-2.5',
						)}
					>
						{isMenuOpen ? (
							<>
								<img src={'/x.svg'} alt='close icon' />
							</>
						) : (
							<>
								<div className='bg-[#292D32] rounded-full w-full h-[1.5px]' />
								<div className='bg-[#292D32] rounded-full w-full h-[1.5px]' />
								<div className='bg-[#292D32] rounded-full w-full h-[1.5px]' />
							</>
						)}
					</button>
				</nav>
			</Container>
			{scrollY > 50 && isProgressBar && (
				<div
					className={cx(
						'w-full flex justify-start relative',
						scrollY > 50 && 'h-[2.5px]',
					)}
				>
					<div
						className='h-full top-0 bottom-0 right-0 absolute w-screen bg-salmon will-change-transform transition-opacity duration-[40] ease-linear'
						style={{
							transform: `translate3d(${isActive ? progressWidth - 100 + '%' : '0'},0,0)`,
							opacity: isActive ? 1 : 0,
						}}
					></div>
				</div>
			)}
			<div
				className={cx(
					'absolute bottom-0 flex h-[1px] w-full flex-row items-center justify-center opacity-100 shine',
					scrollY > 20 ? 'flex' : 'hidden',
				)}
			/>
			<motion.div
				animate={isMenuOpen ? 'open' : 'closed'}
				variants={variants}
			>
				{isMenuOpen && <MobileMenu />}
			</motion.div>
		</div>
	);
};

export default NavBar;
