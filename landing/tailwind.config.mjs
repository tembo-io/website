import {
	rapidStylesPath,
	rapidTailwindTheme,
	rapidPlugin,
} from '@rapid-web/ui';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: rapidTailwindTheme({
			fontFamily: {
				primary: ['Bai Jamjuree'],
				secondary: ['Inter']
			},
			colors: {
				neon: '#E9FC87',
				lightBlue: '#45DEF2',
				blue: '#432F94',
				purple: '#DB39CB',
				pink: '#FA467B',
				salmon: '#FF7D7F',
				mwasi: '#1C1C1C',
				darkGrey: '#414141',
				grey: '#9EA2A6',
				lightGrey: '#BBBBBB',
				offBlack: '#120F0E'
			},
			backgroundImage: {
				'gradient-small': "url('/assets/gradientSmall.svg')",
				'gradient-rainbow':
					'linear-gradient(89.98deg, #FFC6D9 1.27%, #7CCFE1 34.18%, #89CBA6 64.52%, #A5D571 100%)',
			},
		}),
	},
	plugins: []
};


