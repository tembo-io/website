import { Feed } from 'feed';
import { getCollection } from 'astro:content';
import { AUTHORS } from '../../blogAuthors';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();
export async function GET() {
	const blog = await getCollection('blog');
	const postImportResult = import.meta.glob(
		'../../content/blog/**/*.{md,mdx}',
		{
			eager: true,
		},
	);
	const posts: any[] = Object.values(postImportResult).reverse();
	const feed = new Feed({
		title: "Tembo's Blog",
		description:
			'Latest news and technical blog posts from membors of the Tembo team and community!',
		id: 'https://tembo.io/blog',
		link: 'https://tembo.io/blog',
		language: 'en',
		image: 'https://tembo.io/og-image.png',
		favicon: 'http://tembo.io/favicon.ico',
		copyright: 'All rights reserved 2024, Tembo',
		generator: 'https://github.com/jpmonette/feed',
		feedLinks: {
			atom: 'https://tembo.io/atom.xml',
			rss: 'https://tembo.io/feed.xml',
		},
	});
	blog.forEach((post) => {
		const dateString = post.id.substring(0, 10);
		const parsedDate = post.data?.date || new Date(dateString);
		const author = AUTHORS[post.data.authors[0]];
		feed.addItem({
			title: post.data.title,
			date: new Date(parsedDate),
			description: post.data.description,
			link: `https://tembo.io/blog/${post.slug}`,
			content: sanitizeHtml(parser.render(post.body), {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
			  }).replaceAll('src="/', 'src="https://tembo.io/'),
			author: [
				{
					name: author.name,
					email: author.email,
					link: author.url,
				},
			],
		});
	});
	return new Response(feed.atom1());
}
