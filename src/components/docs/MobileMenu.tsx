import Container from '../Container';
import type { SideBarSection } from '../../types';

interface Props {
	sideBarMenuSections: SideBarSection[];
	isNestedSideBar: boolean;
}

const MobileMenu = () => {
	return (
		<div className='bg-offBlack mid:hidden fixed z-4 w-screen h-screen overflow-hidden inset-0'>
			<Container styles='h-[100%] pb-12'>
				<nav className='flex flex-col gap-[20px] h-full justify-between w-full'></nav>
			</Container>
		</div>
	);
};

export default MobileMenu;
