import Container from './Container';
import Animation from './Animation';
import ConfettiAnimationJson from '../animations/Confetti.json';
import DetailSequence from './DetailSequence';
import Button from './Button';

const PlatformSection = () => {
	return (
		<section className='tembo-stacks-section bg-offBlack relative'>
			<Container styles='relative h-full'>
				<Animation
					animation={ConfettiAnimationJson}
					loop={false}
					animateOnInView={true}
					isFullWidth={true}
				/>
				<div className='pt-28 z-10 relative'>
					<h2 className='text-3xl customXxs:text-4xl customXs:text-6xl customMd:text-7xl text-white font-semibold tracking-[0.24px]'>
						ALL IN ONE PLATFORM
					</h2>
				</div>
				<div className='flex flex-col-reverse mobile:flex-row justify-between items-start mt-20 gap-[50px] lg:gap-[300px] relative w-full'>
					<div className='flex flex-col z-10 gap-10 w-full mobile:w-1/2 items-center mobile:items-start'>
						<DetailSequence
							header='100% Open Source & Cloud Native'
							text='The best of both worlds. Enjoy unmodified open source community Postgres and all the benefits of cloud native architecture, such as high availability, rolling updates, resource management, and more.'
							iconPath='/cloud-add-icon.svg'
							styles='w-full max-w-none mobile:max-w-[530px] items-center mobile:items-start md:min-w-[350px] lg:min-w-[530px]'
							headerStyles='text-center mobile:text-start'
							textStyles='text-center mobile:text-start'
						/>
						<DetailSequence
							header='Fully Managed'
							text='Deployment, configuration, management, and optimization are complicated. We handle them so you can focus on your application.'
							iconPath='/candle-icon.svg'
							styles='w-full max-w-none mobile:max-w-[530px] items-center mobile:items-start md:min-w-[350px] lg:min-w-[530px]'
							headerStyles='text-center mobile:text-start'
							textStyles='text-center mobile:text-start'
						/>
						<DetailSequence
							header='Customizable Security'
							text='No two organizations are alike. Run securely in the cloud with with tools like user tiers, ip allow lists, and encrypted at-rest, or deploy in your own environment.'
							iconPath='/shield-icon.svg'
							styles='w-full max-w-none mobile:max-w-[530px] items-center mobile:items-start md:min-w-[350px] lg:min-w-[530px]'
							headerStyles='text-center mobile:text-start'
							textStyles='text-center mobile:text-start'
						/>
						<DetailSequence
							header='Intuitive Interface'
							text='Clear, elegant, delightful UI, because developers deserve nice things too. What’s more, our CLI-first system puts the power of Postgres in your hands. '
							iconPath='/monitor-icon.svg'
							styles='w-full max-w-none mobile:max-w-[530px] items-center mobile:items-start md:min-w-[350px] lg:min-w-[530px]'
							headerStyles='text-center mobile:text-start'
							textStyles='text-center mobile:text-start'
						/>
						<DetailSequence
							header='Performance Powered by Stacks'
							text='Focus on your product, not your database. We optimize your whole environment—hardware, Postgres configs, and relevant extensions—to give you the best performance for your workload.'
							iconPath='/cpu-charge-icon.svg'
							styles='w-full max-w-none mobile:max-w-[530px] items-center mobile:items-start md:min-w-[350px] lg:min-w-[530px]'
							headerStyles='text-center mobile:text-start'
							textStyles='text-center mobile:text-start'
						/>
						<DetailSequence
							header='Transparent Pricing'
							text='No hidden costs or surprise up-charges. You only pay for what you actually use. Store as much as you need, query as much as you want.'
							iconPath='/coin-icon.svg'
							styles='w-full max-w-none mobile:max-w-[530px] items-center mobile:items-start md:min-w-[350px] lg:min-w-[530px]'
							headerStyles='text-center mobile:text-start'
							textStyles='text-center mobile:text-start'
						/>
						<Button
							variant='gradient'
							size='lg'
							styles='w-max mt-10'
						>
							Deploy now
						</Button>
					</div>
					<img
						src={'/updatedAppScreenshot.svg'}
						alt='Tembo Cloud Dashboard'
						className='mobile:h-[700px] relative mobile:sticky mobile:top-[150px] -right-[50px] mobile:-right-[480px] min-[1300px]:-right-[500px] 2xl:-right-[300px] fade-x-md-always -z-1'
					/>
				</div>
			</Container>
		</section>
	);
};

export default PlatformSection;
