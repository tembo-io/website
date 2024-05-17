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

export interface GroupedItem {
	sectionHeading?: string;
	title: string;
	uppercaseParent: boolean;
	slug: string;
	children: SideBarItem[];
}

export interface NestedItemType {
	sectionHeading: string;
	title: string;
	uppercaseParent: boolean;
	child: SideBarItem;
}
