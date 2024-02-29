import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { remarkReadingTime } from './remark-reading-time.mjs';
import starlight from '@astrojs/starlight';
const options = {
	contentPath: 'src/content/blog',
};

// https://astro.build/config
export default defineConfig({
	integrations: [
		react(),
		tailwind(),
		starlight({
			title: 'Tembo Docs',
			disable404Route: true,
			expressiveCode: {
				frames: {
					showCopyToClipboardButton: false,
				},
				defaultProps: {
					wrap: true,
					frame: false,
					preserveIndent: false,
				},
			},
		}),
	],
	site: 'https://tembo.io',
	redirects: {
		'/blog/introducing-coredb': '/blog/introducing-tembo',
		'/blog/manifesto': '/blog/tembo-manifesto',
		'/waitlist': '/',
	},
	markdown: {
		remarkPlugins: [remarkReadingTime],
		shikiConfig: {
			wrap: true,
		},
	},
	vite: {
		ssr: {
			noExternal: ['react-tweet'],
		},
	},
});
