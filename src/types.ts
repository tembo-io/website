export interface SideBarItem {
	title: string;
	slug: string;
	uppercaseParent: boolean;
}
export interface SideBarSection {
	label: string;
	items: SideBarItem[];
	icon?: string;
}
