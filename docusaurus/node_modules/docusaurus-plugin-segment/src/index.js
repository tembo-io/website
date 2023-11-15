const path = require('path');
const snippet = require('@segment/snippet');

module.exports = function (context, fromOptions) {
  const {siteConfig} = context;
  const {themeConfig} = siteConfig;
  const {segment: fromThemeConfig} = themeConfig || {};

  const segment = {
    ...fromThemeConfig,
    ...fromOptions
  };

  const {apiKey} = segment;

  if (!apiKey) {
    throw new Error('Unable to find a Segment `apiKey` in `plugin` options or `themeConfig`.');
  }

  const isProd = process.env.NODE_ENV === 'production';

  const contents = snippet.min(segment);

  const cdnHost = segment.useHostForBundles === true && segment.host ? segment.host : "cdn.segment.io";

  return {
    name: 'docusaurus-plugin-segment',

    getClientModules() {
      return isProd ? [path.resolve(__dirname, './segment')] : [];
    },

    injectHtmlTags() {
      if (!isProd) {
        return {};
      }
      return {
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: `https://${cdnHost}`,
            },
          },
          {
            tagName: 'script',
            innerHTML: contents + '\n',
          },
        ],
      };
    },
  };
};
