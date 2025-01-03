import React, { useEffect, useState } from 'react';
import Container from './Container';
import cx from 'classnames';
import MobileMenu from './MobileMenu';
import { motion } from 'framer-motion';
import Logo from './Logo';
import ClerkProviderWithButton from './ClerkButton';

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

	const getButtonStyles = () => {
		if (currentPage.includes('/platform/online-transactional-processing')) {
			return 'bg-sqlBlue';
		} else if (currentPage.includes('/platform/ai')) {
			return 'bg-sqlPink';
		}

		return 'bg-neon hover:bg-[#D1E278]';
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
			{isBanner && !isMenuOpen && (
				<a href='/blog/tembo-ai'>
					<div className='flex items-center justify-center w-full bg-[#0A0A0A] py-2.5 text-xs font-medium tracking-wide z-50 transition-all duration-75'>
						<span className='flex items-center gap-2'>
							<span className='text-white/90'>
								Introducing Tembo AI
							</span>
							<span className='text-neon flex items-center gap-1'>
								Learn more
								<svg
									width='12'
									height='12'
									viewBox='0 0 12 12'
									fill='none'
									className='translate-y-[0.5px]'
								>
									<path
										d='M3.5 2L7.5 6L3.5 10'
										stroke='currentColor'
										strokeWidth='1.5'
										strokeLinecap='round'
									/>
								</svg>
							</span>
						</span>
					</div>
				</a>
			)}
			<div className='bg-gradient-rainbow h-[4px] w-full' />
			<Container styles='relative'>
				<nav
					className={cx(
						'flex w-full items-center justify-between transition-all relative',
						scrollY > 20 &&
							(!isMenuOpen || isScreenGreaterThanOrEqualTo900px)
							? 'py-2'
							: 'py-4',
					)}
				>
					<Logo />
					<div className='mid:flex hidden items-center gap-12 m-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
						<a
							href='/product'
							className={cx(
								'font-secondary font-medium text-sm z-10 transition-opacity duration-200',
								currentPage == '/product' ||
									currentPage == '/product/'
									? 'text-neon'
									: 'text-white opacity-70 hover:opacity-100',
							)}
							target='_blank'
							rel='noreferrer'
						>
							Product
						</a>
						<a
							href='/pricing'
							className={cx(
								'font-secondary font-medium text-sm z-10 transition-opacity duration-200',
								currentPage == '/pricing' ||
									currentPage == '/pricing/'
									? 'text-neon'
									: 'text-white opacity-70 hover:opacity-100',
							)}
							target='_blank'
							rel='noreferrer'
						>
							Pricing
						</a>
						<a
							href='/docs'
							className={cx(
								'font-secondary font-medium text-sm z-10 transition-opacity duration-200',
								currentPage == '/docs' ||
									currentPage == '/docs/'
									? 'text-neon'
									: 'text-white opacity-70 hover:opacity-100',
							)}
						>
							Docs
						</a>
						<a
							href='/blog'
							className={cx(
								'font-secondary font-medium text-sm z-10 transition-opacity duration-200',
								currentPage == '/blog' ||
									currentPage == '/blog/'
									? 'text-neon'
									: 'text-white opacity-70 hover:opacity-100',
							)}
						>
							Blog
						</a>
					</div>
					<div className='hidden mid:flex gap-8 items-center self-end'>
						<ClerkProviderWithButton currentPage={currentPage} />
					</div>
					<button
						onClick={() => {
							document.body.style.overflow = !isMenuOpen
								? 'hidden'
								: 'scroll';

							setIsMenuOpen(!isMenuOpen);
						}}
						className={cx(
							'mid:hidden flex flex-col gap-[2.5px] items-center justify-center rounded-full w-[32.57px] h-[32.57px] z-50',
							getButtonStyles(),
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
					'absolute bottom-0 flex h-[1px] w-full flex-row items-center justify-center opacity-100 bg-white/10',
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
