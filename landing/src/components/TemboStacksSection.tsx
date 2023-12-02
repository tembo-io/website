import Container from '../components/Container';
import Animation from '../components/Animation';
import ConfettiAnimationJson from '../animations/Confetti.json';
import DetailSequence from '../components/DetailSequence';
import Button from './Button';

const TemboStacksSection = () => {
    return (
        <section className='tembo-stacks-section bg-offBlack relative'>
            <Container styles='relative'>
                <Animation animation={ConfettiAnimationJson} loop={false} animateOnInView={true} isFullWidth={true} />
                <div className='pt-28 z-10 relative'>
                    <h1 className='text-7xl text-white font-semibold tracking-[0.24px]'>TEMBO + STACKS</h1>
                </div>
                <div className='flex w-full justify-between items-start mt-20 gap-16'>
                    <div className='flex flex-col z-10 gap-10'>
                        <DetailSequence header='100% Open Source & Cloud Native' text='The best of both worlds. Enjoy unmodified open source community Postgres and all the benefits of cloud native architecture, such as high availability, rolling updates, resource management, and more.' iconPath='/cloudColorIcon.svg' />
                        <DetailSequence header='Fully Managed' text='Deployment, configuration, management, and optimization are complicated. We handle them so you can focus on your application.' iconPath='/boardColorIcon.svg' />
                        <DetailSequence header='Customizable Security' text='No two organizations are alike. Run securely in the cloud with with tools like user tiers, ip allow lists, and encrypted at-rest, or deploy in your own environment.' iconPath='/cpuColorIcon.svg' />
                        <DetailSequence header='Intuitive Interface' text='Clear, elegant, delightful UI, because developers deserve nice things too. What’s more, our CLI-first system puts the power of Postgres in your hands. ' iconPath='/codeColorIcon.svg' />
                        <DetailSequence header='Performance Powered by Stacks' text='Focus on your product, not your database. We optimize your whole environment—hardware, Postgres configs, and relevant extensions—to give you the best performance for your workload.' iconPath='/mqColorIcon.svg' />
                        <DetailSequence header='Transparent Pricing' text='No hidden costs or surprise up-charges. You only pay for what you actually use. Store as much as you need, query as much as you want. ' iconPath='/priceColorIcon.svg' />
                        <Button variant='gradient' size='lg' styles='w-max mt-10'>Deploy now</Button>
                    </div>
                    <img src={'/appScreenshot.svg'} alt='Tembo Cloud Dashboard' className='w-[1000px] fade-x-md-always' />
                </div>
            </Container>
        </section>
  )
}

export default TemboStacksSection;
