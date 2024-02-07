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
    console.log(sanitizeHtml(posts[5].compiledContent()))

    return rss({
        title: 'Tembo’s Blog',
        description: 'Latest news and technical blog posts from membors of the Tembo team and community!',
        site: context.site,
        xmlns: {
            atom: "http://www.w3.org/2005/Atom",
        },
        customData: `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />`,
        items: blog.map((post) => {
            const dateString = post.id.substring(0, 10);
            const parsedDate = post.data?.date || new Date(dateString);
            const renderedMarkdown = parser.render(post.body);
            const imgRegex = /<img.*?src=["'](.*?)["'].*?>/g;
            const isMdx = post.id.includes('.mdx');
            const postImageTags = [];
            var match;
            while ((match = imgRegex.exec(renderedMarkdown)) !== null) {
                postImageTags.push(match[0]); // Push the whole matched tag
            }

            postImageTags.forEach(async (img) => {
                const currentSrcValues = img.match(imgRegex).map(function(tag) {
                    return tag.match(/src=["'](.*?)["']/)[1];
                });
                const imagePath = `../content/blog/${post.id.replace(isMdx ? '/index.mdx' : '/index.md', '')}${currentSrcValues[0].replace('.', '')}`
                //const newImage = await getImage({src: import.meta.glob(imagePath)})
                const cleanedImageTag = img.replace(imgRegex, function(match, captureGroup) {
                    return match.replace(captureGroup, 'hello-world');
                });
            })
            return {
                title: post.data.title,
                pubDate: new Date(parsedDate).toISOString(),
                description: post.data.description,
                link: `/blog/${post.slug}`,
                content: renderedMarkdown.replace('src="./', `src="${context.site}./`),
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
