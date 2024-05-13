import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { remarkReadingTime } from './remark-reading-time.mjs';
import astroPluginValidateLinks from './validate-links-integration';
import clerk from 'astro-clerk-auth';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
	integrations: [
		react(),
		tailwind(),
		mdx(),
		astroPluginValidateLinks({ validateAbsoluteLinks: true }),
	],
	site: 'https://tembo.io',
	redirects: {
		'/product': '/',
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
