import Card from './Card';
import Animation from './Animation';
import elephant4 from '../animations/elephant4.json';
import elephant8 from '../animations/elephant8.json';
import elephant5 from '../animations/elephant5.json';
import elephant6 from '../animations/elephant6.json';
import elephant10 from '../animations/elephant10.json';
import { motion } from 'framer-motion';

interface StackCardProps {
	children: React.ReactNode;
}

function StackCard({ children }: StackCardProps) {
	return (
		<motion.div
			initial='hidden'
			whileInView='visible'
			transition={{ duration: 0.3 }}
			variants={{
				visible: { opacity: 1, scale: 1 },
				hidden: { opacity: 0, scale: 0.8 },
			}}
		>
			{children}
		</motion.div>
	);
}

function StackGrid() {
	return (
		<div className='max-w-[1200px] mx-auto mb-10 md:mb-20'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
				<StackCard>
					<Card styles='bg-neon flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden p-[26px]'>
						<span className='z-10 text-black'>
							<p className='font-semibold'>Geospatial Stack</p>
							<h2 className='font-medium text-2xl mt-2 leading-8'>
								Route Optimization & Planning
							</h2>
						</span>
						<Animation
							animation={elephant4}
							styles='absolute w-[220px] h-[220px] -bottom-[50px] -right-[80px] -z-0'
						/>
					</Card>
				</StackCard>

				<StackCard>
					<Card styles='bg-semiGrey2 flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden p-[26px]'>
						<span className='z-10 text-white'>
							<p className='font-semibold'>Time Series Stack</p>
							<h2 className='font-medium text-2xl mt-2 leading-8'>
								IOT Machine Data Store
							</h2>
						</span>
						<Animation
							animation={elephant8}
							styles='absolute w-[220px] h-[220px] -bottom-[50px] -right-[80px] -z-0'
						/>
					</Card>
				</StackCard>

				<StackCard>
					<Card styles='bg-neon flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden p-[26px]'>
						<span className='z-10 text-black'>
							<p className='font-semibold'>
								Machine Learning Stack
							</p>
							<h2 className='font-medium text-2xl mt-2 leading-8'>
								Recommendations Model Training
							</h2>
						</span>
						<Animation
							animation={elephant5}
							styles='absolute w-[220px] h-[220px] -bottom-[50px] -right-[80px] -z-0 mirror-horizontal'
						/>
					</Card>
				</StackCard>

				<StackCard>
					<Card styles='bg-semiGrey2 flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden p-[26px]'>
						<span className='z-10 text-white'>
							<p className='font-semibold'>Analytics Stack</p>
							<h2 className='font-medium text-2xl mt-2 leading-8'>
								Efficient Analytics on S3 data
							</h2>
						</span>
						<Animation
							animation={elephant6}
							styles='absolute w-[220px] h-[220px] -bottom-[50px] -right-[80px] -z-0 mirror-horizontal'
						/>
					</Card>
				</StackCard>

				<StackCard>
					<Card styles='bg-neon flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden p-[26px]'>
						<span className='z-10 text-black'>
							<p className='font-semibold'>Vector Stack</p>
							<h2 className='font-medium text-2xl mt-2 leading-8'>
								Auto Embeddings Generation
							</h2>
						</span>
						<Animation
							animation={elephant10}
							styles='absolute w-[220px] h-[220px] -bottom-[50px] -right-[80px] -z-0'
						/>
					</Card>
				</StackCard>

				<StackCard>
					<Card styles='bg-semiGrey2 flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden p-[26px]'>
						<span className='z-10 text-white'>
							<p className='font-semibold'>OLAP Stack</p>
							<h2 className='font-medium text-2xl mt-2 leading-8'>
								Data Warehouse for Analytics
							</h2>
						</span>
						<Animation
							animation={elephant6}
							styles='absolute w-[220px] h-[220px] -bottom-[50px] -right-[80px] -z-0 mirror-horizontal'
						/>
					</Card>
				</StackCard>
			</div>
		</div>
	);
}

export default StackGrid;
