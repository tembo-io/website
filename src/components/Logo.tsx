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
				className='w-[105px] mobile:w-[130px]'
			/>
		</a>
	);
};

export default Logo;
