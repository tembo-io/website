import { AnimatePresence, motion } from 'framer-motion';
import Container from './Container';
import WaddlingLogo from '../images/waddling_logo.svg';
import ArchLogo from '../images/arch.svg';
import MightyBot from '../images/mightybotlogo.svg';
import ProspectStreamLogo from '../images/prospect_logo.svg';
import AutomizedLogo from '../images/automized.png';
import OSSRankLogo from '../images/ossrank.svg';

const LOGOS = [
	{
		src: WaddlingLogo,
		width: '130',
		alt: 'waddling logo',
	},
	{
		src: ArchLogo,
		width: '80',
		alt: 'arch logo',
	},
	{
		src: MightyBot,
		width: '120',
		alt: 'mightybot logo',
		invert: true,
	},
	{
		src: ProspectStreamLogo,
		width: '100',
		alt: 'prospect stream logo',
	},
	{
		src: AutomizedLogo,
		width: '120',
		alt: 'automized logo',
	},
	{
		src: OSSRankLogo,
		width: '120',
		alt: 'ossrank logo',
		invert: true,
	},
];

// Separate React component for animations
function LogoGridContent() {
	return (
		<AnimatePresence>
			<div className='flex w-full justify-center items-center text-center flex-col gap-6 pb-10 mt-40'>
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 0.8, y: 0 }}
					transition={{
						delay: 1,
						duration: 0.8,
						ease: [0.23, 1, 0.32, 1],
					}}
					className='text-white text-xs uppercase font-semibold leading-[15.59px] tracking-[0.64px] z-10 mb-10'
				>
					Trusted by leading companies
				</motion.p>

				<div className='grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-12 items-center justify-items-center w-full max-w-4xl mx-auto place-content-center'>
					{LOGOS.map((logo, index) => (
						<motion.div
							key={logo.alt}
							className='flex justify-center w-[140px]'
							initial={{
								opacity: 0,
								scale: 0.95,
								y: 10,
							}}
							animate={{
								opacity: 1,
								scale: 1,
								y: 0,
							}}
							transition={{
								delay: 1 + index * 0.15,
								duration: 0.8,
								ease: [0.23, 1, 0.32, 1],
							}}
						>
							<img
								src={logo.src.src}
								alt={logo.alt}
								className={`w-[${logo.width}px] h-auto ${logo.invert ? 'brightness-0 invert' : ''}`}
								loading='eager'
							/>
						</motion.div>
					))}
				</div>
			</div>
		</AnimatePresence>
	);
}

// Container wrapper
function LogoGrid() {
	return (
		<Container styles='relative mt-20 mb-10'>
			<div className='light-gradient-small absolute -top-[500px] left-1/3 z-1'></div>
			<LogoGridContent />
		</Container>
	);
}

export default LogoGrid;
