import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import ProductionPrice from './ProductionPrice';

export interface Price {
	size: string;
	dollars: string;
}

export interface PriceMatrix {
	general: Price[];
	memory: Price[];
	compute: Price[];
}

const monthlyPrices: PriceMatrix = {
	general: [
		{ size: '0.5 vCPU · 2Gi', dollars: '35' },
		{ size: '1 vCPU · 4Gi', dollars: '69.99' },
		{ size: '2 vCPU · 8Gi', dollars: '139.98' },
		{ size: '4 vCPU · 16Gi', dollars: '279.96' },
		{ size: '8 vCPU · 32Gi', dollars: '559.92' },
	],
	memory: [
		{ size: '0.5 vCPU · 4Gi', dollars: '43.02' },
		{ size: '1 vCPU · 8Gi', dollars: '86.03' },
		{ size: '2 vCPU · 16Gi', dollars: '172.06' },
		{ size: '4 vCPU · 32Gi', dollars: '344.12' },
	],
	compute: [
		{ size: '0.5 vCPU · 1Gi', dollars: '30.98' },
		{ size: '1 vCPU · 2Gi', dollars: '61.97' },
		{ size: '2 vCPU · 4Gi', dollars: '123.94' },
		{ size: '4 vCPU · 8Gi', dollars: '247.88' },
		{ size: '8 vCPU · 16Gi', dollars: '495.76' },
	],
};

const hourlyPrices: PriceMatrix = {
	general: [
		{ size: '0.5 vCPU · 2Gi', dollars: '0.05' },
		{ size: '1 vCPU · 4Gi', dollars: '0.10' },
		{ size: '2 vCPU · 8Gi', dollars: '0.19' },
		{ size: '4 vCPU · 16Gi', dollars: '0.38' },
		{ size: '8 vCPU · 32Gi', dollars: '0.77' },
	],
	memory: [
		{ size: '0.5 vCPU · 4Gi', dollars: '0.06' },
		{ size: '1 vCPU · 8Gi', dollars: '0.12' },
		{ size: '2 vCPU · 16Gi', dollars: '0.24' },
		{ size: '4 vCPU · 32Gi', dollars: '0.47' },
	],
	compute: [
		{ size: '0.5 vCPU · 1Gi', dollars: '0.04' },
		{ size: '1 vCPU · 2Gi', dollars: '0.08' },
		{ size: '2 vCPU · 4Gi', dollars: '0.17' },
		{ size: '4 vCPU · 8Gi', dollars: '0.34' },
		{ size: '8 vCPU · 16Gi', dollars: '0.68' },
	],
};

const ProductionPricing: React.FC = () => {
	const [currentTab, setCurrentTab] = useState('monthly');

	const handleSwitch = (newValue: string) => {
		setCurrentTab(newValue);
	};

	return (
		<Tabs.Root
			className='mt-8 w-full'
			value={currentTab}
			onValueChange={handleSwitch}
		>
			<Tabs.List
				className='flex font-secondary font-normal text-grey text-sm border-b border-white border-opacity-10'
				aria-label='Select a pricing interval'
			>
				<Tabs.Trigger
					className='relative px-6 pb-4 pt-2 data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:after:content-[""] data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gradient-rainbow data-[state=active]:after:absolute data-[state=active]:after:-bottom-[0.5px] data-[state=active]:after:left-0'
					value='monthly'
				>
					Monthly
				</Tabs.Trigger>
				<Tabs.Trigger
					className='relative px-6 pb-4 pt-2 data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:after:content-[""] data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gradient-rainbow data-[state=active]:after:absolute data-[state=active]:after:-bottom-[0.5px] data-[state=active]:after:left-0'
					value='hourly'
				>
					Hourly
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value='monthly'>
				<ProductionPrice
					priceMatrix={monthlyPrices}
					priceInterval='month'
				/>
			</Tabs.Content>
			<Tabs.Content value='hourly'>
				<ProductionPrice
					priceMatrix={hourlyPrices}
					priceInterval='hour'
				/>
			</Tabs.Content>
		</Tabs.Root>
	);
};

export default ProductionPricing;
