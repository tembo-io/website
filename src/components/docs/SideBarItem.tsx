import React, { useState } from 'react';
import type { SideBarItem as SideBarItemType } from '../../types';
import { styles } from '../../util';

interface Props {
	item: SideBarItemType;
	currentPath: string;
	isRootNested: boolean;
}

const SideBarItem: React.FC<Props> = ({ item, currentPath, isRootNested }) => {
	const [isShowingChevron, setIsShowingChevron] = useState(false);

	return (
		<>
			<div
				className='flex items-center gap-2 w-full'
				onMouseEnter={() => setIsShowingChevron(true)}
				onMouseLeave={() => setIsShowingChevron(false)}
			>
				<a
					href={item.slug}
					className={styles(
						'font-secondary text-lightGrey hover:text-white transition-all duration-100 text-sm w-full flex justify-between items-center',
						currentPath.includes(item.slug) && 'text-white',
					)}
				>
					{item.title}{' '}
					{item.children && item.children.length > 0 && (
						<img
							src='/arrow-right.svg'
							height={14}
							width={14}
							alt='chevron right arrow'
							className={styles(
								'transition-all duration-150 ease-in-out opacity-100',
							)}
						/>
					)}
				</a>
				{isRootNested && (
					<img
						src='/arrow-right.svg'
						height={14}
						width={14}
						alt='chevron right arrow'
						className={styles(
							'transition-all duration-150 ease-in-out',
							isShowingChevron ? 'opacity-1' : 'opacity-0',
						)}
					/>
				)}
			</div>
			{/* {JSON.stringify(deepNestedItems)} */}
		</>
	);
};

export default SideBarItem;
