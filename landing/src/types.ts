export interface SideBarItem {
	title: string;
	slug: string;
	icon?: string;
}
export interface SideBarSection {
	label: string;
	items: SideBarItem[];
}
