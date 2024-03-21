import React, { useState } from 'react';
import { Command } from 'cmdk';

interface Props {
	title: string;
	label?: string;
	url: string;
	excerpt: string;
}

const SearchItem: React.FC<Props> = ({ title, url, label }) => {
	const [isHover, setIsHover] = useState(false);

	return (
		<a
			href={url}
			rel='noreferrer'
			onMouseEnter={() => setIsHover(true)}
			onMouseLeave={() => setIsHover(false)}
		>
			<Command.Item className='flex items-center justify-between gradient-search-item bg-mwasi border border-[#EAEAEA33] text-[16px] text-md rounded-2xl p-4 w-full text-white'>
				<div className='flex flex-col gap-2'>
					{label && (
						<div className='rounded-full border border-neon text-lightNeon font-semibold bg-neon bg-opacity-10 w-max px-2 h-[30px] flex items-center justify-center'>
							<p className='text-[10px]'>{label}</p>
						</div>
					)}
					<span className='bg-gradient-to-r from-salmon via-purple to-lightPurple inline-block text-transparent bg-clip-text font-bold'>
						{title}
					</span>
				</div>

				{isHover && (
					<img
						src='/arrow-right.svg'
						height={14}
						width={14}
						alt='chevron right arrow'
						className='transition-all duration-150 ease-in-out'
					/>
				)}
			</Command.Item>
		</a>
	);
};

export default SearchItem;
