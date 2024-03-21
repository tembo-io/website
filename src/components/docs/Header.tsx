import React, { useState } from 'react';
import Button from '../Button';
import Search from './Search';
import ProgressBar from '../ProgressBar';
import LogoLink from './LogoLink';
import { useEffect } from 'react';
import cx from 'classnames';
import { motion } from 'framer-motion';
import MobileMenu from './MobileMenu';
import type { SideBarSection } from '../../types';

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

	useEffect(() => {}, []);
	return (
		<>
			<div className='sticky top-0 overflow-hidden flex flex-col w-full z-10'>
				<nav className='border-b border-b-[#EAEAEA33] flex items-center pt-4 pb-[12px] transition duration-100 backdrop-blur-lg safari-blur h-[74px]'>
					<div className='container px-8 max-w-container mx-auto'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-6 w-full min-[1125px]:w-max justify-between min-[1125px]:justify-start'>
								<div className='flex min-[1125px]:hidden'>
									<LogoLink width={100} />
								</div>
								<div className='flex items-center gap-4'>
									{!isMenuOpen && <Search />}

									<div className='flex min-[1125px]:hidden'>
										<button
											onClick={() => {
												(
													document.getElementById(
														'docs-content',
													) as HTMLElement
												).style.overflow = !isMenuOpen
													? 'hidden'
													: 'scroll';
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
							<div className='max-[1125px]:hidden flex items-center gap-8'>
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
								<Button
									variant='neon'
									link='https://cloud.tembo.io'
								>
									Try Free
								</Button>
							</div>
						</div>
					</div>
				</nav>
				{isProgressBar && !isMenuOpen && (
					<ProgressBar
						scrollContainerId='docs-content'
						parentContainerId='tembo-document'
					/>
				)}
			</div>
			<motion.div
				animate={isMenuOpen ? 'open' : 'closed'}
				variants={variants}
			>
				{isMenuOpen && (
					<MobileMenu
						sideBarMenuSections={sideBarMenuSections}
						isNestedSideBar={isNestedSideBar}
						currentPath={currentPath}
					/>
				)}
			</motion.div>
		</>
	);
};

export default Header;
