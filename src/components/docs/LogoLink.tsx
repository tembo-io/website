import React from 'react';

interface Props {
	width?: number;
	text?: string;
}

const LogoLink: React.FC<Props> = ({ width = 120, text = 'Docs' }) => {
	return (
		<a href='/docs' className='flex items-center gap-2 '>
			<img
				src='/logoWithText.svg'
				alt='tembo elephant logo and name'
				width={width}
			/>
			<span className='bg-gradient-to-r from-salmon via-purple to-lightPurple inline-block text-transparent bg-clip-text text-xs uppercase'>
				{text}
			</span>
		</a>
	);
};

export default LogoLink;
