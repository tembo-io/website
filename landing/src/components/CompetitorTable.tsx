import cx from 'classnames';
import React, { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import blueCheck from '../images/blueCheck.svg';
import greyX from '../images/greyX.svg';

const getSymbolSrc = (value: boolean, cellIndex: number) => {
	if (value && cellIndex === 1) {
		return blueCheck.src;
	}
	return greyX.src;
};

const competitorOne = {
	name: 'Amazon RDS',
	shortName: 'AWS RDS',
	columns: [
		{
			size: '4 vCPU and 32 GB RAM',
			dollars: '1,217',
			features: [
				'General Purpose',
				'10 GB',
				'91',
				false,
				false,
				false,
				false,
				false,
				false,
			],
		},
		{
			size: 'size 2 TODO',
			dollars: '731',
			features: [
				'TODO',
				'TODO',
				'TODO',
				false,
				false,
				false,
				false,
				false,
				false,
			],
		},
	],
};

const competitorTwo = {
	name: 'Amazon RDS',
	shortName: 'AWS RDS',
	columns: [
		{
			size: 'TODO',
			dollars: 'TODO',
			features: [
				'Time-Series Only',
				'10 GB',
				'0',
				false,
				false,
				false,
				false,
				false,
				false,
			],
		},
	],
};

const getCompetitorRows = (
	competitorOneColumnIndex: number,
	competitorTwoColumnIndex: number,
) => {
	return [
		[
			'Use Cases',
			'General Purpose & Multiple Specialized Stacks',
			competitorOne.columns[competitorOneColumnIndex].features[0],
			competitorTwo.columns[competitorTwoColumnIndex].features[0],
		],
		[
			'Custom Sidecar Deployments',
			'10 GB',
			competitorOne.columns[competitorOneColumnIndex].features[1],
			competitorTwo.columns[competitorTwoColumnIndex].features[1],
		],
		[
			'Extensions',
			'150+',
			competitorOne.columns[competitorOneColumnIndex].features[2],
			competitorTwo.columns[competitorTwoColumnIndex].features[2],
		],
		[
			'Stacks',
			'20+ Stacks',
			competitorOne.columns[competitorOneColumnIndex].features[3],
			competitorTwo.columns[competitorTwoColumnIndex].features[3],
		],
		[
			'Sidecar & App Deployments',
			true,
			competitorOne.columns[competitorOneColumnIndex].features[4],
			competitorTwo.columns[competitorTwoColumnIndex].features[4],
		],
		[
			'Private Data Plane',
			true,
			competitorOne.columns[competitorOneColumnIndex].features[5],
			competitorTwo.columns[competitorTwoColumnIndex].features[5],
		],
		[
			'Multi-Cloud Support',
			true,
			competitorOne.columns[competitorOneColumnIndex].features[6],
			competitorTwo.columns[competitorTwoColumnIndex].features[6],
		],
		[
			'Custom Extension Deployments',
			true,
			competitorOne.columns[competitorOneColumnIndex].features[7],
			competitorTwo.columns[competitorTwoColumnIndex].features[7],
		],
		[
			'Automated Schema Workflows',
			true,
			competitorOne.columns[competitorOneColumnIndex].features[8],
			competitorTwo.columns[competitorTwoColumnIndex].features[8],
		],
	];
};

interface CompetitorHeadingProps {
	competitor: number;
	competitorSelectValue: number;
	selectHandler: (competitor: number, newValue: string) => void;
}

const CompetitorHeading: React.FC<CompetitorHeadingProps> = ({
	competitor,
	competitorSelectValue,
	selectHandler,
}) => {
	const competitorData = competitor === 1 ? competitorOne : competitorTwo;
	return (
		<>
			<div
				className={cx(
					'ml-1 py-6 px-2 rounded-t-3xl bg-white bg-opacity-[0.08] customXs:mb-2 customXs:px-4 customXs:ml-2 customSm:mb-3 customSm:ml-4 customMd:ml-6 customLg:ml-8 customS:ml-4',
					competitorData.columns.length === 1
						? 'block'
						: 'block mobile:hidden',
				)}
			>
				<div className='h-20 py-3 customMd:h-[85px] customLg:h-[87px]'>
					<span className='block customMd:hidden mb-2 whitespace-nowrap text-lg leading-[22px] text-white font-semibold tracking-[0.54px] customXs:text-[26px] customXs:leading-[33px]'>
						{competitorData.shortName}
					</span>
					<span className='hidden customMd:block text-lg leading-[22px] text-white font-semibold tracking-[0.54px] customXs:text-[26px] customXs:leading-[33px]'>
						{competitorData.name}
					</span>
					<span className='h-[30px] block mt-2 text-xs leading-[15px] text-white font-normal tracking-[0.54px] customXs:h-auto customMd:text-base customMd:leading-[20px] customLg:text-lg customLg:leading-[22px]'>
						{competitorData.columns[0].size}
					</span>
				</div>
				<div className='flex gap-[3px] items-baseline mt-6'>
					<span className='text-xl leading-[25px] text-white font-semibold tracking-[0.54px] customSm:text-[38px] customSm:leading-[48px]'>
						${competitorData.columns[competitorSelectValue].dollars}
					</span>
					<span className='customMd:hidden text-[10px] leading-[12px] text-white font-normal tracking-[0.54px] text-opacity-70 customXs:text-base customXs:leading-[19px]'>
						/mo
					</span>
					<span className='hidden customMd:inline text-[10px] leading-[12px] text-white font-normal tracking-[0.54px] text-opacity-70 customXs:text-base customXs:leading-[19px]'>
						/month
					</span>
				</div>
			</div>
			<div
				className={cx(
					'ml-1 py-6 px-2 rounded-t-3xl bg-white bg-opacity-[0.08] customXs:ml-2 customXs:mb-2 customSm:mb-3 customSm:ml-4 customMd:ml-6 customLg:ml-8',
					competitorData.columns.length > 1
						? 'hidden mobile:block'
						: 'hidden',
				)}
			>
				<Select.Root
					value={competitorSelectValue.toString()}
					onValueChange={(newValue) =>
						selectHandler(competitor, newValue)
					}
				>
					<Select.Trigger
						className='radix-select-trigger p-3 w-full rounded-lg bg-[url(/dashedBorder.svg)] bg-contain flex justify-between items-center font-semibold text-white text-[18px] leading-[23px] tracking-[0.54px]'
						aria-label='Instance Type'
					>
						<div className='text-left'>
							<span className='block customMd:hidden mb-2 whitespace-nowrap text-lg leading-[22px] text-white font-semibold tracking-[0.54px] customXs:text-[26px] customXs:leading-[33px]'>
								{competitorData.shortName}
							</span>
							<span className='hidden customMd:block mb-2 text-lg leading-[22px] text-white font-semibold tracking-[0.54px] customXs:text-[26px] customXs:leading-[33px]'>
								{competitorData.name}
							</span>
							<div className='h-[30px] block text-xs leading-[15px] text-white font-normal tracking-[0.54px] customXs:h-auto customXs:whitespace-nowrap customMd:text-base customMd:leading-[20px] customLg:text-lg customLg:leading-[22px]'>
								<Select.Value />
							</div>
						</div>
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
								{competitorData.columns.map(
									(column, columnIndex) => (
										<Select.Item
											key={columnIndex}
											value={columnIndex.toString()}
											className='w-[var(--radix-select-trigger-width)] py-3 px-4 hover:bg-white hover:bg-opacity-5 focus-visible:outline-none focus-visible:bg-white focus-visible:bg-opacity-5 active:bg-white active:bg-opacity-15 last:border-b-0 border-b border-white border-opacity-20'
										>
											<div className='h-[30px] block text-xs leading-[15px] text-white font-normal tracking-[0.54px] customXs:h-auto  customMd:text-base customMd:leading-[20px] customLg:text-lg customLg:leading-[22px]'>
												<Select.ItemText>
													{column.size}
												</Select.ItemText>
											</div>
										</Select.Item>
									),
								)}
							</Select.Viewport>
						</Select.Content>
					</Select.Portal>
				</Select.Root>
				<div className='flex gap-[3px] items-baseline mt-6'>
					<span className='pl-2 text-xl leading-[25px] text-white font-semibold tracking-[0.54px] customSm:text-[38px] customSm:leading-[48px]'>
						${competitorData.columns[competitorSelectValue].dollars}
					</span>
					<span className='customMd:hidden text-[10px] leading-[12px] text-white font-normal tracking-[0.54px] text-opacity-70 customXs:text-base customXs:leading-[19px]'>
						/mo
					</span>
					<span className='hidden customMd:inline text-[10px] leading-[12px] text-white font-normal tracking-[0.54px] text-opacity-70 customXs:text-base customXs:leading-[19px]'>
						/month
					</span>
				</div>
			</div>
		</>
	);
};

const CompetitorTable: React.FC = () => {
	const [competitorOneSelectValue, setCompetitorOneSelectValue] = useState(0);
	const [competitorTwoSelectValue, setCompetitorTwoSelectValue] = useState(0);

	const handleSelection = (competitor: number, newValue: string) => {
		const setFunction =
			competitor === 1
				? setCompetitorOneSelectValue
				: setCompetitorTwoSelectValue;
		setFunction(parseInt(newValue));
	};

	return (
		<table className='w-full h-full table-fixed mt-[78px] customXs:mt-[102px] customSm:mt-[89px] customMd:mt-[56px]'>
			<thead className='w-full'>
				<tr className='w-full'>
					<th className='w-full'></th>
					<th className='w-full h-full text-left pb-0'>
						<div className='h-full ml-1 px-2 py-6 rounded-t-3xl bg-white bg-opacity-[0.08] customXs:pb-8 customXs:ml-2 customSm:pb-9 customSm:ml-4 customMd:ml-6 customLg:ml-8 customS:ml-4 customXs:px-4'>
							<div className='h-20 py-3 customMd:h-[85px] customLg:h-[87px]'>
								<span className='block text-lg leading-[22px] text-pricingGreen font-semibold tracking-[0.54px] customXs:text-[26px] customXs:leading-[33px]'>
									Tembo
								</span>
								<span className='h-[30px] block mt-2 text-xs leading-[15px] text-white font-normal tracking-[0.54px] customXs:h-auto customMd:text-base customMd:leading-[20px] customLg:text-lg customLg:leading-[22px]'>
									Pro 4 vCPU and 8 GB RAM
								</span>
							</div>
							<div className='flex gap-[3px] items-baseline mt-6'>
								<span className='text-xl leading-[25px] text-pricingGreen font-semibold tracking-[0.54px] customSm:text-[38px] customSm:leading-[48px]'>
									$199
								</span>
								<span className='customXs:hidden text-[10px] leading-[12px] text-white font-normal tracking-[0.54px] text-opacity-70 customXs:text-base customXs:leading-[19px]'>
									/mo
								</span>
								<span className='hidden customXs:inline text-[10px] leading-[12px] text-white font-normal tracking-[0.54px] text-opacity-70 customXs:text-base customXs:leading-[19px]'>
									/month
								</span>
							</div>
						</div>
					</th>
					<th className='w-full h-full text-left pb-0'>
						<CompetitorHeading
							competitor={1}
							competitorSelectValue={competitorOneSelectValue}
							selectHandler={handleSelection}
						/>
					</th>
					<th className='w-full h-full text-left pb-0 hidden customSm:table-cell'>
						<CompetitorHeading
							competitor={2}
							competitorSelectValue={competitorTwoSelectValue}
							selectHandler={handleSelection}
						/>
					</th>
				</tr>
			</thead>
			<tbody>
				{getCompetitorRows(
					competitorOneSelectValue,
					competitorTwoSelectValue,
				).map((cells, rowIndex, rowsArray) => (
					<tr
						key={`row-${rowIndex}`}
						className='bg-gradient-to-t from-white/20 from-[1.25%] to-black to-[1.25%] last:bg-none'
					>
						{cells.map((content, cellIndex) =>
							cellIndex === 0 ? (
								<th
									key={`cell-${cellIndex}`}
									scope='row'
									className='pt-0 h-20 text-left font-secondary font-semibold text-white text-base leading-[19px] customXs:w-[145px] customXs:text-lg customXs:leading-[22px] customSm:w-[236px] customMd:w-[280px] customLg:w-[288px]'
								>
									{content}
								</th>
							) : (
								<td
									key={`cell-${cellIndex}`}
									className={cx(
										'pt-0 h-20 text-center font-secondary font-normal text-[11px] leading-[13px] customXs:text-[15px] customXs:leading-[18px] customSm:text-lg customSm:leading-[22px] [&:nth-child(4)]:hidden [&:nth-child(4)]:customSm:table-cell',
										cellIndex === 1
											? 'text-pricingLightBlue'
											: 'text-white text-opacity-80',
									)}
								>
									<div
										className={cx(
											'relative px-2 ml-1 customS:ml-4 bg-white bg-opacity-[0.08] flex items-center justify-center h-full customXs:ml-2 customSm:ml-4 customSm:px-3 customMd:ml-6 customLg:ml-8',
											rowIndex === rowsArray.length - 1
												? 'rounded-b-3xl'
												: 'after:content-[""] after:absolute after:w-full after:-bottom-px after:left-0 after:h-[1px] after:bg-white after:opacity-10',
										)}
									>
										{typeof content === 'string' ? (
											content
										) : (
											<img
												src={getSymbolSrc(
													content,
													cellIndex,
												)}
												alt={
													content
														? 'check symbol meaning "included"'
														: 'x symbol meaning "not included"'
												}
												className='mx-auto'
											/>
										)}
									</div>
								</td>
							),
						)}
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default CompetitorTable;
