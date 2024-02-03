import rss from '@astrojs/rss';

export function GET(context) {
  return rss({
    title: 'Tembo’s Blog',
    description: 'Latest news and technical blog posts from the Tembo team!',
    site: context.site,
    items: [],
  });
}
