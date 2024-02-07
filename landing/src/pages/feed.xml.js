import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getImage } from "astro:assets";
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { AUTHORS } from '../content/config';
const parser = new MarkdownIt({
    html: true,
    breaks: false,
    linkify: true,
    typographer: true
});

// iterate over pages/slugs and get their markdown then inject in here

export async function GET(context) {
    const blog = await getCollection('blog');
    const postImportResult = import.meta.glob('../content/blog/**/*.md', { eager: true });
    const posts = Object.values(postImportResult);
    return rss({
        title: 'Tembo’s Blog',
        description: 'Latest news and technical blog posts from membors of the Tembo team and community!',
        site: context.site,
        xmlns: {
            atom: "http://www.w3.org/2005/Atom",
        },
        customData: `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />`,
        items: blog.map((post, index) => {
            const dateString = post.id.substring(0, 10);
            const parsedDate = post.data?.date || new Date(dateString);
            const renderedMarkdown = parser.render(post.body);
            const isMdx = post.id.includes('.mdx');
            return {
                title: post.data.title,
                pubDate: new Date(parsedDate).toISOString(),
                description: post.data.description,
                link: `/blog/${post.slug}`,
                content: isMdx ? 'Could not be rendered!' : posts[index]?.compiledContent().replaceAll() || 'Could not be rendered!',
                customData: `
                    <author>
                        <name>${AUTHORS[post.data.authors[0]].name}</name>
                        <email>noreply@tembo.io</email>
                        <uri>${AUTHORS[post.data.authors[0]].url}</uri>
                    </author>
                    ${post.data.tags.map(tag => `<category label='${tag}' term='${tag}' />`).join(',').replace('src="./', `src="${context.site}./`)}
                `
            };
        }),
    });
}
