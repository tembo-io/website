/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				primary: ['Bai Jamjuree'],
				secondary: ['Inter']
			},
			maxWidth: {
				container: '100rem',
				stackSlider: '130rem'
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
				semiGrey: '#3E4243',
				grey: '#9EA2A6',
				lightGrey: '#BBBBBB',
				otherGrey: '#EAEAEA',
				offBlack: '#120F0E',
				offGrey: '#1A1E22'
			},
			backgroundImage: {
				'gradient-rainbow':
					'linear-gradient(89.98deg, #FFC6D9 1.27%, #7CCFE1 34.18%, #89CBA6 64.52%, #A5D571 100%)',
				'gradient-button': 'linear-gradient(68.42deg, #F77577 0%, #DB39CB 79.07%, #CA6FE5 170.36%)'
			},
			animation: {
				'infinite-scroll': 'infinite-scroll 25s linear infinite',
				'infinite-scroll-fast': 'infinite-scroll 15s linear infinite'
			},
			keyframes: {
				'infinite-scroll': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-100%)' },
				}
			}
		}
	},
	plugins: []
};


