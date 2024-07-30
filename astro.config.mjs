import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { remarkReadingTime } from './remark-reading-time.mjs';
import { mermaid } from './remark-mermaid';
import astroPluginValidateLinks from './validate-links-integration';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	integrations: [
		react(),
		mdx(),
		tailwind(),
		astroPluginValidateLinks({ validateAbsoluteLinks: true }),
		sitemap(),
	],
	site: 'https://tembo.io',
	redirects: {
		'/product': '/',
		'/blog/introducing-coredb': '/blog/introducing-tembo',
		'/blog/manifesto': '/blog/tembo-manifesto',
		'/waitlist': '/',
	},
	markdown: {
		remarkPlugins: [remarkReadingTime, mermaid],
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
