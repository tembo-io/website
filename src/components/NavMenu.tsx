import { useState, useRef, type FC } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import cx from 'classnames';

interface NavMenuOption {
	link: string;
	displayName: string;
}

interface Props {
	id: number;
	currentPage: string;
	options: NavMenuOption[];
	selectedPage: string;
	selectedPageDisplayName: string;
}

const NavMenu: FC<Props> = ({
	id,
	currentPage,
	options,
	selectedPage,
	selectedPageDisplayName,
}) => {
	const [openMenu, setOpenMenu] = useState<number | null>(null);
	const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const handleMouseEnter = (id: number) => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current);
			closeTimeoutRef.current = null;
		}
		setOpenMenu(id);
	};

	const handleMouseLeave = () => {
		// Set a delay before closing the menu
		closeTimeoutRef.current = setTimeout(() => {
			setOpenMenu(null);
		}, 300); // 300ms delay before closing
	};
	return (
		<NavigationMenu.Root
			orientation='vertical'
			className='flex relative justify-start'
		>
			<NavigationMenu.List className='flex flex-column'>
				<NavigationMenu.Item
					key={id}
					onMouseEnter={() => handleMouseEnter(id)}
					onMouseLeave={handleMouseLeave}
				>
					<NavigationMenu.Trigger
						className={cx(
							'flex flex-row gap-1 justify-between items-center',
							currentPage.includes(selectedPage)
								? 'text-neon'
								: 'text-white opacity-70',
						)}
					>
						{selectedPageDisplayName}
						{openMenu === id ? (
							<img
								src='/arrow-up.svg'
								height={16}
								width={16}
								alt='minus symbol'
							/>
						) : (
							<img
								src='/arrow-down.svg'
								height={16}
								width={16}
								alt='minus symbol'
							/>
						)}
					</NavigationMenu.Trigger>
					{openMenu === id && (
						<NavigationMenu.Content className='flex flex-column py-4 px-2 rounded-3xl bg-mwasi border border-otherGrey2 absolute top-8 left-0 w-[214px]'>
							<ul className='w-full'>
								{options.map((option) => {
									return (
										<li className='py-2 pl-4 hover:rounded-3xl hover:bg-grayScaleMwasi w-full'>
											<NavigationMenu.Link
												className='font-secondary font-normal text-sm text-offWhite w-full'
												href={option.link}
											>
												{option.displayName}
											</NavigationMenu.Link>
										</li>
									);
								})}
							</ul>
						</NavigationMenu.Content>
					)}
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	);
};

export default NavMenu;
