import { getCollection } from 'astro:content';
import type { SideBarSection } from '../types';
import { SIDEBAR_DOCS_ORDER } from '../content/config';
import { type CollectionEntry } from 'astro:content';
import { uppercaseFirstLetter } from '.';

export const sortSideBarLinks = (sideBarLinks: SideBarSection[]) =>
	sideBarLinks.sort((a, b) => {
		const labelA = a.label.toLowerCase();
		const labelB = b.label.toLowerCase();
		const aOrder = SIDEBAR_DOCS_ORDER.hasOwnProperty(labelA)
			? SIDEBAR_DOCS_ORDER[labelA as keyof typeof SIDEBAR_DOCS_ORDER]
			: Infinity;
		const bOrder = SIDEBAR_DOCS_ORDER.hasOwnProperty(labelB)
			? SIDEBAR_DOCS_ORDER[labelB as keyof typeof SIDEBAR_DOCS_ORDER]
			: Infinity;

		if (aOrder < bOrder) {
			return -1;
		}
		if (aOrder > bOrder) {
			return 1;
		}
		return 0;
	});

const cleanSideBarTitle = (title: string) => {
	return uppercaseFirstLetter(
		title
			?.replaceAll('-', ' ')
			?.replaceAll('_', ' ')
			?.replace(/\.mdx?/g, '')
			?.toLowerCase(),
	);
};

const getSideBarItems = (rootDocs: CollectionEntry<'docs'>[]) => {
	const items = rootDocs
		.sort((docA, docB) => {
			const aOrder = docA?.data?.sideBarPosition ?? Infinity;
			const bOrder = docB?.data?.sideBarPosition ?? Infinity;
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
			const title = cleanSideBarTitle(split[split.length - 1]);
			return {
				title: title,
				slug: `/docs/${doc.slug}`,
			};
		});
	return items;
};

// Function for getting all the links in a sidebar relative to some `slug`
// This only goes one level deep when at the root and infinite levels deep anywhere else
// Directory links can link to the doc that is at the index of 0 in the directory
export async function getSideBarLinks(): Promise<SideBarSection[]> {
	const docs = await getCollection('docs');
	const sideBarLinks: SideBarSection[] = [];
	const sideBarRoots = new Set();

	docs.forEach((doc) => {
		const sectionTitle = uppercaseFirstLetter(doc.id.split('/')[0]);
		sideBarRoots.add(sectionTitle);
	});

	Array.from(sideBarRoots).forEach(async (root: any) => {
		const rootDocs = docs.filter((doc) =>
			doc.id.startsWith(root.toLowerCase()),
		);

		sideBarLinks.push({
			label: root.toUpperCase().replaceAll('-', ' ').replaceAll('_', ' '),
			items: getSideBarItems(rootDocs)
				.map((item) => {
					if (item.slug.split('/').length !== 4) {
						return {
							title: cleanSideBarTitle(item.slug.split('/')[3]),
							slug: getSideBarItems(
								rootDocs.filter((doc) =>
									doc.slug.includes(item.slug.split('/')[3]),
								),
							)[0].slug,
						};
					}
					return item;
				})
				.filter(
					(value, index, self) =>
						index ===
						self.findIndex((t) => t.title === value.title),
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
	// Filter by docs that are 2nd parents of the slug
	const rootDocs = docs.filter((doc) => slug.includes(doc.id.split('/')[1]));
	// Push the first level of docs
	sideBarLinks.push({
		label: cleanSideBarTitle(slug.split('/')[1]),
		items: getSideBarItems(rootDocs).filter(
			(item) => item.slug.split('/').length === 5,
		),
	});
	// Push the all the other levels
	rootDocs
		.filter((doc) => doc.slug.split('/').length > 3)
		.forEach((doc) => {
			const split = doc.id.split('/');
			const splitTitle = split[split.length - 2];
			const title = cleanSideBarTitle(splitTitle);
			// Skip pushing if the title is already in the sideBarLinks
			if (sideBarLinks.some((item) => item.label === title)) {
				return;
			}
			sideBarLinks.push({
				label: title,
				items: getSideBarItems(rootDocs).filter((item) => {
					const splitSlug = item.slug.split('/');

					return (
						splitSlug.length > 5 &&
						splitSlug[splitSlug.length - 2] === splitTitle
					);
				}),
			});
		});

	return sideBarLinks;
}

export function isNested(slug: string) {
	return slug.split('/').length >= 3;
}
