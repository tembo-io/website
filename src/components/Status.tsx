import React, { useEffect, useState } from 'react';
// https://api.status.io/v2/status/summary/661d4e60acc88f053464e634

const Status = () => {
	const [data, setData] = useState(null);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					'https://4120522736572302.hostedstatus.com/1.0/status/661d4e60acc88f053464e634  ',
				);
				const jsonData = await response.json();
				console.log('STATUS DATA', jsonData);
				setData(jsonData);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, []);
	return (
		<a
			href='https://status.tembo.io'
			target='_blank'
			rel='noreferror'
			className='flex items-center w-max gap-4 py-2 px-4 rounded-full bg-[#1BBF7A1A] font-bold'
		>
			<img
				src='/elephantHoldingFlag.svg'
				width={45}
				height={45}
				alt='elephant holding flag'
			/>
			<p className='text-good'>All Systems Normal.</p>
		</a>
	);
};

export default Status;
