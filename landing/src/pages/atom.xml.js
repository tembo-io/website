import { Feed } from "feed";

export async function GET(context) {
    const feed = new Feed({
        title: "Tembo's Blog",
        description: "Latest news and technical blog posts from membors of the Tembo team and community!",
        id: "https://tembo.io/blog",
        link: "http://example.com/",
        language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
        image: "https://tembo.io/og-image.png",
        favicon: "http://tembo.io/favicon.ico",
        copyright: "All rights reserved 2024, Tembo",
        generator: "https://github.com/jpmonette/feed"
        feedLinks: {
          atom: "https://tembo.io/atom.xml",
          rss: "https://tembo.io/feed.xml"
        },
    });
	return new Response(feed.atom1());
}
