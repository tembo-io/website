import React, { useState } from 'react';
import cx from 'classnames';

interface Item {
	heading: string;
	content: string;
}

interface Props {
	items: Item[];
}

const Accordion: React.FC<Props> = ({ items }) => {
	const [openIndexes, setOpenIndexes] = useState<number[]>([]);

	const handleClick = (index: number) => {
		setOpenIndexes((previous) => {
			if (previous.includes(index))
				return previous.filter((i) => i !== index);
			return [...previous, index];
		});
	};

	return (
		<ul className='mt-14 flex flex-col gap-4'>
			{items.map((item, i) => (
				<li
					key={`faq-${i}`}
					className='p-6 rounded-2xl border-[0.5px] border-white border-opacity-20 bg-white bg-opacity-[0.06] customXs:px-6 customXs:py-10'
				>
					<div className='flex justify-between items-center h-full'>
						<h3 className='font-secondary font-medium text-white text-[15px] leading-[18px] tracking-[0.472px] customXs:text-[23px] customXs:leading-[28px]'>
							{item.heading}
						</h3>
						<button
							onClick={() => handleClick(i)}
							className='shrink-0'
						>
							{openIndexes.includes(i) ? (
								<img src='/minus.svg' alt='minus symbol' />
							) : (
								<img src='/plus.svg' alt='plus symbol' />
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
						<div className='overflow-hidden'>
							<p className='pt-10 font-secondary font-normal text-white text-[15px] leading-[22px] tracking-[0.472px] opacity-80 customXs:text-[18px] customXs:leading-[27px]'>
								{item.content}
							</p>
						</div>
					</div>
				</li>
			))}
		</ul>
	);
};

export default Accordion;
