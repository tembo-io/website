import React from 'react';

const Logo = () => {
	return (
		<a
			href='/'
			className='flex flex-row focus:outline-none transition hover:scale-105 duration-300 ease-in-out delay-70 z-50'
		>
			<img
				src='/logoWithText.svg'
				alt='tembo logo'
				className='w-[105px] mobile:w-[124px]'
			/>
			<img
				src='/trademark.svg'
				alt='trademark'
				className='mt-5 lg:mt-6 h-[5px] w-[7px]'
			/>
		</a>
	);
};

export default Logo;
