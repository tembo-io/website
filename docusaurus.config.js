// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CoreDB',
  tagline: 'The developer platform for building any data service',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.coredb.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'CoreDB_io', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/CoreDB-io/docs/blob/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social-card.jpg',
      navbar: {
        title: 'CoreDB Docs',
        logo: {
          alt: 'CoreDB Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            href: 'https://github.com/CoreDB-io/coredb',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/CoreDB-io/coredb',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/KCmumjWE8H',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/coredb_io',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'CoreDB Cloud',
                to: 'https://cloud.coredb.io',
              },              
              {
                label: 'Website',
                to: 'https://www.coredb.io',
              },
              {
                label: 'Blog',
                to: 'https://www.coredb.io/blog',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CoreDB, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
