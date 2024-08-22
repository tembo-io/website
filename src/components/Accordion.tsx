import React, { useState } from 'react';
import cx from 'classnames';

interface Item {
	heading: string;
	content: string | React.ReactNode;
}

interface Props {
	items: Item[];
	itemContainerStyles?: string;
	buttonIconHidePath: string;
	buttonIconShowPath: string;
	headerStyles: string;
	contentStyles: string;
	showSeparator?: boolean;
}

const Accordion: React.FC<Props> = ({
	items,
	itemContainerStyles = '',
	buttonIconHidePath,
	buttonIconShowPath,
	headerStyles,
	contentStyles,
	showSeparator = false,
}) => {
	const [openIndexes, setOpenIndexes] = useState<number[]>([]);

	const handleClick = (index: number) => {
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
					className={itemContainerStyles}
					onClick={() => handleClick(i)}
				>
					<div className='flex justify-between items-center h-full'>
						<h3 className={cx(headerStyles, 'z-10')}>
							{item.heading}
						</h3>
						<button className='shrink-0 z-40'>
							{openIndexes.includes(i) ? (
								<img
									src={buttonIconShowPath}
									alt='minus symbol'
								/>
							) : (
								<img
									src={buttonIconHidePath}
									alt='plus symbol'
								/>
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
							<p className={contentStyles}>{item.content}</p>
						</div>
					</div>
					{showSeparator && (
						<hr className='my-6 w-full bg-otherGrey2 border-0 h-[1px]' />
					)}
				</li>
			))}
		</ul>
	);
};

export default Accordion;
