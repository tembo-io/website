import React from 'react';
import Accordion from './Accordion';

const faqs = [
	{
		heading: 'When will I be billed?',
		content: (
			<p>
				Plans on Tembo Cloud are charged based on usage; you will receive your invoice at the end of each month. Self Hosted deployments can vary, which is why we encourage you to{' '}
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
			"I have a preferred cloud provider or region that I don't see on Tembo. What can I do?",
		content: (
			<p>
				We've designed our{' '}
				<a
					href={
						'https://tembo.io/docs/product/software/tembo-self-hosted/overview/'
					}
					className='underline'
				>
					Self Hosted
				</a>{' '}
				offering to be both modular and flexible. So long as you've got
				a Kubernetes cluster spun up (which we help implement), you can
				run the Tembo platform with any cloud provider in any region.
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
			<Accordion items={faqs} />
		</>
	);
};

export default Faqs;
