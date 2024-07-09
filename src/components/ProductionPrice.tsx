import React, { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as Select from '@radix-ui/react-select';
import type { PriceMatrix } from './ProductionPricing';

const instanceMap: Record<keyof PriceMatrix, string> = {
	general: 'General Purpose',
	memory: 'Memory Optimized',
	compute: 'Compute Optimized',
};

interface Props {
	priceMatrix: PriceMatrix;
	priceInterval: 'month' | 'hour';
}

const ProductionPrice: React.FC<Props> = ({ priceMatrix, priceInterval }) => {
	const [rangeValue, setRangeValue] = useState(0);
	const [selectValue, setSelectValue] =
		useState<keyof PriceMatrix>('compute');

	const handleSlide = (newValue: number[]) => {
		setRangeValue(newValue[0]);
	};

	const handleSelection = (newValue: string) => {
		setSelectValue(newValue as keyof PriceMatrix);
		const instanceSizeCount =
			priceMatrix[newValue as keyof PriceMatrix].length;
		if (rangeValue >= instanceSizeCount) {
			setRangeValue(instanceSizeCount - 1);
		}
	};

	return (
		<div className='mt-8'>
			<div className='flex items-baseline gap-2.5 customMd:gap-1.5'>
				{/* including this inline prevents flicker when switching tabs */}
				<svg
					width='23'
					height='38'
					viewBox='0 0 23 38'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M15.36 17.3998C17.6533 17.7998 19.4133 18.5465 20.64 19.6398C21.8933 20.7065 22.52 22.0798 22.52 23.7598V26.3598C22.52 27.7198 22.1467 28.9331 21.4 29.9998C20.68 31.0398 19.64 31.8531 18.28 32.4398C16.9467 33.0265 15.4133 33.3198 13.68 33.3198V37.1998H9.08V33.3198H8.96C6.18667 33.3198 4 32.5198 2.4 30.9198C0.8 29.3198 0 27.1331 0 24.3598H4.6C4.6 25.8531 4.98667 27.0398 5.76 27.9198C6.56 28.7731 7.65333 29.1998 9.04 29.1998H13.48C14.7867 29.1998 15.84 28.9198 16.64 28.3598C17.44 27.7731 17.84 27.0131 17.84 26.0798V24.3198C17.84 23.5998 17.56 22.9998 17 22.5198C16.44 22.0398 15.64 21.7065 14.6 21.5198L7.32 20.2798C5.05333 19.9065 3.30667 19.1598 2.08 18.0398C0.88 16.9198 0.280001 15.4931 0.280001 13.7598V11.5598C0.280001 10.1998 0.640001 8.99981 1.36 7.95981C2.10667 6.91981 3.14667 6.11981 4.48 5.5598C5.81333 4.97314 7.34667 4.67981 9.08 4.67981V0.799805H13.68V4.67981C15.3067 4.67981 16.7467 5.02647 18 5.71981C19.28 6.38647 20.2667 7.34647 20.96 8.59981C21.6533 9.85314 22 11.2931 22 12.9198H17.44C17.44 11.6931 17.08 10.7065 16.36 9.95981C15.6667 9.18647 14.76 8.79981 13.64 8.79981H9.12C7.86667 8.79981 6.85333 9.07981 6.08 9.6398C5.33333 10.1731 4.96 10.9065 4.96 11.8398V13.2798C4.96 14.0265 5.22667 14.6531 5.76 15.1598C6.29333 15.6398 7.06667 15.9598 8.08 16.1198L15.36 17.3998Z'
						fill='#84EA9A'
					/>
				</svg>

				<span className='font-semibold text-pricingGreen text-[40px] leading-[50px] tracking-[0.54px] customXs:text-[48px] customXs:leading-10'>
					{priceMatrix[selectValue][rangeValue].dollars}
				</span>
				<span className='opacity-50 font-semibold text-pricingGreen text-[23px] leading-[29px] tracking-[0.54px]'>
					/{priceInterval}
				</span>
			</div>
			<Slider.Root
				className='relative inline-block mt-6 w-full h-1.5 cursor-pointer'
				value={[rangeValue]}
				onValueChange={handleSlide}
				min={0}
				max={priceMatrix[selectValue].length - 1}
				step={1}
				id={`${priceInterval}-slider`}
			>
				<Slider.Track className='block absolute w-full h-1.5 rounded-2xl bg-customDarkerGrey'>
					<Slider.Range className='absolute h-1.5 rounded-2xl bg-good' />
				</Slider.Track>
				<Slider.Thumb
					className='absolute -mt-[9px] -ml-3 w-6 h-6 rounded-full bg-[url("/thumb.svg")] bg-good shadow'
					aria-label='Instance Size'
				/>
			</Slider.Root>
			<label
				className='block mt-4 font-secondary font-normal text-white opacity-80 text-[14px] leading-[24px]'
				htmlFor={`${priceInterval}-slider`}
			>
				{priceMatrix[selectValue][rangeValue].size}
			</label>

			<Select.Root value={selectValue} onValueChange={handleSelection}>
				<Select.Trigger
					className='flex justify-between items-center p-4 mt-4 w-full rounded-lg bg-[url(/dashedBorder.svg)] bg-[length:100%] font-semibold text-white text-[18px] leading-[23px] tracking-[0.54px]'
					aria-label='Instance Type'
				>
					<Select.Value />
					<Select.Icon className='shrink-0'>
						<img src={'/dropdownCaret.svg'} alt='expand icon' />
					</Select.Icon>
				</Select.Trigger>
				<Select.Portal>
					<Select.Content
						position='popper'
						className='mt-2 overflow-hidden bg-mwasi rounded-lg border border-white border-opacity-20'
						ref={(ref) =>
							ref?.addEventListener('touchend', (e) =>
								e.preventDefault(),
							)
						}
					>
						<Select.Viewport className='font-semibold text-white text-[18px] leading-[23px] tracking-[0.54px]'>
							{Object.keys(priceMatrix).map((instanceType) => (
								<Select.Item
									key={instanceType}
									value={instanceType}
									className='w-[var(--radix-select-trigger-width)] hover:cursor-pointer py-3 px-4 border-b border-white border-opacity-20 hover:bg-white hover:bg-opacity-5 focus-visible:outline-none focus-visible:bg-white focus-visible:bg-opacity-5 active:bg-white active:bg-opacity-15 last:border-b-0'
								>
									<Select.ItemText>
										{
											instanceMap[
												instanceType as keyof PriceMatrix
											]
										}
									</Select.ItemText>
								</Select.Item>
							))}
						</Select.Viewport>
					</Select.Content>
				</Select.Portal>
			</Select.Root>
		</div>
	);
};

export default ProductionPrice;
