import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'fs';


export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const blog = (await getCollection('blog'))
  const post = blog.find((post) => post.slug === slug?.split('/')[0]);
  const directoryPath = `./src/content/blog/${post?.id.replace('/index.mdx', '').replace('/index.md', '')}/${slug?.split('/')[1]}`;
  const fileContents = fs.readFileSync(directoryPath, 'binary');
  return new Response(fileContents, { headers: { 'Content-Type': 'application/pdf' } });
}

export async function getStaticPaths() {
  const blog = (await getCollection('blog'))
  const generatedSlugs = blog.flatMap((post) => {
    const slug = `${post.slug}`;
    const directoryPath = `./src/content/blog/${post.id.replace('/index.mdx', '').replace('/index.md', '')}`;

    let entries: { params: { slug: string } }[] = []

    const files = fs.readdirSync(directoryPath);
    entries = files.filter(file => file.endsWith('.pdf') || file.endsWith('.json')).map(file => {
      const fileSlug = `${slug}/${file}`;
      return { params: { slug: fileSlug } };
    });
    return entries
  })
  return generatedSlugs;
}
