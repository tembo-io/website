import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { AUTHORS } from '../content/config';

export const GET: APIRoute = async (context) => {
	const blog = await getCollection('blog');
	const postImportResult = import.meta.glob('../content/blog/**/*.{md,mdx}', {
		eager: true,
	});
	const posts: any[] = Object.values(postImportResult).reverse();
	return rss({
		title: 'Tembo’s Blog',
		description:
			'Latest news and technical blog posts from membors of the Tembo team and community!',
		site: context.site as string | URL,
		xmlns: {
			atom: 'http://www.w3.org/2005/Atom',
		},
		customData: `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />`,
		items: blog.map((post, index) => {
			const dateString = post.id.substring(0, 10);
			const parsedDate = post.data?.date || new Date(dateString);
			const COULD_NOT_BE_RENDERED = `This post contained content that could not be rendered in the Atom feed. Please use the official post link: https://tembo.io/blog/${post.slug}`;
			const isMdx = post.id.includes('.mdx');
			const contentPost = posts.find((p) =>
				p.frontmatter.slug.includes(post.slug),
			);
			return {
				title: post.data.title,
				pubDate: new Date(parsedDate).toISOString() as any,
				description: post.data.description,
				link: `/blog/${post.slug}`,
				content: isMdx
					? COULD_NOT_BE_RENDERED
					: contentPost
							?.compiledContent()
							.replaceAll('src="/', 'src="https://tembo.io/') ||
						COULD_NOT_BE_RENDERED,
				customData: `
                    <author>
                        <name>${AUTHORS[post.data.authors[0]].name}</name>
                        <email>noreply@tembo.io</email>
                        <uri>${AUTHORS[post.data.authors[0]].url}</uri>
                    </author>
                    ${post.data.tags
						.map(
							(tag) =>
								`<category label='${tag}' term='${tag}' />`,
						)
						.join(',')
						.replaceAll(',', '')}
                `,
			};
		}),
	});
};
