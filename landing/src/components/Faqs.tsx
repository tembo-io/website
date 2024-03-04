import React from 'react';
import Accordion from './Accordion';

const faqs = [
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
		heading: 'Can Tembo be hosted on my own infrastructure?',
		content:
			'Yes! Tembo is open-source on Github: https://github.com/tembo-io/tembo',
	},
];

const Faqs: React.FC = () => {
	return (
		<div className='z-50'>
			<h2 className='font-bold text-pricingGreen text-[32px] leading-[40px] tracking-[0.54px] [text-shadow:0px_0px_81px_#000] z-50'>
				Frequently Asked Questions
			</h2>
			<Accordion items={faqs} />
		</div>
	);
};

export default Faqs;
