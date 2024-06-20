import Container from './Container';
import Button from './Button';
import { navigate } from 'astro:transitions/client';

const MobileMenu = () => {
	return (
		<div className='bg-offBlack mid:hidden fixed z-10 w-screen h-screen overflow-hidden inset-0'>
			<div className='bg-gradient-rainbow h-[4px] w-full' />
			<Container styles='h-[100%] pb-12'>
				<nav className='flex flex-col gap-[20px] h-full justify-between w-full'>
					<div className='flex flex-col gap-[20px] mt-28 w-full'>
						<a
							href='/'
							className='font-secondary font-normal z-10 text-white text-[16px]'
						>
							Home
						</a>
						<img src={'/line.svg'} alt='line' />
						<a
							href='/pricing'
							className='font-secondary font-normal z-10 text-white text-[16px]'
						>
							Pricing
						</a>
						<img src={'/line.svg'} alt='line' />
						<a
							href='/docs'
							className='font-secondary font-normal z-10 text-white text-[16px]'
						>
							Docs
						</a>
						<img src={'/line.svg'} alt='line' />
						<a
							href='/blog'
							className='font-secondary font-normal z-10 text-white text-[16px]'
						>
							Blog
						</a>
						<img src={'/line.svg'} alt='line' />
						<a
							href='https://github.com/tembo-io/tembo'
							target='_blank'
							rel='noreferrer'
							className='font-secondary font-normal z-10 text-white text-[16px]'
						>
							<div className='flex gap-2 items-center'>
								<img
									src={'/github.svg'}
									alt='github'
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
							isLinkTag={true}
							link='https://cloud.tembo.io/sign-up'
						>
							Sign up
						</Button>
						<Button
							variant='outline'
							size='lg'
							isLinkTag={true}
							link='https://cloud.tembo.io/sign-in'
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
