import React from 'react';
import Button from '../Button';
import Search from './Search';
import ProgressBar from '../ProgressBar';
import LogoLink from './LogoLink';

interface Props {
	isProgressBar?: boolean;
}

const Header: React.FC<Props> = ({ isProgressBar = true }) => {
	return (
		<div className='sticky top-0 z-10 overflow-hidden flex flex-col w-full'>
			<nav className='border-b border-b-[#EAEAEA33] flex items-center pt-4 pb-[12px] transition duration-100 backdrop-blur-lg safari-blur'>
				<div className='container px-8 max-w-container mx-auto'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-6'>
							<div className='flex min-[1125px]:hidden'>
								<LogoLink width={100} />
							</div>
							<Search />
						</div>
						<div className='hidden min-[1125px]:flex items-center gap-8'>
							<a href='/' target='_blank' rel='noreferrer'>
								Tembo.io
							</a>
							<a href='/blog' target='_blank' rel='noreferrer'>
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
			{isProgressBar && (
				<ProgressBar
					scrollContainerId='docs-content'
					parentContainerId='tembo-document'
				/>
			)}
		</div>
	);
};

export default Header;