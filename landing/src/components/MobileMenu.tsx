import React from 'react';
import Container from './Container';
import Button from './Button';
import { navigate } from 'astro/transitions/router';

const MobileMenu = () => {
	return (
		<div className='bg-offBlack mobile:hidden fixed z-10 w-full h-screen overflow-hidden inset-0'>
			<div className='bg-gradient-rainbow h-[4px] w-full' />
			<Container styles='h-[100%] pb-12'>
				<nav className='flex flex-col gap-[32px] h-full justify-between'>
					<div className='flex flex-col gap-[32px] mt-28'>
						<a
							href='/'
							className='font-secondary font-normal z-10 text-white text-[20px]'
						>
							Home
						</a>
						<img src={'/line.svg'} alt='line' />
						<a
							href='/docs'
							className='font-secondary font-normal z-10 text-white text-[20px]'
						>
							Docs
						</a>
						<img src={'/line.svg'} alt='line' />
						<a
							href='/blog'
							className='font-secondary font-normal z-10 text-white text-[20px]'
						>
							Blog
						</a>
						<img src={'/line.svg'} alt='line' />
						<a
							href='https://github.com/tembo-io'
							target='_blank'
							rel='noreferrer'
							className='font-secondary font-normal z-10 text-white text-[20px]'
						>
							<div className='flex gap-2 items-center'>
								<img
									src={'/github.svg'}
									alt='line'
									width={23}
									height={23}
								/>
								Github
							</div>
						</a>
					</div>

					<div className='flex flex-col gap-4'>
						<Button
							variant='gradient'
							size='lg'
							onClick={() =>
								navigate('https://accounts.tembo.io/sign-up')
							}
						>
							Sign up
						</Button>
						<Button
							variant='outline'
							size='lg'
							onClick={() => navigate('https://cloud.tembo.io')}
						>
							Login
						</Button>
					</div>
				</nav>
			</Container>
		</div>
	);
};

export default MobileMenu;
