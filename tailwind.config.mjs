const plugin = require('tailwindcss/plugin');
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			customComponents: {},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '80ch',
					},
				},

				quoteless: {
					css: {
						'blockquote p:first-of-type::before': {
							content: 'none',
						},
						'blockquote p:first-of-type::after': {
							content: 'none',
						},
					},
				},
			},
			fontFamily: {
				primary: ['Bai Jamjuree'],
				secondary: ['Inter'],
			},
			maxWidth: {
				container: '88rem',
				stackSlider: '130rem',
			},
			colors: {
				neon: '#E9FC87',
				lightNeon: '#F3FFB6',
				lightBlue: '#45DEF2',
				blue: '#432F94',
				sqlBlue: '#7B7DFF',
				purple: '#DB39CB',
				lightPurple: '#CA6FE5',
				pink: '#FA467B',
				danger: '#FA4666',
				lightDanger: '#FF7089',
				warning: '#F39405',
				lightWarning: '#fcc065',
				good: '#84EABD',
				lightGood: '#B0E4CE',
				lightPink: '#FFC9EA',
				sqlPink: '#FF99E4',
				salmon: '#FF7D7F',
				lightSalmon: '#FF999A',
				mwasi: '#1C1C1C',
				lightMwasi: '#161616',
				customDarkGrey: '#414141',
				customDarkerGrey: '#2D2D2D',
				semiGrey: '#3E4243',
				semiGrey2: '#292929',
				grey: '#9EA2A6',
				lightGrey: '#BBBBBB',
				lighterGrey: '#d9d9d9',
				lighterGrey2: '#BCBCBC',
				otherGrey: '#EAEAEA',
				otherGrey2: '#EBEAE726',
				offBlack: '#120F0E',
				offGrey: '#1A1E22',
				pricingGreen: '#84EA9A',
				pricingLightBlue: '#CFF4FF',
				white: '#FFFFFF',
				whiteGrey: '#FFFFFF1A',
				ghostWhite: '#FFFFFF99',
				offWhite: '#F2F2F2',
				grayScaleMwasi: '#ffffff0d',
			},
			backgroundImage: {
				'gradient-rainbow':
					'linear-gradient(89.98deg, #FFC6D9 1.27%, #7CCFE1 34.18%, #89CBA6 64.52%, #A5D571 100%)',
				'gradient-button':
					'linear-gradient(68.42deg, #F77577 0%, #DB39CB 79.07%, #CA6FE5 170.36%)',
				'gradient-button-darker':
					'linear-gradient(68.42deg, #F06B6D 0%, #C927A7 79.07%, #BA61D1 170.36%)',
			},
			animation: {
				'infinite-scroll': 'infinite-scroll 50s linear infinite',
				'infinite-scroll-fast': 'infinite-scroll 35s linear infinite',
			},
			keyframes: {
				'infinite-scroll': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-100%)' },
				},
			},
			screens: {
				customLg: '1440px',
				customMd: '1280px',
				customSm: '1024px',
				mid: '1100px',
				mobile: '900px',
				docsSearch: '705px',
				customXs: '680px',
				customXxs: '375px',
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		plugin(function ({ addVariant }) {
			addVariant(
				'prose-inline-code',
				'&.prose :where(:not(pre)>code):not(:where([class~="not-prose"] *))',
			);
		}),
	],
};
