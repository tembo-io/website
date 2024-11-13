import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import sidebarConfig from '../components/docs/university/sidebarConfig.json';

// Types
export interface SidebarItem {
	title: string;
	entry?: CollectionEntry<'university'>;
	indexEntry?: CollectionEntry<'university'>;
	[key: string]:
		| SidebarItem
		| string
		| CollectionEntry<'university'>
		| undefined;
}

// Build the initial sidebar structure
export function buildSidebarStructure(
	entries: CollectionEntry<'university'>[],
): SidebarItem {
	const structure = {} as SidebarItem;

	entries.forEach((entry) => {
		const parts = entry.slug.split('/');
		let current: SidebarItem = structure;

		parts.forEach((part, index) => {
			if (index === parts.length - 1 && part === 'index') {
				// This is an index.md file
				Object.assign(current, {
					indexEntry: entry,
					title: entry.data.title || current.title || part,
				});
			} else {
				if (!current[part]) {
					const customTitle =
						sidebarConfig.folderTitles[
							part as keyof typeof sidebarConfig.folderTitles
						] || part;
					current[part] = { title: customTitle };
				}
				if (index === parts.length - 1) {
					Object.assign(current[part] as SidebarItem, { entry });
				} else {
					current = current[part] as SidebarItem;
				}
			}
		});
	});

	return structure;
}

// Helper functions
export function isFolder(item: SidebarItem): boolean {
	return Object.keys(item).some((key) => key !== 'title' && key !== 'entry');
}

export function getSideBarPosition(item: SidebarItem): number {
	return item.entry?.data.sideBarPosition ?? Infinity;
}

// Sort the sidebar structure
export function sortSidebarStructure(structure: SidebarItem): SidebarItem {
	const sortEntries = (entries: [string, SidebarItem][]) => {
		return entries.sort((a, b) => {
			const [, itemA] = a;
			const [, itemB] = b;
			const posA = getSideBarPosition(itemA);
			const posB = getSideBarPosition(itemB);

			if (posA === posB) {
				return a[0].localeCompare(b[0]);
			}

			return posA - posB;
		});
	};

	const sortRecursive = (item: SidebarItem): SidebarItem => {
		if (!isFolder(item)) {
			return item;
		}

		const entries = Object.entries(item);
		const sortedEntries = sortEntries(entries as [string, SidebarItem][]);

		const sortedItem: SidebarItem = {
			title: item.title,
			entry: item.entry,
		};

		sortedEntries.forEach(([key, value]) => {
			if (key !== 'title' && key !== 'entry') {
				sortedItem[key] = sortRecursive(value);
			}
		});

		return sortedItem;
	};

	return sortRecursive(structure);
}

// Process the structure for display
export function getDisplayStructure(
	sortedSidebarStructure: SidebarItem,
	pathParts: string[],
): SidebarItem {
	// Remove title and entry from the root level
	const cleanedStructure = sortedSidebarStructure;
	delete (cleanedStructure as any).title;
	delete (cleanedStructure as any).entry;

	if (pathParts.length > 2 && pathParts[1] === 'courses') {
		return {
			courses: cleanedStructure['courses'] as SidebarItem,
		} as unknown as SidebarItem;
	}

	return Object.entries(cleanedStructure).reduce((acc, [key, value]) => {
		if (key === 'courses') {
			acc[key] = {
				title: 'Courses',
				entry: (value as SidebarItem)?.['entry'],
				...Object.fromEntries(
					Object.entries(value as SidebarItem)
						.filter(
							([subKey]) =>
								subKey !== 'entry' && subKey !== 'title',
						)
						.map(([subKey, subValue]) => [
							subKey,
							{
								title: (subValue as SidebarItem).title,
								entry: (subValue as SidebarItem).entry,
							},
						]),
				),
			};
		} else {
			acc[key] = value;
		}
		return acc;
	}, {} as SidebarItem);
}

// next and previous navigation
// for university docs
interface DocNavigation {
	title: string | undefined;
	slug: string;
	subTitle?: string;
}

function formatSubtitle(subtitle: string): string {
	return subtitle
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function flattenSidebarStructure(structure: SidebarItem): DocNavigation[] {
	const flattened: DocNavigation[] = [];

	function traverse(item: SidebarItem) {
		// Add index entry first if it exists
		if (item.indexEntry) {
			flattened.push({
				title: item.indexEntry.data.title,
				slug: `/university/${item.indexEntry.slug}`,
				subTitle: formatSubtitle(item.title),
			});
		}

		// Then add regular entry if it exists
		if (item.entry) {
			flattened.push({
				title: item.entry.data.title,
				slug: `/university/${item.entry.slug}`,
				subTitle: formatSubtitle(item.title),
			});
		}

		// Traverse nested items
		Object.keys(item).forEach((key) => {
			if (key !== 'title' && key !== 'entry') {
				traverse(item[key] as SidebarItem);
			}
		});
	}

	traverse(structure);
	return flattened;
}

export async function getDocumentNavigation(currentSlug: string): Promise<{
	prevDoc: DocNavigation | null;
	nextDoc: DocNavigation | null;
}> {
	const allUniversityContent = await getCollection('university');

	// Use your existing functions to build and sort the structure
	const sidebarStructure = buildSidebarStructure(allUniversityContent);
	const sortedSidebarStructure = sortSidebarStructure(sidebarStructure);

	// Flatten the structure into an array
	const flattenedDocs = flattenSidebarStructure(sortedSidebarStructure);

	// Find the current document's index
	const currentIndex = flattenedDocs.findIndex(
		(doc) => doc.slug === `/university/${currentSlug}`,
	);

	if (currentIndex === -1) return { prevDoc: null, nextDoc: null };

	return {
		prevDoc: currentIndex > 0 ? flattenedDocs[currentIndex - 1] : null,
		nextDoc:
			currentIndex < flattenedDocs.length - 1
				? flattenedDocs[currentIndex + 1]
				: null,
	};
}
