import React from 'react';

import blueCheck from '../images/blueCheck.svg';
import blueX from '../images/blueX.svg';

interface Props {
	rows: (string | boolean)[][];
	index: number;
}

const SingleSubjectTable: React.FC<Props> = ({ rows, index }) => {
	return (
		<table className='mt-3 w-full table-fixed'>
			<tbody>
				{rows.map((row, i) => (
					<tr
						key={`row-${i}`}
						className='h-16 border-b border-white border-opacity-20'
					>
						<th
							scope='row'
							className='text-left font-secondary font-semibold text-white text-base leading-[19px]'
						>
							{row[0]}
						</th>
						{typeof row[index] === 'string' ? (
							<td className='text-center font-secondary text-pricingLightBlue font-normal text-base leading-[22px]'>
								{row[index]}
							</td>
						) : (
							<td>
								<img
									src={row[index] ? blueCheck.src : blueX.src}
									alt={
										row[index]
											? 'check symbol meaning "included"'
											: 'x symbol meaning "not included"'
									}
									className='mx-auto h-[61px] w-[61px]'
								/>
							</td>
						)}
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default SingleSubjectTable;
