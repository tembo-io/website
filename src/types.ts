export interface SideBarItem {
	title: string;
	slug: string;
	uppercaseParent: boolean;
	children?: SideBarItem[];
}
export interface SideBarSection {
	label: string;
	items: SideBarItem[];
	icon?: string;
}
