import { type FC } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

interface Props {
	isOpen: boolean;
}

const SolutionsNav: FC<Props> = ({ isOpen }) => {
	return (
		<NavigationMenu.Root
			orientation='vertical'
			className='flex relative justify-start'
		>
			<NavigationMenu.List className='flex flex-column'>
				<NavigationMenu.Item>
					<NavigationMenu.Trigger className='flex flex-row gap-1 justify-between items-center'>
						Solutions
						{isOpen ? (
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
					{isOpen && (
						<NavigationMenu.Content className='flex flex-column py-4 px-2 rounded-3xl bg-mwasi border border-otherGrey2 absolute top-8 left-0 w-[214px]'>
							<ul className='w-full'>
								<li className='py-2 pl-4 hover:rounded-3xl hover:bg-grayScaleMwasi w-full'>
									<NavigationMenu.Link
										className='font-secondary font-normal text-sm text-offWhite w-full'
										href='/solutions/transactional'
									>
										Tembo Transactional
									</NavigationMenu.Link>
								</li>

								<li className='py-2 pl-4 hover:rounded-3xl hover:bg-grayScaleMwasi w-full'>
									<NavigationMenu.Link
										href='/solutions/ai'
										className='font-secondary font-normal text-sm text-offWhite w-full'
									>
										Tembo AI
									</NavigationMenu.Link>
								</li>
							</ul>
						</NavigationMenu.Content>
					)}
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	);
};

export default SolutionsNav;
