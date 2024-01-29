const plugin = require('tailwindcss/plugin')
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			typography: {
				DEFAULT: {
				  css: {
					maxWidth: '100ch', // add required value here
				  }
				}
			},
			fontFamily: {
				primary: ['Bai Jamjuree'],
				secondary: ['Inter']
			},
			maxWidth: {
				container: '88rem',
				stackSlider: '130rem'
			},
			colors: {
				neon: '#E9FC87',
				lightNeon: '#F3FFB6',
				lightBlue: '#45DEF2',
				blue: '#432F94',
				purple: '#DB39CB',
				lightPurple: '#CA6FE5',
				pink: '#FA467B',
				lightPink: '#FFC9EA',
				salmon: '#FF7D7F',
				mwasi: '#1C1C1C',
				customDarkGrey: '#414141',
				semiGrey: '#3E4243',
				semiGrey2: '#292929',
				grey: '#9EA2A6',
				lightGrey: '#BBBBBB',
				otherGrey: '#EAEAEA',
				offBlack: '#120F0E',
				offGrey: '#1A1E22',
			},
			backgroundImage: {
				'gradient-rainbow':
					'linear-gradient(89.98deg, #FFC6D9 1.27%, #7CCFE1 34.18%, #89CBA6 64.52%, #A5D571 100%)',
				'gradient-button': 'linear-gradient(68.42deg, #F77577 0%, #DB39CB 79.07%, #CA6FE5 170.36%)',
				'gradient-button-darker': 'linear-gradient(68.42deg, #F06B6D 0%, #C927A7 79.07%, #BA61D1 170.36%)'
			},
			animation: {
				'infinite-scroll': 'infinite-scroll 30s linear infinite',
				'infinite-scroll-fast': 'infinite-scroll 20s linear infinite'
			},
			keyframes: {
				'infinite-scroll': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-100%)' },
				}
			},
			screens: {
				customLg: '1440px',
				customMd: '1280px',
				customSm: '1024px',
				mobile: '900px',
				customXs: '680px',
				customXxs: '375px'
			}

		}
	},
	plugins: [
		require('@tailwindcss/typography'),
		plugin(function ({addVariant}) {
			addVariant(
			  'prose-inline-code',
			  '&.prose :where(:not(pre)>code):not(:where([class~="not-prose"] *))'
			);
		})
	]
};


