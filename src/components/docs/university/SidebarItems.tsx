import React, { useState, useEffect } from 'react';
import type { CollectionEntry } from 'astro:content';
import sidebarConfig from './sidebarConfig.json';
interface SidebarItem {
	title: string;
	entry?: CollectionEntry<'university'>;
	[key: string]:
		| SidebarItem
		| string
		| CollectionEntry<'university'>
		| undefined;
}

interface SidebarItemsProps {
	structure: SidebarItem;
	currentPath: string;
	isTopLevel: boolean;
}

const SidebarItems: React.FC<SidebarItemsProps> = ({
	structure,
	currentPath,
	isTopLevel,
}) => {
	const [openItems, setOpenItems] = useState<Set<string>>(new Set());

	useEffect(() => {
		// Open items based on the current path
		const pathParts = currentPath.split('/').filter(Boolean).slice(1);
		let currentItem = structure;
		const newOpenItems = new Set<string>();

		for (const part of pathParts) {
			if (currentItem[part]) {
				newOpenItems.add(part);
				currentItem = currentItem[part] as SidebarItem;
			} else {
				break;
			}
		}

		setOpenItems(newOpenItems);
	}, [currentPath, structure]);

	const renderSidebarItem = (
		key: string,
		value: SidebarItem,
		path: string[] = [],
	) => {
		const slug = value.entry?.slug;
		const isActive = currentPath.includes(slug || '#');
		const hasChildren = Object.keys(value).some(
			(key) => key !== 'title' && key !== 'indexEntry' && key !== 'entry',
		);
		const itemPath = [...path, key];
		const isOpen = openItems.has(key);

		const displayTitle =
			value.entry?.data.sideBarTitle ||
			value.title ||
			sidebarConfig.folderTitles[
				key as keyof typeof sidebarConfig.folderTitles
			] ||
			key;

		const toggleOpen = (e: React.MouseEvent) => {
			e.stopPropagation();
			setOpenItems((prev) => {
				const newSet = new Set(prev);
				if (newSet.has(key)) {
					newSet.delete(key);
				} else {
					newSet.add(key);
				}
				return newSet;
			});
		};

		const handleClick = (e: React.MouseEvent) => {
			if (hasChildren && !slug) {
				toggleOpen(e);
			}
		};

		return (
			<li key={itemPath.join('/')} className='flex flex-col w-full'>
				<div className='flex items-center w-full'>
					{slug ? (
						<a
							href={`/university/${slug}`}
							className={`flex justify-between items-center font-secondary text-lightGrey hover:text-white transition-all duration-100 text-sm flex-grow py-1 ${isActive ? 'text-white' : ''}`}
						>
							{displayTitle}
							{slug.split('/').length > 1 &&
								slug.split('/')[0] === 'courses' &&
								isTopLevel && (
									<img
										src={
											isOpen
												? '/arrow-down.svg'
												: '/arrow-right.svg'
										}
										height={14}
										width={14}
										alt='chevron arrow'
										className='transition-all duration-150 ease-in-out opacity-100'
									/>
								)}
						</a>
					) : (
						<span
							onClick={handleClick}
							className={`font-secondary text-lightGrey hover:text-white transition-all duration-100 text-sm flex-grow py-1 cursor-pointer ${isActive ? 'text-white' : ''}`}
						>
							{displayTitle}
						</span>
					)}
					{hasChildren && (
						<button
							onClick={toggleOpen}
							className='ml-2 p-1 focus:outline-none'
						>
							<img
								src={
									isOpen
										? '/arrow-down.svg'
										: '/arrow-right.svg'
								}
								height={14}
								width={14}
								alt='chevron arrow'
								className='transition-all duration-150 ease-in-out opacity-100'
							/>
						</button>
					)}
				</div>
				{hasChildren && isOpen && (
					<ul className='flex flex-col border-l-[#EAEAEA33] border-l-[1px] space-y-2 pl-4 mt-1'>
						{Object.entries(value)
							.filter(
								([subKey]) =>
									subKey !== 'title' &&
									subKey !== 'indexEntry' &&
									subKey !== 'entry',
							)
							.map(([subKey, subValue]) =>
								renderSidebarItem(
									subKey,
									subValue as SidebarItem,
									itemPath,
								),
							)}
					</ul>
				)}
			</li>
		);
	};

	return (
		<ul className='flex flex-col gap-2 w-full'>
			{Object.entries(structure).map(([key, value]) =>
				renderSidebarItem(key, value as SidebarItem),
			)}
		</ul>
	);
};

export default SidebarItems;
