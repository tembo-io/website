import type { AstroIntegration, AstroIntegrationLogger } from 'astro';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import remarkStringify from 'remark-stringify';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const INTEGRATION_NAME = 'astro-plugin-validate-links';

async function validateLinks(
	links: string[],
	type: 'absolute' | 'relative',
	collectionPages: string[],
	logger: AstroIntegrationLogger,
) {
	if (type === 'relative') {
		let notFoundLinks = [];
		links.forEach(async (link) => {
			const cleanedPathName = link.split('/');
			if (cleanedPathName.at(-1) === '') {
				cleanedPathName.pop();
			}

			const isLink404 = !collectionPages.includes(
				cleanedPathName.join('/'),
			);

			if (isLink404) {
				logger.error(`404 Not Found: ${cleanedPathName.join('/')}`);
				notFoundLinks.push(cleanedPathName.join('/'));
			}
		});

		if (notFoundLinks.length > 0) {
			throw new Error('Error: 404 links found! Fix the above errors! ^');
		}
	}

	for (const link of links) {
		try {
			await axios.head(link, {
				timeout: 2000,
				maxRedirects: 10,
			});
		} catch (error: any) {
			if (error?.response && error?.response?.status === 404) {
				logger.error(`404 Not Found: ${link}`);
			}
		}
	}
}

interface PluginOptions {
	validateAbsoluteLinks?: boolean;
}

const createPlugin = (options: PluginOptions): AstroIntegration => {
	return {
		name: INTEGRATION_NAME,

		hooks: {
			'astro:build:done': async ({ dir, routes, pages, logger }) => {
				logger.info('Validating links...');
				const collectionPages = pages
					.filter(
						(page) =>
							page.pathname.startsWith('docs') ||
							page.pathname.startsWith('blog'),
					)
					.map(({ pathname }) => {
						const cleanedPathname = `/${pathname}`.split('/');
						cleanedPathname.pop();
						return cleanedPathname.join('/');
					});

				const contentDir = './src/content';

				function readFile(filePath: string) {
					return fs.readFileSync(filePath, 'utf-8');
				}

				function getFilePaths(dir: string) {
					const filePaths: string[] = [];

					function traverseDirectory(currentDir: string) {
						const files = fs.readdirSync(currentDir);

						for (const file of files) {
							const filePath = path.join(currentDir, file);
							const stats = fs.statSync(filePath);

							if (stats.isDirectory()) {
								traverseDirectory(filePath);
							} else if (
								path.extname(filePath) === '.md' ||
								path.extname(filePath) === '.mdx'
							) {
								filePaths.push(filePath);
							}
						}
					}

					traverseDirectory(dir);
					return filePaths;
				}

				// Extract links from Markdown files
				async function extractLinks(filePaths: string[]) {
					const absoluteLinks = new Set<string>();
					const relativeLinks = new Set<string>();
					for (const filePath of filePaths) {
						const content = readFile(filePath);
						await unified()
							.use(remarkParse)
							.use(() => {
								return function transform(tree) {
									visit(tree, 'link', (linkNode) => {
										const url: string = (linkNode as any)
											?.url;
										if (!url.includes('./')) {
											if (url.startsWith('/')) {
												relativeLinks.add(url);
											} else if (url.includes('http')) {
												absoluteLinks.add(
													(linkNode as any)?.url,
												);
											}
										}
									});
								};
							})
							.use(remarkStringify)
							.process(content);
					}
					return {
						absoluteLinks,
						relativeLinks,
					};
				}

				const filePaths = getFilePaths(contentDir);
				const links = await extractLinks(filePaths);

				await validateLinks(
					Array.from(links.relativeLinks),
					'relative',
					collectionPages,
					logger,
				);

				if (options?.validateAbsoluteLinks) {
					await validateLinks(
						Array.from(links.absoluteLinks),
						'absolute',
						collectionPages,
						logger,
					);
				}
			},
		},
	};
};

export default createPlugin;
