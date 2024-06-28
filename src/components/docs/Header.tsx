import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Search from './Search';
import ProgressBar from '../ProgressBar';
import LogoLink from './LogoLink';
import cx from 'classnames';
import MobileMenu from './MobileMenu';
import type { SideBarSection } from '../../types';
import { ClerkProvider } from '@clerk/clerk-react';
import ClerkButton from '../ClerkButton';

interface Props {
	isProgressBar?: boolean;
	sideBarMenuSections: SideBarSection[];
	isNestedSideBar: boolean;
	currentPath: string;
}

const Header: React.FC<Props> = ({
	isProgressBar = true,
	sideBarMenuSections,
	isNestedSideBar,
	currentPath,
}) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScreenLessThan1000px, setIsScreenLessThan1000px] = useState(false);

	useEffect(() => {
		setIsScreenLessThan1000px(window.innerWidth < 1000);
		const handleResize = () => {
			const isScreenLessThan1000px = window.innerWidth < 1000;
			setIsScreenLessThan1000px(isScreenLessThan1000px);
		};

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<>
			<div className='fixed min-[1000px]:sticky top-0 overflow-hidden flex flex-col w-full z-10'>
				<nav
					className={cx(
						'border-b border-b-[#EAEAEA33] flex items-center pt-4 pb-[12px] transition duration-100 h-[74px]',
						isMenuOpen && isScreenLessThan1000px
							? 'bg-offBlack'
							: 'backdrop-blur-lg safari-blur',
					)}
				>
					<div className='container px-[20px] mobile:px-8 max-w-container mx-auto'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-6 w-full min-[1000px]:w-max justify-between min-[1000px]:justify-start'>
								<div className='flex min-[1000px]:hidden'>
									<LogoLink width={100} />
								</div>
								<div className='flex items-center gap-4'>
									{!isMenuOpen || !isScreenLessThan1000px ? (
										<Search />
									) : null}

									<div className='flex min-[1000px]:hidden'>
										<button
											onClick={() => {
												(document.body.style.overflow =
													!isMenuOpen
														? 'hidden'
														: 'scroll'),
													setIsMenuOpen(!isMenuOpen);
											}}
											className={cx(
												'flex flex-col gap-[2.5px] items-center justify-center bg-neon hover:bg-[#D1E278] rounded-full w-[32.57px] h-[32.57px] z-50',
												isMenuOpen ? 'p-2' : 'p-2.5',
											)}
										>
											{isMenuOpen ? (
												<>
													<img
														src={'/x.svg'}
														alt='close icon'
													/>
												</>
											) : (
												<>
													<div className='bg-[#292D32] rounded-full w-full h-[1.5px]' />
													<div className='bg-[#292D32] rounded-full w-full h-[1.5px]' />
													<div className='bg-[#292D32] rounded-full w-full h-[1.5px]' />
												</>
											)}
										</button>
									</div>
								</div>
							</div>
							<div className='max-[1000px]:hidden flex items-center gap-8'>
								<a href='/' target='_blank' rel='noreferrer'>
									Tembo.io
								</a>
								<a
									href='/blog'
									target='_blank'
									rel='noreferrer'
								>
									Blog
								</a>
								<a
									href='https://github.com/tembo-io/tembo'
									target='_blank'
									rel='noreferrer'
								>
									<img
										src='/github.svg'
										alt='github'
										width={20}
										height={20}
									/>
								</a>
								<ClerkProvider
									publishableKey={
										import.meta.env
											.PUBLIC_VITE_CLERK_PUBLISHABLE_KEY!
									}
								>
									<ClerkButton />
								</ClerkProvider>
							</div>
						</div>
					</div>
				</nav>
				{isProgressBar && (!isMenuOpen || !isScreenLessThan1000px) && (
					<ProgressBar
						scrollContainerId='docs-content'
						parentContainerId='tembo-document'
						isScrollingWindow={isScreenLessThan1000px}
					/>
				)}
			</div>
			{isMenuOpen && (
				<MobileMenu
					sideBarMenuSections={sideBarMenuSections}
					isNestedSideBar={isNestedSideBar}
					currentPath={currentPath}
				/>
			)}
		</>
	);
};

export default Header;
