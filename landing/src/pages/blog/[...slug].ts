import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';

const ALLOWED_EXTENSIONS = ['.pdf', '.json', '.csv', '.mp4', '.key'];

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  const blog = (await getCollection('blog'))
  const post = blog.find((post) => post.slug === slug?.split('/')[0]);
  const directoryPath = `./src/content/blog/${post?.id.replace('/index.mdx', '').replace('/index.md', '')}/${slug?.split('/')[1]}`;
  const ext = path.extname(directoryPath);
  const fileContents = fs.readFileSync(directoryPath);
  return new Response(fileContents, { headers: { 'Content-Type': `application/${ext.replace('.', '')}` } });
}

export async function getStaticPaths() {
  const blog = (await getCollection('blog'))
  const generatedSlugs = blog.flatMap((post) => {
    const slug = `${post.slug}`;
    const directoryPath = `./src/content/blog/${post.id.replace('/index.mdx', '').replace('/index.md', '')}`;

    let entries: { params: { slug: string } }[] = []

    const files = fs.readdirSync(directoryPath);
    entries = files.filter(file => ALLOWED_EXTENSIONS.some(ext => file.endsWith(ext))).map(file => {
      const fileSlug = `${slug}/${file}`;
      return { params: { slug: fileSlug } };
    });
    return entries
  })
  return generatedSlugs;
}
