import Masonry from 'react-masonry-css';
import { styles } from '../util';
import { motion } from 'framer-motion';
import { useState } from 'react';

export interface QuoteData {
	name?: string;
	role?: string;
	company?: string;
	quote: string;
	logoUrl: string;
}

const quotes: QuoteData[] = [
	{
		name: 'Cody Hanson',
		role: 'Engineering Manager',
		company: 'Arch',
		quote: "Tembo is a foundational part of our platform. We've been able to effortlessly provision, manage, and scale a fleet of databases to run a diverse array of workloads without having to hire a dedicated postgres expert to our team.",
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'John Madrak',
		role: 'Founder',
		company: 'Waddling Technology',
		quote: "We like that 'limits' are only tied to the provisioned specs, not arbitrary decisions made by the provider. The automated backup system helps us avoid the stress of finding a reliable backup solution ourselves and the support of all Postgres extensions make this a long-term solution for us. ",
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'Twitter User',
		role: 'Machine Learning Engineer',
		company: '',
		quote: 'Maaahn...so excited for @tembo_io🔥💯',
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'Twitter User',
		quote: `OMG!!

		@tembo_io
		 is so cool 🔥

		My admiration and respect towards
		@PostgreSQL quadrupled.`,
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'Hemanth Soni',
		role: 'Growth & Partnerships Lead',
		company: 'Goldsky',
		quote: "Tembo is the only player who thinks about multi-tenant use cases at the core of the platform rather than an add-on. Combined with the simple flexibility of stacks, it's quickly growing as a share of our total database usage.",
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'Engineer',
		role: 'Engineer',
		company: 'Arch',
		quote: 'Tembo makes trying and using Postgres extensions easy, which has unlocked a world of possibilities with regards to the kinds of problems Postgres can solve for you.',
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'Andrei Sergeev',
		role: 'Principal Solutions Architect',
		company: 'CloudBreezy',
		quote: 'Tembo offers a great combination of superb products and excellent support.',
		logoUrl: '/elephant1.svg',
	},
];

interface Props {
	className?: string;
}

interface QuoteCardProps {
	children: React.ReactNode;
	index: number;
}

function QuoteCard({ children, index }: QuoteCardProps) {
	return (
		<motion.div
			initial='hidden'
			whileInView='visible'
			viewport={{ once: true }}
			transition={{
				duration: 0.5,
				delay: index * 0.1,
				ease: [0.23, 1, 0.32, 1],
			}}
			variants={{
				visible: { opacity: 1, y: 0 },
				hidden: { opacity: 0, y: 20 },
			}}
		>
			{children}
		</motion.div>
	);
}

function Quotes({ className }: Props) {
	const [showAll, setShowAll] = useState(false);
	const initialQuotesToShow = 3;

	return (
		<section
			className={styles(
				'relative p-4 flex items-center justify-center',
				className,
			)}
		>
			<div className='w-full flex flex-col md:hidden gap-2 relative'>
				{/* Show either all quotes or just initial ones */}
				{(showAll ? quotes : quotes.slice(0, initialQuotesToShow)).map(
					(quote, i) => (
						<QuoteCard key={`${quote.name}-${i}`} index={i}>
							<div className='bg-semiGrey2/80 rounded-lg p-8 flex flex-col justify-between'>
								<div>
									<img
										src={'/quotes.svg'}
										alt={'quotation mark'}
										height={11}
										width={15}
										className='opacity-60'
									/>
									<p className='mt-6 font-secondary text-white text-sm leading-relaxed tracking-wide'>
										{quote.quote}
									</p>
								</div>
								<div className='flex gap-4 items-center mt-8'>
									<div className='h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10 p-2'>
										<img
											src={quote.logoUrl}
											alt={`${quote.company} logo`}
											className='h-full w-full object-cover ml-[1px]'
										/>
									</div>
									<div className='space-y-1'>
										<span className='block font-secondary font-medium text-white text-sm'>
											{quote?.name
												? quote.name
												: 'Anonymous'}
										</span>
										<span className='block font-secondary text-white/60 text-xs'>
											{quote.role}
											{`${quote?.company ? `, ${quote.company}` : ''}`}
										</span>
									</div>
								</div>
							</div>
						</QuoteCard>
					),
				)}

				{/* Gradient overlay and button container */}
				{!showAll && (
					<div className='relative'>
						<div className='absolute -top-40 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent'></div>
						<div className='flex justify-center mt-4'>
							<button
								onClick={() => setShowAll(true)}
								className='bg-semiGrey2/80 text-white px-6 py-3 rounded-lg font-secondary text-sm'
							>
								See More
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Original Masonry layout for tablet and desktop */}
			<div className='hidden md:flex w-full justify-center'>
				{' '}
				<Masonry
					breakpointCols={{
						default: 3,
						1100: 2,
					}}
					className='flex -ml-2 w-auto'
					columnClassName='pl-2 max-w-[40ch]'
				>
					{quotes.map((quote, i) => (
						<QuoteCard key={`${quote.name}-${i}`} index={i}>
							<div className='bg-semiGrey2/80 rounded-lg p-8 flex flex-col justify-between mb-2'>
								<div>
									<img
										src={'/quotes.svg'}
										alt={'quotation mark'}
										height={11}
										width={15}
										className='opacity-60'
									/>
									<p className='mt-6 font-secondary text-white text-sm leading-relaxed tracking-wide'>
										{quote.quote}
									</p>
								</div>
								<div className='flex gap-4 items-center mt-8'>
									<div className='h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10 p-2'>
										<img
											src={quote.logoUrl}
											alt={`${quote.company} logo`}
											className='h-full w-full object-cover ml-[1px]'
										/>
									</div>
									<div className='space-y-1'>
										<span className='block font-secondary font-medium text-white text-sm'>
											{quote?.name
												? quote.name
												: 'Anonymous'}
										</span>
										<span className='block font-secondary text-white/60 text-xs'>
											{quote.role}
											{`${quote?.company ? `, ${quote.company}` : ''}`}
										</span>
									</div>
								</div>
							</div>
						</QuoteCard>
					))}
				</Masonry>
			</div>
		</section>
	);
}

export default Quotes;
