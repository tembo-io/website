import { Feed } from "feed";
import { getCollection } from 'astro:content';
import { AUTHORS } from '../content/config';

export async function GET() {
    const blog = await getCollection('blog');
    const postImportResult = import.meta.glob('../content/blog/**/*.md', {
		eager: true,
	});
	const posts = Object.values(postImportResult);
    const feed = new Feed({
        title: "Tembo's Blog",
        description: "Latest news and technical blog posts from membors of the Tembo team and community!",
        id: "https://tembo.io/blog",
        link: "http://example.com/",
        language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
        image: "https://tembo.io/og-image.png",
        favicon: "http://tembo.io/favicon.ico",
        copyright: "All rights reserved 2024, Tembo",
        generator: "https://github.com/jpmonette/feed",
        feedLinks: {
          atom: "https://tembo.io/atom.xml",
          rss: "https://tembo.io/feed.xml"
        },
    });

    blog.forEach((post, index) => {
        const dateString = post.id.substring(0, 10);
        const parsedDate = post.data?.date || new Date(dateString);
        const COULD_NOT_BE_RENDERED =
            'This post contained content that could not be rendered in the Atom feed. Please use the official post link on https://tembo.io.';
        const isMdx = post.id.includes('.mdx');
        const author = AUTHORS[post.data.authors[0]]
        feed.addItem({
            title: post.data.title,
            date: new Date(parsedDate),
            description: post.data.description,
            link: `https://tembo.io/blog/${post.slug}`,
            content: isMdx
                ? COULD_NOT_BE_RENDERED
                : posts[index]
                        ?.compiledContent()
                        .replaceAll('src="/', 'src="https://tembo.io/') ||
                    COULD_NOT_BE_RENDERED,
            author: [{
                name: author.name,
                email: author.email,
                link: author.url
            }],
        });
    });
	return new Response(feed.atom1());
}
