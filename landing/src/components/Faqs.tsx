import React from 'react';
import Accordion from './Accordion';

const faqs = [
	{
		heading: 'Lorem ipsum dolor sit amet consectetur?',
		content:
			'Lorem ipsum dolor sit amet consectetur. Massa eget dictumst senectus phasellus ultrices. Odio gravida mauris placerat suspendisse penatibus sit justo placerat praesent. Odio dapibus vitae magna nulla. Vulputate pharetra vitae pellentesque amet. Amet mi lacus et hendrerit est nunc quam arcu. Consectetur enim eu eget mauris commodo dictum egestas velit. Odio arcu turpis parturient semper sit congue cursus faucibus dui. Dolor viverra vel enim lorem. Auctor purus commodo tellus tristique id ut placerat. Hendrerit nunc vel elementum congue euismod enim cum ornare.',
	},
	{
		heading: 'Lorem ipsum dolor sit amet consectetur?',
		content:
			'Lorem ipsum dolor sit amet consectetur. Massa eget dictumst senectus phasellus ultrices. Odio gravida mauris placerat suspendisse penatibus sit justo placerat praesent. Odio dapibus vitae magna nulla. Vulputate pharetra vitae pellentesque amet. Amet mi lacus et hendrerit est nunc quam arcu. Consectetur enim eu eget mauris commodo dictum egestas velit. Odio arcu turpis parturient semper sit congue cursus faucibus dui. Dolor viverra vel enim lorem. Auctor purus commodo tellus tristique id ut placerat. Hendrerit nunc vel elementum congue euismod enim cum ornare.',
	},
	{
		heading: 'Lorem ipsum dolor sit amet consectetur?',
		content:
			'Lorem ipsum dolor sit amet consectetur. Massa eget dictumst senectus phasellus ultrices. Odio gravida mauris placerat suspendisse penatibus sit justo placerat praesent. Odio dapibus vitae magna nulla. Vulputate pharetra vitae pellentesque amet. Amet mi lacus et hendrerit est nunc quam arcu. Consectetur enim eu eget mauris commodo dictum egestas velit. Odio arcu turpis parturient semper sit congue cursus faucibus dui. Dolor viverra vel enim lorem. Auctor purus commodo tellus tristique id ut placerat. Hendrerit nunc vel elementum congue euismod enim cum ornare.',
	},
];

const Faqs: React.FC = () => {
	return (
		<>
			<h2 className='font-bold text-pricingGreen text-[32px] leading-[40px] tracking-[0.54px] [text-shadow:0px_0px_81px_#000]'>
				Frequently Asked Questions
			</h2>
			<Accordion items={faqs} />
		</>
	);
};

export default Faqs;
