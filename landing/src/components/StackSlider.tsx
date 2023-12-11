import Card from './Card';
import Animation from '../components/Animation';
import elephant4 from '../animations/elephant4.json';
import elephant8 from '../animations/elephant8.json';
import elephant5 from '../animations/elephant5.json';
import elephant6 from '../animations/elephant6.json';
import elephant10 from '../animations/elephant10.json';

const FirstStackCards = () => {
    return (
        <ul className='flex gap-4 items-center justify-center animate-infinite-scroll'>
            <Card styles='bg-salmon flex flex-col justify-center min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10 mt-12'>
                    <p>Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>Real-time inference service</h2>
                </span>
                <Animation animation={elephant4} styles='absolute w-[215px] -top-[80px] -right-[80px] -z-0' />
            </Card>
            <Card styles='bg-neon flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10'>
                    <p>Document Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>Mobile app backend</h2>
                </span>
                <Animation animation={elephant8} styles='absolute w-[215px] -bottom-[50px] -right-[80px] -z-0' />
            </Card>
            <Card styles='bg-semiGrey flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10 text-white'>
                    <p>Machine Learning Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>ML Training Stack</h2>
                </span>
                <Animation animation={elephant5} styles='absolute w-[215px] -bottom-[50px] -right-[80px] -z-0 mirror-horizontal' />
            </Card>
            <Card styles='bg-offBlack flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10 text-white'>
                    <p>Message Queue Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>SQS Replacement System</h2>
                </span>
                <Animation animation={elephant6} styles='absolute w-[215px] -bottom-[80px] -right-[80px] -z-0 mirror-horizontal' />
            </Card>
            <Card styles='bg-purple flex flex-col justify-center min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10 mt-12'>
                    <p>OLAP Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>Data Warehouse for Analytics</h2>
                </span>
                <Animation animation={elephant10} styles='absolute w-[215px] -top-[70px] -right-[100px] -z-0' />
            </Card>
        </ul>
    )
}

const SecondStackCards = () => {
    return (
        <ul className='flex gap-4 items-center justify-center animate-infinite-scroll-fast'>
            <Card styles='bg-purple flex flex-col justify-center min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10 mt-12'>
                    <p>OLAP Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>Data Warehouse for Analytics</h2>
                </span>
                <Animation animation={elephant10} styles='absolute w-[215px] -top-[70px] -right-[100px] -z-0' />
            </Card>
            <Card styles='bg-offBlack flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10 text-white'>
                    <p>Message Queue Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>SQS Replacement System</h2>
                </span>
                <Animation animation={elephant6} styles='absolute w-[215px] -bottom-[80px] -right-[80px] -z-0 mirror-horizontal' />
            </Card>
            <Card styles='bg-neon flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10'>
                    <p>Document Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>Mobile app backend</h2>
                </span>
                <Animation animation={elephant8} styles='absolute w-[215px] -bottom-[50px] -right-[80px] -z-0' />
            </Card>
            <Card styles='bg-salmon flex flex-col justify-center min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10 mt-12'>
                    <p>Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>Real-time inference service</h2>
                </span>
                <Animation animation={elephant4} styles='absolute w-[215px] -top-[80px] -right-[80px] -z-0' />
            </Card>
            <Card styles='bg-semiGrey flex flex-col justify-start min-w-[260px] h-[260px] rounded-[20px] relative overflow-hidden'>
                <span className='z-10 text-white'>
                    <p>Machine Learning Stack</p>
                    <h2 className='font-semibold text-2xl mt-2'>ML Training Stack</h2>
                </span>
                <Animation animation={elephant5} styles='absolute w-[215px] -bottom-[50px] -right-[80px] -z-0 mirror-horizontal' />
            </Card>
        </ul>
    );
}

const StackSlider = () => {
  return (
    <>
        <div className='mt-24 w-full gap-4 inline-flex flex-nowrap overflow-hidden fade-x-md'>
            <div className='absolute left-0 top-0 bottom-0 w-[150px] z-10' />
            <div className='absolute right-0 top-0 bottom-0 w-[150px] z-10' />
            <FirstStackCards />
            <FirstStackCards aria-hidden={true} />
            <FirstStackCards aria-hidden={true} />
        </div>
        <div className='mt-4 w-full gap-4 inline-flex flex-nowrap overflow-hidden fade-x-md'>
            <SecondStackCards />
            <SecondStackCards aria-hidden={true} />
            <SecondStackCards aria-hidden={true} />
        </div>
    </>
  )
}

export default StackSlider;
