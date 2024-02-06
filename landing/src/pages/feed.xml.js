import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { AUTHORS } from '../content/config';
const parser = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
});

export async function GET(context) {
    const blog = await getCollection('blog');

    // const postImportResult = import.meta.glob('../content/blog/**/*.md', { eager: true });
    // const posts = Object.values(postImportResult);
    return rss({
        title: 'Tembo’s Blog',
        description: 'Latest news and technical blog posts from membors of the Tembo team and community!',
        site: context.site,
        items: blog.map((post) => {
            const dateString = post.id.substring(0, 10);
            const parsedDate = post.data?.date || new Date(dateString);
            return {
                title: post.data.title,
                pubDate: new Date(parsedDate).toISOString(),
                description: post.data.description,
                link: `/blog/${post.slug}/`,
                content: parser.render(post.body).replace('src="./', `src="${context.site}./`),
                customData: `
                    <author>
                        <name>${AUTHORS[post.data.authors[0]].name}</name>
                        <email>noreply@tembo.io</email>
                        <uri>${AUTHORS[post.data.authors[0]].url}</uri>
                    </author>
                    ${post.data.tags.map(tag => `<category label='${tag}' term='${tag}' />`).join(',').replaceAll(',', '')}
                `
            };
        }),
    });
}
