import {
	defineCollection,
	z,
	getCollection,
	type CollectionEntry,
} from 'astro:content';

export interface BlogCollection {
	title?: string;
	description?: string;
	date: Date;
	updatedDate?: Date;
	image?: string;
	tags: string[];
	authors: string[];
}

export interface DocsCollection {}

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
		authors: z.array(
			z
				.enum([
					'ryw',
					'samay',
					'adam',
					'rjzv',
					'steven',
					'jay',
					'adarsh',
					'eric',
					'ian',
					'darren',
					'abby',
					'evan',
					'theory',
				])
				.default('ryw'),
		),
	}),
});
const docs = defineCollection({
	schema: z.object({
		title: z.string(),
		description: z.string(),
		tableOfContents: z.boolean().default(true),
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
