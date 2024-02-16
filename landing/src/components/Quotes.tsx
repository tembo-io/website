import 'swiper/css';
import '../css/swiper.css';

import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperCore } from 'swiper/types';

export interface QuoteData {
	name: string;
	role: string;
	company: string;
	quote: string;
	logoUrl: string;
}

const quotes: QuoteData[] = [
	{
		name: 'Anna Walker',
		role: 'CEO',
		company: 'Tembo',
		quote: 'Lorem ipsum dolor sit amet consectetur. Mi egestas vitae lectus nunc tristique. Nisl velit lorem felis proin viverra mus eget orci. Mi congue porttitor ante ultricies amet nisl et eu.',
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'Anna Walker',
		role: 'CEO',
		company: 'Tembo',
		quote: 'Lorem ipsum dolor sit amet consectetur.',
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'Anna Walker',
		role: 'CEO',
		company: 'Tembo',
		quote: 'Lorem ipsum dolor sit amet consectetur. Mi egestas vitae lectus nunc tristique. Nisl velit lorem felis proin viverra mus eget orci. Mi congue porttitor ante ultricies amet nisl et eu.',
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'Anna Walker',
		role: 'CEO',
		company: 'Tembo',
		quote: 'Lorem ipsum dolor sit amet consectetur. Mi egestas vitae lectus nunc tristique. ',
		logoUrl: '/elephant1.svg',
	},
	{
		name: 'Anna Walker',
		role: 'CEO',
		company: 'Tembo',
		quote: 'Lorem ipsum dolor sit amet consectetur. Mi egestas vitae lectus nunc tristique. Nisl velit lorem felis proin viverra mus eget orci. Mi congue porttitor ante ultricies amet nisl et eu.',
		logoUrl: '/elephant1.svg',
	},
];

const Quotes: React.FC = () => {
	const swiperRef = useRef<SwiperCore>();
	const [activeIndex, setActiveIndex] = useState(0);

	return (
		<section className='relative overflow-hidden mt-[70px] customSm:mt-[85px] customMd:mt-[125px] customLg:mt-[160px] customXl:mt-[150px] customXxl:pt-20'>
			<Swiper
				onBeforeInit={(swiper) => {
					swiperRef.current = swiper;
				}}
				onRealIndexChange={(element) =>
					setActiveIndex(element.activeIndex)
				}
				className='mySwiper'
				effect='coverflow'
				grabCursor
				centeredSlides
				slidesPerView='auto'
				speed={350}
				coverflowEffect={{
					rotate: 0,
					depth: 0,
				}}
			>
				{quotes.map((it, i) => (
					<SwiperSlide key={`${it.name}-${i}`}>
						<div className='flex flex-col justify-between h-full'>
							<div>
								<img
									src={'/quotes.svg'}
									alt={'quotation mark'}
									height={11}
									width={15}
								/>
								<p className='mt-4 font-secondary font-normal text-white text-[19px] leading-[31px] tracking-[0.54px]'>
									{it.quote}
								</p>
							</div>
							<div className='flex gap-4 items-center mt-[83px]'>
								<div
									className={
										'h-12 w-12 shrink-0 overflow-hidden rounded-full'
									}
								>
									<img
										src={it.logoUrl}
										alt={`${it.company} logo`}
										className='h-full object-cover'
									/>
								</div>
								<div>
									<span className='block font-secondary font-bold text-white text-[15px] leading-[18px] tracking-[0.54px]'>
										{it.name}
									</span>
									<span className='mt-2 block font-secondary font-normal text-white text-[13px] leading-[15px] tracking-[0.54px] opacity-60'>{`${it.role}, ${it.company}`}</span>
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
			{quotes.length > 1 && (
				<div
					className={
						'absolute bottom-[35px] z-10 left-1/2 -translate-x-1/2'
					}
				>
					<div className='flex justify-between w-screen px-5 customXs:px-10 customSm:px-12 customMd:px-20 customLg:px-[88px] customXl:px-[110px] customXxl:px-0 max-w-[1630px]'>
						<button
							type='button'
							className='h-[42px] w-[42px] disabled:invisible'
							onClick={() => {
								swiperRef.current?.slidePrev();
							}}
							disabled={activeIndex === 0}
						>
							<img
								src={'/forwardArrow.svg'}
								alt={'back arrow'}
								className='rotate-180'
							/>
						</button>
						<button
							type='button'
							className='h-[42px] w-[42px] disabled:invisible'
							onClick={() => {
								swiperRef.current?.slideNext();
							}}
							disabled={activeIndex === quotes.length - 1}
						>
							<img
								src={'/forwardArrow.svg'}
								alt={'forward arrow'}
							/>
						</button>
					</div>
				</div>
			)}
		</section>
	);
};

export default Quotes;
