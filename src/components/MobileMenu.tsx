import { useState } from 'react';
import Container from './Container';
import Button from './Button';

const MobileMenu = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className='bg-[#0A0A0A] mid:hidden fixed z-10 w-screen h-screen overflow-hidden inset-0'>
			<div className='bg-gradient-rainbow h-[4px] w-full' />
			<Container styles='h-[100%] pb-8'>
				<nav className='flex flex-col gap-[30px] h-full justify-between w-full'>
					<div className='flex flex-col gap-[30px] mt-[100px] w-full'>
						{/* Navigation Links */}
						<div className='flex flex-col gap-[30px]'>
							<a
								href='/product'
								className='font-secondary text-white/90 hover:text-white text-[16px] transition-colors'
							>
								Product
							</a>
							<a
								href='/pricing'
								className='font-secondary text-white/90 hover:text-white text-[16px] transition-colors'
							>
								Pricing
							</a>
							<div className='h-[1px] w-full bg-white/10' />

							<a
								href='/docs'
								className='font-secondary text-white/90 hover:text-white text-[16px] transition-colors'
							>
								Docs
							</a>
							<div className='h-[1px] w-full bg-white/10' />

							<a
								href='/blog'
								className='font-secondary text-white/90 hover:text-white text-[16px] transition-colors'
							>
								Blog
							</a>
							<div className='h-[1px] w-full bg-white/10' />

							<a
								href='https://github.com/tembo-io/tembo'
								target='_blank'
								rel='noreferrer'
								className='font-secondary text-white/90 hover:text-white text-[16px] transition-colors'
							>
								<div className='flex gap-2 items-center'>
									<img
										src='/github.svg'
										alt='github'
										width={23}
										height={23}
										className='opacity-90'
									/>
									Github
								</div>
							</a>
						</div>
					</div>

					{/* Buttons */}
					<div className='flex flex-col gap-4'>
						<Button
							variant='neon'
							size='lg'
							isLinkTag={true}
							link='https://cloud.tembo.io/sign-up'
						>
							Sign up
						</Button>
						<Button
							variant='ghost'
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
