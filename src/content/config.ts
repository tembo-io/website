import {
	defineCollection,
	z,
	getCollection,
	type CollectionEntry,
} from 'astro:content';
import { authorsEnum } from '../blogAuthors';

export interface BlogCollection {
	title: string;
	description?: string;
	date: Date;
	updatedDate?: Date;
	image?: string;
	tags: string[];
	authors: string[];
}

export interface DocsCollection {
	title?: string;
}

export const TAGS = [
	'All',
	'Postgres',
	'Engineering',
	'Developers',
	'Data',
	'Extensions',
	'Stacks',
];

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		date: z.coerce.date().optional(),
		updatedDate: z.coerce.date().optional(),
		image: z.string().optional(),
		tags: z.array(z.string()),
		feedSummary: z.string().optional(),
		authors: authorsEnum,
	}),
});
export const ROOT_SIDEBAR_DOCS_ORDER = {
	development: 2,
	product: 1,
	'getting started': 0,
};

export const ROOT_SIDEBAR_DOCS_ICONS = {
	development: 'development.svg',
	product: 'product.svg',
	'getting started': '',
};

const docs = defineCollection({
	schema: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		tableOfContents: z.boolean().default(true),
		sideBarPosition: z.number().default(Infinity),
		sideBarTitle: z.string().optional(),
		uppercase: z.boolean().default(false),
		uppercaseParent: z.boolean().default(false),
	}),
});

export function sortPostDates(
	a: CollectionEntry<'blog'>,
	b: CollectionEntry<'blog'>,
) {
	const aDateString = a.id.substring(0, 10);
	const aParsedDate = a.data?.date || new Date(aDateString);
	const bDateString = b.id.substring(0, 10);
	const bParsedDate = b.data?.date || new Date(bDateString);

	return bParsedDate.valueOf() - aParsedDate.valueOf();
}

export async function getTags() {
	const posts = (await getCollection('blog')).sort(
		(a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
			sortPostDates(a, b),
	);
	const tags = posts.map((post) => post.data.tags).flat();
	return [
		...new Set(
			tags.map((tag) => ({
				params: { slug: tag.toLowerCase() },
				props: posts.filter(
					(post: CollectionEntry<'blog'>) =>
						post.data.tags.includes(tag.toLowerCase()) ||
						tag === 'All',
				),
			})),
		),
	];
}

export const collections = { blog, docs };
