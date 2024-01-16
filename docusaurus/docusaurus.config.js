// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Tembo',
	tagline: 'The developer platform for building any data service',
	favicon: 'favicon.ico',
	// Set the production url of your site here
	url: 'https://tembo.io',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/',
	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'tembo-io', // Usually your GitHub org/user name.
	projectName: 'website', // Usually your repo name.

	onBrokenLinks: 'ignore',
	onBrokenMarkdownLinks: 'ignore',

	// Even if you don't use internalization, you can use this field to set useful
	// metadata like html lang. For example, if your site is Chinese, you may want
	// to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},

	plugins: [
		'@stackql/docusaurus-plugin-hubspot',
		'docusaurus-plugin-segment',
		[
			'docusaurus-plugin-plausible',
			{
				domain: 'tembo.io',
			},
		],
		async function myPlugin(context, options) {
			return {
				name: 'docusaurus-tailwindcss',
				configurePostCss(postcssOptions) {
					// Appends TailwindCSS and AutoPrefixer.
					postcssOptions.plugins.push(require('tailwindcss'));
					postcssOptions.plugins.push(require('autoprefixer'));
					return postcssOptions;
				},
			};
		},

		() => ({
			name: 'inject-tag',
			injectHtmlTags() {
				return {
					headTags: [
						{
							tagName: 'script',
							innerHTML:
								'prefinery=window.prefinery||function(){(window.prefinery.q=window.prefinery.q||[]).push(arguments)};',
						},
						{
							tagName: 'script',
							attributes: {
								src: 'https://widget.prefinery.com/widget/v2/yisnnyak.js',
								defer: true,
							},
						},
					],
				};
			},
		}),
	],
	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					routeBasePath: '/docs',
					sidebarPath: require.resolve('./sidebars.js'),
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl:
						'https://github.com/tembo-io/website/blob/main/docusaurus',
				},
				blog: {
					showReadingTime: true,
					blogSidebarTitle: 'All posts',
					blogSidebarCount: 'ALL',
					routeBasePath: '/blog',
					readingTime: ({
						content,
						frontMatter,
						defaultReadingTime,
					}) =>
						frontMatter.hide_reading_time
							? undefined
							: defaultReadingTime({ content }),
					editUrl:
						'https://github.com/tembo-io/website/blob/main/docusaurus',
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			}),
		],
		[
			'redocusaurus',
			{
				// Plugin Options for loading OpenAPI files
				specs: [
					{
						spec: 'https://api.tembo.io/api-docs/openapi.json',
						route: '/docs/tembo-cloud/openapi',
					},
				],
				// Theme Options for modifying how redoc renders them
				theme: {
					// Change with your site colors
					primaryColor: '#1890ff',
				},
			},
		],
	],

	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			image: 'img/social-card.png',

			navbar: {
				logo: {
					alt: 'Tembo Logo',
					src: 'img/title-logo.svg',
					href: '/',
					target: '_parent',
				},
				items: [
					{
						href: '/docs',
						label: 'Docs',
						target: '_blank',
						position: 'right',
					},
					{
						href: '/blog',
						label: 'Blog',
						target: '_blank',
						position: 'right',
					},
					{
						href: 'https://cloud.tembo.io',
						label: 'Tembo Cloud',
						position: 'right',
					},
					{
						href: 'https://github.com/tembo-io',
						label: 'GitHub',
						target: '_blank',
						position: 'right',
						className: 'header-github-link',
					},
				],
			},
			footer: {
				style: 'dark',
				links: [
					{
						label: 'Careers',
						href: 'https://tembo.breezy.hr/',
					},
					{
						label: 'Trunk',
						href: 'https://pgt.dev/',
					},
					{
						label: 'Docs',
						href: '/docs',
					},
					{
						label: 'Twitter',
						href: 'https://twitter.com/tembo_io',
					},
					{
						label: 'LinkedIn',
						href: 'https://www.linkedin.com/company/tembo-inc/',
					},
				],
				copyright: `Copyright © ${new Date().getFullYear()} Tembo. All Rights Reserved`,
			},
			colorMode: {
				disableSwitch: true,
			},
			prism: {
				theme: lightCodeTheme,
				darkTheme: darkCodeTheme,
			},
			hubspot: {
				accountId: 23590420,
			},
			segment: {
				apiKey: 'YT4AfD2TuYaN7DiGR20tAnstYP1ujjyE',
			},
		}),

	customFields: {
		homeFooter: [
			{
				label: 'Careers',
				href: 'https://tembo.breezy.hr/',
			},
			{
				label: 'Trunk',
				href: 'https://pgt.dev/',
			},
			{
				label: 'Docs',
				href: '/docs',
			},
			{
				label: 'Twitter',
				href: 'https://twitter.com/tembo_io',
			},
			{
				label: 'LinkedIn',
				href: 'https://www.linkedin.com/company/tembo-inc/',
			},
		],
	},
};

module.exports = config;
