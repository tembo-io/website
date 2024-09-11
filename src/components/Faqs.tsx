import React from 'react';
import Accordion from './Accordion';

const faqs = [
	{
		heading: 'When will I be billed?',
		content: (
			<p>
				Plans on Tembo Cloud are charged based on usage; you will
				receive your invoice at the end of each month. Self Hosted
				deployments can vary, which is why we encourage you to{' '}
				<a href={'https://tembo.io/contact/'} className='underline'>
					contact us
				</a>{' '}
				so we can work together to find the most appropriate plan.
			</p>
		),
	},
	{
		heading:
			'Is the Hobby Tier free forever? What sort of workloads can I run on it?',
		content:
			'The Hobby Tier is free forever. The purpose of the Hobby Tier is to prototype a side-project and to try out different stacks and extensions on Tembo Cloud. We recommend using it for hobby projects but not for production workloads.',
	},
	{
		heading: 'Are annual plans available?',
		content: (
			<p>
				Yes, we do provide annual plans, which offer a significant
				discount over the list price. Please{' '}
				<a href={'https://tembo.io/contact'} className='underline'>
					contact us
				</a>{' '}
				to learn more.
			</p>
		),
	},
	{
		heading: 'Do you have plans specifically for early-stage startups?',
		content: (
			<p>
				Yes! Please visit our Tembo{' '}
				<a
					href={'https://tembo.io/for-startups/'}
					className='underline'
				>
					for startups site
				</a>{' '}
				and follow the instructions. We offer up to 50% off for the
				first year, and ongoing discounts for startups who are part of a
				Partner Organization in our Partner network.
			</p>
		),
	},
	{
		heading:
			"I have a preferred cloud provider or region that I don't see on Tembo Cloud. What can I do?",
		content: (
			<p>
				We are continuously adding new regions to our Tembo Cloud
				offering. Please visit{' '}
				<a
					href={'https://roadmap.tembo.io/roadmap'}
					className='underline'
				>
					our roadmap
				</a>{' '}
				to request the regions or cloud providers you'd like. You can
				also use our Self Hosted offering, which allows you to run Tembo
				on any cloud provider or region that supports deploying a
				Kubernetes cluster.
			</p>
		),
	},
];

const Faqs: React.FC = () => {
	return (
		<>
			<h2 className='font-bold text-pricingGreen text-[32px] leading-[40px] tracking-[0.54px] [text-shadow:0px_0px_81px_#000]'>
				Frequently Asked Questions
			</h2>
			<Accordion
				itemContainerStyles='p-6 rounded-2xl border-[0.5px] border-white border-opacity-20 bg-white bg-opacity-[0.06] customXs:px-6 customXs:py-10'
				buttonIconHidePath='/plus.svg'
				buttonIconShowPath='/minus.svg'
				headerStyles='font-secondary font-medium text-white text-[15px] leading-[18px] tracking-[0.472px] customXs:text-[23px] customXs:leading-[28px]'
				contentStyles='pt-10 font-secondary font-normal text-white text-[15px] leading-[22px] tracking-[0.472px] opacity-80 customXs:text-[18px] customXs:leading-[27px]'
				items={faqs}
			/>
		</>
	);
};

export default Faqs;
