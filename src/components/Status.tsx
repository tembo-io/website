import React, { useEffect, useState } from 'react';
import cx from 'classnames';

type StatusVariant =
	| 'Operational'
	| 'Degraded Performance'
	| 'Partial Service Disruption'
	| 'Service Disruption'
	| 'Security issue';

const getVariant = (status: StatusVariant) => {
	switch (status) {
		case 'Operational':
			return {
				status: 'All Systems Normal.',
				image: 'elephantHoldingFlag.svg',
				pillStyles: 'bg-[#1BBF7A1A]',
				textStyles: 'text-good',
			};
		case 'Degraded Performance':
			return {
				status: `${status}.`,
				image: 'elephantHoldingOrangeFlag.svg',
				pillStyles: 'bg-[#F394051A]',
				textStyles: 'text-warning',
			};
		case 'Partial Service Disruption':
			return {
				status: `${status}.`,
				image: 'elephantHoldingOrangeFlag.svg',
				pillStyles: 'bg-[#F394051A]',
				textStyles: 'text-warning',
			};
		case 'Service Disruption':
			return {
				status,
				image: 'elephantHoldingRedFlag.svg',
				pillStyles: 'bg-[#FA46661A]',

				textStyles: 'text-danger',
			};
		case 'Security issue':
			return {
				variant: 'Error',
				status: `${status}.`,
				image: 'elephantHoldingRedFlag.svg',
				pillStyles: 'bg-[#FA46661A]',
				textStyles: 'text-danger',
			};
		default:
			return {
				status: `${status}.`,
				image: 'elephantHoldingFlag.svg',
				pillStyles: 'bg-[#1BBF7A1A]',
				textStyles: 'text-good',
			};
	}
};

const Status = () => {
	const [variant, setVariant] = useState<StatusVariant | null>(null);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const response = await fetch(
					'https://4120522736572302.hostedstatus.com/1.0/status/661d4e60acc88f053464e634',
				);
				const jsonData = await response.json();
				setVariant(jsonData?.result?.status_overall?.status);
			} catch {}
		};

		fetchStatus();
	}, []);

	if (!variant) {
		return null;
	}

	const status = getVariant(variant);
	return (
		<a
			href='https://status.tembo.io'
			target='_blank'
			rel='noreferror'
			className={cx(
				'flex items-center w-max gap-4 py-2 px-4 rounded-full',
				status.pillStyles,
			)}
		>
			<img
				src={`/${status.image}`}
				width={45}
				height={45}
				alt='elephant holding flag'
			/>
			<p className={cx('font-bold', status.textStyles)}>
				{status.status}
			</p>
		</a>
	);
};

export default Status;
