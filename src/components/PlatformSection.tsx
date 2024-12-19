import Container from './Container';
import Animation from './Animation';
import ConfettiAnimationJson from '../animations/Confetti.json';
import DetailSequence from './DetailSequence';
import Button from './Button';
import { ArrowRightIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
	{
		header: '100% Open Source & Cloud Native',
		text: 'Get unmodified open source Postgres with cloud-native benefits: high availability, rolling updates, and intelligent resource management—all working seamlessly together.',
		iconPath: '/cloud-add-icon.svg',
	},
	{
		header: 'Fully Managed Service',
		text: 'Focus on building while we handle the complex stuff: deployment, configuration, management, and performance optimization of your Postgres infrastructure.',
		iconPath: '/candle-icon.svg',
	},
	{
		header: 'Enterprise-Grade Security',
		text: 'Secure your data with flexible controls: user tiers, IP allowlisting, encryption at rest, and the option to deploy in your own environment.',
		iconPath: '/shield-icon.svg',
	},
	{
		header: 'Developer Experience First',
		text: 'Access powerful Postgres features through our intuitive UI and CLI-first approach. Built by developers, for developers.',
		iconPath: '/monitor-icon.svg',
	},
	{
		header: 'Optimized Performance',
		text: 'Get the best performance automatically. We tune everything—from hardware and Postgres configs to extensions—based on your specific workload.',
		iconPath: '/cpu-charge-icon.svg',
	},
	{
		header: 'Simple, Usage-Based Pricing',
		text: 'Pay only for what you use with our transparent pricing. No hidden fees, no surprises—just straightforward costs for storage and queries.',
		iconPath: '/coin-icon.svg',
	},
];

const PlatformSection = () => {
	return (
		<section className='tembo-stacks-section bg-offBlack relative pt-10 pb-1 md:pt-20 md:pb-20'>
			<Container styles='relative h-full'>
				<motion.div
					className='z-10 relative max-w-3xl'
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
				>
					<p className='text-white/80 text-xl font-light leading-relaxed'>
						Everything you need to run Postgres at scale, in one
						place.
					</p>
				</motion.div>

				<div className='mt-20 mb-20'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 z-10'>
						{features.map((feature, index) => (
							<motion.div
								key={feature.header}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: 0.2 + index * 0.1,
									duration: 0.8,
									ease: [0.23, 1, 0.32, 1],
								}}
							>
								<DetailSequence
									header={feature.header}
									text={feature.text}
									iconPath={feature.iconPath}
									delay={0.2 + index * 0.1}
									styles='max-w-[400px]'
									headerStyles='font-secondary text-xl mb-3'
									textStyles='text-white/80'
								/>
							</motion.div>
						))}
					</div>
				</div>
			</Container>
		</section>
	);
};

export default PlatformSection;
