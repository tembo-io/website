import React from 'react';
import Card from './Card';

const FirstStackCards = () => {
    return (
        <ul className='flex gap-4 items-center justify-center animate-infinite-scroll'>
            <Card styles='bg-salmon flex flex-col justify-center min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10 mt-12'>
                    <p>Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>Real-time inference service</h2>
                </span>
                <img src='/elephant2.svg' alt='elephant' className='absolute w-[215px] -top-[10px] -right-[60px] -z-0' />
            </Card>
            <Card styles='bg-neon flex flex-col justify-start min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10'>
                    <p>Document Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>Mobile app backend</h2>
                </span>
                <img src='/elephant7.svg' alt='elephant' className='absolute w-[215px] -bottom-[10px] -right-[30px] -z-0' />
            </Card>
            <Card styles='bg-semiGrey flex flex-col justify-start min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10 text-white'>
                    <p>Machine Learning Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>ML Training Stack</h2>
                </span>
                <img src='/elephant6.svg' alt='elephant' className='absolute w-[215px] -bottom-[10px] -right-[20px] -z-0 mirror-horizontal' />
            </Card>
            <Card styles='bg-offBlack flex flex-col justify-start min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10 text-white'>
                    <p>Message Queue Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>SQS Replacement System</h2>
                </span>
                <img src='/elephant9.svg' alt='elephant' className='absolute w-[215px] -bottom-[10px] -right-[20px] -z-0 mirror-horizontal' />
            </Card>
            <Card styles='bg-purple flex flex-col justify-center min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10 mt-12'>
                    <p>OLAP Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>Data Warehouse for Analytics</h2>
                </span>
                <img src='/elephant11.svg' alt='elephant' className='absolute w-[215px] -top-[10px] -right-[60px] -z-0' />
            </Card>
        </ul>
    )
}

const SecondStackCards = () => {
    return (
        <ul className='flex gap-4 items-center justify-center animate-infinite-scroll-fast'>
            <Card styles='bg-salmon flex flex-col justify-center min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10 mt-12'>
                    <p>Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>Real-time inference service</h2>
                </span>
                <img src='/elephant2.svg' alt='elephant' className='absolute w-[215px] -top-[10px] -right-[60px] -z-0' />
            </Card>
            <Card styles='bg-neon flex flex-col justify-start min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10'>
                    <p>Document Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>Mobile app backend</h2>
                </span>
                <img src='/elephant7.svg' alt='elephant' className='absolute w-[215px] -bottom-[10px] -right-[30px] -z-0' />
            </Card>
            <Card styles='bg-semiGrey flex flex-col justify-start min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10 text-white'>
                    <p>Machine Learning Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>ML Training Stack</h2>
                </span>
                <img src='/elephant6.svg' alt='elephant' className='absolute w-[215px] -bottom-[10px] -right-[20px] -z-0 mirror-horizontal' />
            </Card>
            <Card styles='bg-offBlack flex flex-col justify-start min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10 text-white'>
                    <p>Message Queue Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>SQS Replacement System</h2>
                </span>
                <img src='/elephant9.svg' alt='elephant' className='absolute w-[215px] -bottom-[10px] -right-[20px] -z-0 mirror-horizontal' />
            </Card>
            <Card styles='bg-purple flex flex-col justify-center min-w-[342px] h-[342px] rounded-3xl relative overflow-hidden'>
                <span className='z-10 mt-12'>
                    <p>OLAP Stack</p>
                    <h2 className='font-bold text-2xl mt-2'>Data Warehouse for Analytics</h2>
                </span>
                <img src='/elephant11.svg' alt='elephant' className='absolute w-[215px] -top-[10px] -right-[60px] -z-0' />
            </Card>
        </ul>
    );
}

const StackSlider = () => {
  return (
    <>
        <div className='mt-24 w-full gap-4 inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]'>
            <FirstStackCards />
            <FirstStackCards />
        </div>
        <div className='mt-4 w-full gap-4 inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]'>
            <SecondStackCards />
            <SecondStackCards />
        </div>
    </>
  )

}

export default StackSlider;
