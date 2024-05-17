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
	const [openChildrenDocs, setOpenChildrenDocs] = useState(
		currentPath.split('/').length > 6,
	);
	const handleItemClick = (e: React.MouseEvent) => {
		setOpenChildrenDocs((prev) => !prev); // Toggle the open state
	};

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
					onClick={handleItemClick}
				>
					{item.title}
					{item.children &&
						item.children.length > 0 &&
						(openChildrenDocs ? (
							<img
								src='/arrow-down.svg'
								height={14}
								width={14}
								alt='chevron right arrow'
								className={styles(
									'transition-all duration-150 ease-in-out opacity-100',
								)}
							/>
						) : (
							<img
								src='/arrow-right.svg'
								height={14}
								width={14}
								alt='chevron right arrow'
								className={styles(
									'transition-all duration-150 ease-in-out opacity-100',
								)}
							/>
						))}
				</a>

				{isRootNested && (
					<img
						src='/arrow-right.svg'
						height={14}
						width={14}
						alt='chevron down arrow'
						className={styles(
							'transition-all duration-150 ease-in-out',
							isShowingChevron ? 'opacity-1' : 'opacity-0',
						)}
					/>
				)}
			</div>
			<div className='flex flex-col border-l-slate-500 border-l-[1px] gap-y-1'>
				{openChildrenDocs &&
					item.children &&
					item.children.length > 0 &&
					item.children.map((child, index) => (
						<a
							key={index}
							href={child.slug}
							className={styles(
								'font-secondary text-lightGrey hover:text-white text-sm w-full flex justify-between items-center ml-4',
								currentPath.includes(child.slug) &&
									'text-white',
							)}
						>
							{child.title}
						</a>
					))}
			</div>
		</>
	);
};

export default SideBarItem;
