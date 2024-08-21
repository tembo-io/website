import React, { useState } from 'react';
import cx from 'classnames';

interface Item {
	heading: string;
	content: string | React.ReactNode;
}

interface Props {
	items: Item[];
}

const ArrowAccordion: React.FC<Props> = ({ items }) => {
	const [openIndexes, setOpenIndexes] = useState<number[]>([]);

	const handleClick = (index: number) => {
		console.log('hello');
		setOpenIndexes((previous) => {
			if (previous.includes(index))
				return previous.filter((i) => i !== index);
			return [...previous, index];
		});
	};

	return (
		<ul className='mt-14 flex flex-col gap-4 z-50'>
			{items.map((item, i) => (
				<li
					key={`faq-${i}`}
					className=''
					onClick={() => handleClick(i)}
				>
					<div className='flex justify-between items-center h-full'>
						<h3 className='font-bold text-white text-xl z-10'>
							{item.heading}
						</h3>
						<button className='shrink-0 z-40'>
							{openIndexes.includes(i) ? (
								<img src='/arrow-up.svg' alt='up arrow' />
							) : (
								<img src='/arrow-down.svg' alt='down arrow' />
							)}
						</button>
					</div>
					<div
						className={cx(
							'motion-reduce:transition-none transition-grid-template-rows ease-in-out duration-275 grid',
							openIndexes.includes(i)
								? 'grid-rows-[1fr]'
								: 'grid-rows-[0fr]',
						)}
					>
						<div className='overflow-hidden z-10'>
							<p className='pt-6 text-lightGrey font-normal font-secondary text-sm'>
								{item.content}
							</p>
						</div>
					</div>
					<hr className='my-6 bg-[#EBEAE7]/[0.05]' />
				</li>
			))}
		</ul>
	);
};

export default ArrowAccordion;
