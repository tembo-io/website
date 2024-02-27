import cx from 'classnames';
import React, { useState, type ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import Container from './Container';
import SingleSubjectTable from './SingleSubjectTable';

export enum Tier {
	Hobby = 'hobby',
	Production = 'production',
	Enterprise = 'enterprise',
}

const tierIndexMap = {
	[Tier.Hobby]: 1,
	[Tier.Production]: 2,
	[Tier.Enterprise]: 3,
};

interface Props {
	title: string;
	children?: ReactNode;
	rows: (string | boolean)[][];
	backdrop?: boolean;
	styles?: string;
}

const TabbedTable: React.FC<Props> = ({
	title,
	children,
	rows,
	backdrop = true,
	styles,
}) => {
	const [currentTab, setCurrentTab] = useState<Tier>(Tier.Production);

	const handleSwitch = (newValue: string) => {
		setCurrentTab(newValue as Tier);
	};

	return (
		<section
			className={cx(
				{
					'bg-lightMwasi pb-[38px]': backdrop,
				},
				styles,
			)}
		>
			<Container styles={styles}>
				<Tabs.Root
					className='w-full'
					value={currentTab}
					onValueChange={handleSwitch}
				>
					<Tabs.List
						className={cx(
							'flex sticky top-0 backdrop-blur-lg safari-blur pt-[77px] font-secondary font-normal text-grey text-sm border-b border-white border-opacity-20',
							backdrop
								? 'bg-lightMwasi bg-opacity-70'
								: 'bg-black bg-opacity-50',
						)}
						aria-label='Select a pricing tier'
					>
						{Object.values(Tier).map((tier) => (
							<Tabs.Trigger
								key={`${tier}-trigger`}
								className='relative px-6 pb-4 pt-2 capitalize data-[state=active]:font-semibold data-[state=active]:text-pricingGreen data-[state=active]:after:content-[""] data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gradient-rainbow data-[state=active]:after:absolute data-[state=active]:after:-bottom-[0.5px] data-[state=active]:after:left-0'
								value={tier}
							>
								{tier}
							</Tabs.Trigger>
						))}
					</Tabs.List>
					<div className='mt-[34px] flex items-center gap-2 customSm:gap-3'>
						{children}
						<span className='font-bold text-pricingGreen text-3xl tracking-[0.473px] [text-shadow:0px_0px_81px_#000] customSm:text-[42px]'>
							{title}
						</span>
					</div>
					{Object.values(Tier).map((tier) => (
						<Tabs.Content key={`${tier}-content`} value={tier}>
							<SingleSubjectTable
								rows={rows}
								index={tierIndexMap[tier]}
							/>
						</Tabs.Content>
					))}
				</Tabs.Root>
			</Container>
		</section>
	);
};

export default TabbedTable;
