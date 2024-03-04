import React from 'react';
import Accordion from './Accordion';

const faqs = [
	{
		heading: 'How can I estimate my costs for Tembo use?',
		content:
			'Lorem ipsum dolor sit amet consectetur. Massa eget dictumst senectus phasellus ultrices. Odio gravida mauris placerat suspendisse penatibus sit justo placerat praesent. Odio dapibus vitae magna nulla. Vulputate pharetra vitae pellentesque amet. Amet mi lacus et hendrerit est nunc quam arcu. Consectetur enim eu eget mauris commodo dictum egestas velit. Odio arcu turpis parturient semper sit congue cursus faucibus dui. Dolor viverra vel enim lorem. Auctor purus commodo tellus tristique id ut placerat. Hendrerit nunc vel elementum congue euismod enim cum ornare.',
	},
	{
		heading: 'When will I be billed?',
		content: 'Our Production plan charges at the end of each month.',
	},
	{
		heading:
			'Is the Hobby Tier free forever? What sort of workloads can I run on it?',
		content:
			'The Hobby Tier will be free forever. The purpose of the Hobby Tier is to prototype a side-project, to try out new use-cases with Tembo Cloud, or run some hobby projects ongoing but in an unsupported and ‘test’ sort of way.',
	},
	{
		heading: 'Are annual plans available?',
		content:
			'Yes, please reach out to brad@tembo.io to inquire about annual plans that include hefty discounts.',
	},
	{
		heading: 'Do you have plans specifically for early-stage startups?',
		content:
			'Yes! please visit our Tembo for Startups site (https://tembo.io/for-startups/) and follow instructions. We offer up to 50% off for the entire first year, and discounts ongoing for startups who are part of a Partner Organization in our Partner network.',
	},
	{
		heading:
			"Am I able to cap my spend each month so I don't accidentally spend way more than I intend to?",
		content:
			'Lorem ipsum dolor sit amet consectetur. Massa eget dictumst senectus phasellus ultrices. Odio gravida mauris placerat suspendisse penatibus sit justo placerat praesent. Odio dapibus vitae magna nulla. Vulputate pharetra vitae pellentesque amet. Amet mi lacus et hendrerit est nunc quam arcu. Consectetur enim eu eget mauris commodo dictum egestas velit. Odio arcu turpis parturient semper sit congue cursus faucibus dui. Dolor viverra vel enim lorem. Auctor purus commodo tellus tristique id ut placerat. Hendrerit nunc vel elementum congue euismod enim cum ornare.',
	},
];

const Faqs: React.FC = () => {
	return (
		<div className='z-100'>
			<h2 className='font-bold text-pricingGreen text-[32px] leading-[40px] tracking-[0.54px] [text-shadow:0px_0px_81px_#000]'>
				Frequently Asked Questions
			</h2>
			<Accordion items={faqs} />
		</div>
	);
};

export default Faqs;
