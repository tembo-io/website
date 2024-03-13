export interface SideBarItem {
	title: string;
	slug: string;
}
export interface SideBarSection {
	label: string;
	items: SideBarItem[];
	icon?: string;
}
