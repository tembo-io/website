export interface SideBarItem {
	label: string;
	slug: string;
	icon?: string;
}
export interface SideBarSection {
	label: string;
	items: SideBarItem[];
}
