import { getCollection } from 'astro:content';
import type {
	SideBarSection,
	SideBarItem,
	GroupedItem,
	NestedItemType,
} from '../types';
import {
	ROOT_SIDEBAR_DOCS_ORDER,
	ROOT_SIDEBAR_DOCS_ICONS,
} from '../content/config';
import { type CollectionEntry } from 'astro:content';
import { uppercaseFirstLetter } from '.';

// TODO: refactor this file once we better determine the structure of our docs :)

// This sorts the root sidebar links for any doc that is one level deep (e.g `/docs/cloud`)
export const sortSideBarLinks = (sideBarLinks: SideBarSection[]) =>
	sideBarLinks.sort((a, b) => {
		const labelA = a.label.toLowerCase();
		const labelB = b.label.toLowerCase();
		const aOrder = ROOT_SIDEBAR_DOCS_ORDER.hasOwnProperty(labelA)
			? ROOT_SIDEBAR_DOCS_ORDER[
					labelA as keyof typeof ROOT_SIDEBAR_DOCS_ORDER
				]
			: Infinity;
		const bOrder = ROOT_SIDEBAR_DOCS_ORDER.hasOwnProperty(labelB)
			? ROOT_SIDEBAR_DOCS_ORDER[
					labelB as keyof typeof ROOT_SIDEBAR_DOCS_ORDER
				]
			: Infinity;

		if (aOrder < bOrder) {
			return -1;
		}
		if (aOrder > bOrder) {
			return 1;
		}
		return 0;
	});

export const cleanSideBarTitle = (title: string) => {
	return uppercaseFirstLetter(
		title
			?.replaceAll('-', ' ')
			?.replaceAll('_', ' ')
			?.replace(/\.mdx?/g, '')
			?.toLowerCase(),
	);
};

const filterDuplicates = (
	docs: { title: string; slug: string; uppercaseParent: boolean }[],
) => {
	const result: SideBarItem[] = [];
	const slugMap = new Map();

	for (const item of docs) {
		const { slug, uppercaseParent } = item;
		const existing = slugMap.get(slug);
		if (!existing) {
			slugMap.set(slug, item);
			result.push(item);
			// uppercase parent takes precedence
		} else if (uppercaseParent && !existing.uppercaseParent) {
			result[result.indexOf(existing)] = item;
			slugMap.set(slug, item);
		}
	}
	return result;
};

const isUpperCase = (rootDocs: CollectionEntry<'docs'>[]) => {
	return getSideBarItems(rootDocs).some((doc) => doc.uppercaseParent);
};

const getSideBarItems = (rootDocs: CollectionEntry<'docs'>[]) => {
	const items = rootDocs
		.sort((docA, docB) => {
			const aOrder = docA?.data?.sideBarPosition;
			const bOrder = docB?.data?.sideBarPosition;
			if (aOrder < bOrder) {
				return -1;
			}
			if (aOrder > bOrder) {
				return 1;
			}
			return 0;
		})
		.map((doc) => {
			const split = doc.id.split('/');
			const title =
				doc?.data?.sideBarTitle ??
				cleanSideBarTitle(split.at(-1) as string);

			return {
				title: doc.data.uppercase ? title.toUpperCase() : title,
				slug: `/docs/${doc.slug}`,
				uppercaseParent: doc.data.uppercaseParent,
			};
		});
	return items;
};

// This function gets sideBar links for any doc that isnt nested down one level
export async function getSideBarLinks(): Promise<SideBarSection[]> {
	const docs = await getCollection('docs');
	const sideBarLinks: SideBarSection[] = [];
	const sideBarRoots = new Set();

	docs.forEach((doc) => {
		sideBarRoots.add(doc.id.split('/')[0]);
	});

	Array.from(sideBarRoots).forEach(async (root: any) => {
		const rootDocs = docs.filter((doc) =>
			doc.id.startsWith(root.toLowerCase()),
		);

		sideBarLinks.push({
			label: root.toUpperCase().replaceAll('-', ' ').replaceAll('_', ' '),
			icon: ROOT_SIDEBAR_DOCS_ICONS[
				root
					.replaceAll('-', ' ')
					.replaceAll(
						'_',
						' ',
					) as string as keyof typeof ROOT_SIDEBAR_DOCS_ICONS
			],
			items: filterDuplicates(
				getSideBarItems(rootDocs).map((item) => {
					const itemSlugSplit = item.slug.split('/');
					// Anything nested down more than 4 levels will get grouped under one link
					if (itemSlugSplit.length > 4) {
						const cleanedTitle = cleanSideBarTitle(
							itemSlugSplit[3],
						);
						return {
							title: item.uppercaseParent
								? cleanedTitle.toUpperCase()
								: cleanedTitle,
							slug: getSideBarItems(
								rootDocs.filter((doc) => {
									return (
										doc.slug.split('/')[1] ===
											itemSlugSplit[3] &&
										doc.slug.split('/').length === 3
									);
								}),
							)[0].slug,
							uppercaseParent: item.uppercaseParent,
						};
					}
					return item;
				}),
			),
		});
	});

	return sortSideBarLinks(sideBarLinks);
}

export async function getNestedSideBarLinks(
	slug: string,
): Promise<SideBarSection[]> {
	const docs = await getCollection('docs');
	const sideBarLinks: SideBarSection[] = [];
	// Filter by docs that are 2nd parents of the slug (n: ones that include product/stacks out of all docs)
	const rootDocs = docs.filter((doc) =>
		slug
			.toLowerCase()
			.includes(doc.id.toLowerCase().split('/').splice(0, 2).join('/')),
	);
	// title - stacks
	const title = cleanSideBarTitle(slug.split('/')[1]);
	// Push the first level of docs (e.g /docs/cloud/nested-dir/doc.md)
	sideBarLinks.push({
		label: isUpperCase(rootDocs) ? title.toUpperCase() : title,
		items: getSideBarItems(rootDocs).filter(
			// /docs/product/stacks/intro-to-stacks and /docs/product/stacks/adding-new-stacks will be pushed first because 5
			(item) => item.slug.split('/').length === 5,
		),
	});

	rootDocs
		// 'product/stacks/analytical/timeseries' on .split gives gives ['product', 'stacks', 'analytical', 'timeseries']
		.filter((doc) => doc.slug.split('/').length === 4)
		.forEach((doc) => {
			// product/stacks/Analytical/data-warehouse.md - id
			const split = doc.id.toLowerCase().split('/');
			// get analytical and uppercase it
			const splitTitle = split[split.length - 2];
			const title = cleanSideBarTitle(splitTitle);
			// Skip pushing if the title is already in the sideBarLinks array
			if (sideBarLinks.some((item) => item.label === title)) {
				return;
			}
			sideBarLinks.push({
				label: title,
				items: getSideBarItems(rootDocs).filter((item) => {
					// /docs/product/stacks/analytical/timeseries on .split gives ['', 'docs', 'product', 'stacks', 'analytical', 'timeseries']
					const splitSlug = item.slug.split('/');
					return (
						splitSlug.length > 5 &&
						splitSlug[splitSlug.length - 2] ===
							splitTitle.toLowerCase()
					);
				}),
			});
		});

	const nestedItems: NestedItemType[] = [];
	rootDocs
		.filter((doc) => doc.slug.split('/').length > 4)
		.map((doc) => {
			// product/stacks/Analytical/olap3/data-warehouse.md - id
			const split = doc.id.toLowerCase().split('/');
			// get analytical and uppercase it
			const splitTitle = split[split.length - 3];
			const title = cleanSideBarTitle(splitTitle);

			nestedItems.push({
				sectionHeading: title,
				title: doc.data.uppercaseParent
					? cleanSideBarTitle(split[split.length - 2]).toUpperCase()
					: cleanSideBarTitle(split[split.length - 2]),
				uppercaseParent: false,
				child: {
					title:
						doc.data.sideBarTitle ??
						(doc.data.uppercase
							? cleanSideBarTitle(
									split[split.length - 1],
								).toUpperCase()
							: cleanSideBarTitle(split[split.length - 1])),
					slug: `/docs/${doc.slug}`,
					uppercaseParent: doc.data.uppercaseParent,
				},
			});
		});

	const groupedItems: { [key: string]: GroupedItem } = {};

	nestedItems.forEach((item) => {
		const key = `${item.sectionHeading}-${item.title}`;

		if (!groupedItems[key]) {
			groupedItems[key] = {
				sectionHeading: item.sectionHeading,
				title: item.title,
				uppercaseParent: item.uppercaseParent,
				slug: '#',
				children: [],
			};
		}

		groupedItems[key].children.push(item.child);
	});

	const groupedItemsArray = Object.values(groupedItems);

	for (let i = 0; i < groupedItemsArray.length; i++) {
		for (let j = 0; j < sideBarLinks.length; j++) {
			if (groupedItemsArray[i].sectionHeading === sideBarLinks[j].label) {
				delete groupedItemsArray[i]['sectionHeading'];
				sideBarLinks[j].items.push(groupedItemsArray[i]);
			}
		}
	}

	return sideBarLinks;
}

/**
 * Grabs every single doc and sorts them then grabs the next doc after the provided `slug`
 * @param slug
 */
export async function nextDoc(
	slug: string,
	sortedLinks: SideBarSection[],
): Promise<{ parentLabel: string; title: string; slug: string }> {
	let nextItem = {
		parentLabel: '',
		title: '',
		slug: '',
	};

	sortedLinks.forEach((section, index) => {
		const sideBarSection = section.items.find((item) => item.slug === slug);
		if (sideBarSection) {
			const currIndex = section.items.indexOf(sideBarSection);
			if (currIndex === section.items.length - 1) {
				const nextSectionIndex =
					index === sortedLinks.length - 1 ? 0 : index + 1;

				if (nextSectionIndex === 0) {
					nextItem = {
						parentLabel: 'Home',
						title: 'Docs',
						slug: '/docs',
					};
					return;
				}

				nextItem = {
					parentLabel: sortedLinks[nextSectionIndex].label,
					...sortedLinks[nextSectionIndex].items[0],
				};
				return;
			}

			if (section.items[currIndex + 1].children) {
				nextItem = {
					parentLabel: section.label,
					title: section.items[currIndex + 1].children![0].title,
					slug: section.items[currIndex + 1].children![0].slug,
				};
			} else {
				nextItem = {
					parentLabel: section.label,
					...section.items[currIndex + 1],
				};
			}
			return;
		} else {
			// NOTE all nested groups with children will be at the bottom of a sidebar section
			// for nested docs
			const nestedItem = section.items.find((item) => {
				if (item.children) {
					const found = item.children.find((nestedItem) => {
						return nestedItem.slug === slug;
					});
					return found;
				}
				return false;
			});

			if (!nestedItem || !nestedItem.children) return;

			const currNestedIndex = nestedItem.children.findIndex(
				(item) => item.slug === slug,
			);

			// find the index of the current item of a sidebar section
			const currentNestedItemIndex = section.items.findIndex(
				(sectionItem) => sectionItem === nestedItem,
			);

			// is it one of the last children document
			if (currNestedIndex === nestedItem.children.length - 1) {
				// check if there are more nested items after
				let nextNestedItemIndex: number;
				// const nextNestedItemIndex = currentNestedItemIndex === section.items.length - 1 ? 0 : currentNestedItemIndex + 1

				// last nested item in a section
				if (currentNestedItemIndex === section.items.length - 1) {
					const nextSectionIndex =
						index === sortedLinks.length - 1 ? 0 : index + 1;
					if (nextSectionIndex === 0) {
						nextItem = {
							parentLabel: 'Home',
							title: 'Docs',
							slug: '/docs',
						};
						return;
					}

					nextItem = {
						parentLabel: sortedLinks[nextSectionIndex].label,
						...sortedLinks[nextSectionIndex].items[0],
					};
					return;
				} else {
					// there are more nested items in this section
					nextNestedItemIndex = currentNestedItemIndex + 1;

					nextItem = {
						parentLabel: section.label,
						// ...nestedItem.children[nextNestedItemIndex],
						...section.items[nextNestedItemIndex].children![0],
					};
					return;
				}
			} else {
				// next children index
				nextItem = {
					parentLabel: section.label,
					...nestedItem.children[currNestedIndex + 1],
				};
				return;
			}
		}
	});

	return nextItem;
}

export function getParentLabel(slug: string) {
	const split = slug.split('/');
	return cleanSideBarTitle(split[split.length - 3]);
}

/**
 *  A doc is nested if it is down more than 1 level (e.g /docs/cloud/nested-dir/doc.md)
 *  Note: Assumes the slug does not include `/docs`
 * */
export function isNested(slug: string) {
	return slug.split('/').length >= 3;
}

export function githubEditLink(doc_id: string) {
	const BASE_URL =
		'https://github.com/tembo-io/website/edit/main/src/content/docs/';
	return `${BASE_URL}${doc_id}`;
}
