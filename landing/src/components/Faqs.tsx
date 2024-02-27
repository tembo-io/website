import React, { useState } from 'react';
import cx from 'classnames';

interface Faq {
	question: string;
	answer: string;
}

const content: Faq[] = [
	{
		question: 'Lorem ipsum dolor sit amet consectetur?',
		answer: 'Lorem ipsum dolor sit amet consectetur. Massa eget dictumst senectus phasellus ultrices. Odio gravida mauris placerat suspendisse penatibus sit justo placerat praesent. Odio dapibus vitae magna nulla. Vulputate pharetra vitae pellentesque amet. Amet mi lacus et hendrerit est nunc quam arcu. Consectetur enim eu eget mauris commodo dictum egestas velit. Odio arcu turpis parturient semper sit congue cursus faucibus dui. Dolor viverra vel enim lorem. Auctor purus commodo tellus tristique id ut placerat. Hendrerit nunc vel elementum congue euismod enim cum ornare.',
	},
	{
		question: 'Lorem ipsum dolor sit amet consectetur?',
		answer: 'Lorem ipsum dolor sit amet consectetur. Massa eget dictumst senectus phasellus ultrices. Odio gravida mauris placerat suspendisse penatibus sit justo placerat praesent. Odio dapibus vitae magna nulla. Vulputate pharetra vitae pellentesque amet. Amet mi lacus et hendrerit est nunc quam arcu. Consectetur enim eu eget mauris commodo dictum egestas velit. Odio arcu turpis parturient semper sit congue cursus faucibus dui. Dolor viverra vel enim lorem. Auctor purus commodo tellus tristique id ut placerat. Hendrerit nunc vel elementum congue euismod enim cum ornare.',
	},
	{
		question: 'Lorem ipsum dolor sit amet consectetur?',
		answer: 'Lorem ipsum dolor sit amet consectetur. Massa eget dictumst senectus phasellus ultrices. Odio gravida mauris placerat suspendisse penatibus sit justo placerat praesent. Odio dapibus vitae magna nulla. Vulputate pharetra vitae pellentesque amet. Amet mi lacus et hendrerit est nunc quam arcu. Consectetur enim eu eget mauris commodo dictum egestas velit. Odio arcu turpis parturient semper sit congue cursus faucibus dui. Dolor viverra vel enim lorem. Auctor purus commodo tellus tristique id ut placerat. Hendrerit nunc vel elementum congue euismod enim cum ornare.',
	},
];

const Faqs: React.FC = () => {
	const [openIndexes, setOpenIndexes] = useState<number[]>([]);

	const handleClick = (index: number) => {
		setOpenIndexes((previous) => {
			if (previous.includes(index))
				return previous.filter((i) => i !== index);
			return [...previous, index];
		});
	};

	return (
		<>
			<h2 className='font-bold text-pricingGreen text-[32px] leading-[40px] tracking-[0.54px] [text-shadow:0px_0px_81px_#000]'>
				Frequently Asked Questions
			</h2>
			<ul className='mt-14 flex flex-col gap-4'>
				{content.map((faq, i) => (
					<li
						key={`faq-${i}`}
						className='p-6 rounded-2xl border-[0.5px] border-white border-opacity-20 bg-white bg-opacity-[0.06] customXs:px-6 customXs:py-10'
					>
						<div className='flex justify-between items-center h-full'>
							<h3 className='font-secondary font-medium text-white text-[15px] leading-[18px] tracking-[0.472px] customXs:text-[23px] customXs:leading-[28px]'>
								{faq.question}
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
									{faq.answer}
								</p>
							</div>
						</div>
					</li>
				))}
			</ul>
		</>
	);
};

export default Faqs;
