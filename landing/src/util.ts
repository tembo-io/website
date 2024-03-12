import { useEffect, useState, useRef } from 'react';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';
import { getCollection } from 'astro:content';
import type { SideBarSection } from './types';
import { SIDEBAR_DOCS_ORDER } from './content/config';

export const useIntersection = (
	element: React.MutableRefObject<any>,
	rootMargin: string,
) => {
	const [isVisible, setState] = useState(false);

	useEffect(() => {
		const current = element?.current;
		const observer = new IntersectionObserver(
			([entry]) => {
				setState(entry.isIntersecting);
			},
			{ rootMargin },
		);
		current && observer?.observe(current);

		return () => current && observer.unobserve(current);
	}, []);

	return isVisible;
};

export const useDelayUnmount = (isMounted: boolean, delayTime: number) => {
	const [shouldRender, setShouldRender] = useState(false);

	useEffect(() => {
		let timeoutId: number;
		if (isMounted && !shouldRender) {
			setShouldRender(true);
		} else if (!isMounted && shouldRender) {
			timeoutId = setTimeout(
				() => setShouldRender(false),
				delayTime,
			) as any;
		}
		return () => clearTimeout(timeoutId);
	}, [isMounted, delayTime, shouldRender]);
	return shouldRender;
};

export const styles = (...classNames: any[]) => {
	return cx(twMerge(...classNames));
};

export const useActiveAnchors = (
	firstHeadingSlug: string,
	isDocs: boolean = false,
	offset: number = 120,
	anchorsQuerySelector: string = 'h2, h3, h4, h5, h6',
	tocQuerySelector: string = '.prose-toc',
) => {
	const anchors = useRef<NodeListOf<HTMLHeadingElement> | null>(null);
	const toc = useRef<NodeListOf<HTMLHeadingElement> | null>(null);

	const handleScroll = () => {
		const firstHeading = document.getElementById(firstHeadingSlug);
		const pageYOffset = isDocs
			? (document.getElementById('docs-content') as HTMLElement)
					?.scrollTop
			: window.scrollY;
		let newActiveAnchor: string = '';
		if (pageYOffset < 1) {
			return;
		}

		anchors.current?.forEach((anchor) => {
			if (pageYOffset >= anchor.offsetTop - offset) {
				if (!!anchor.id) {
					newActiveAnchor = anchor.id;
				}
			}
		});
		if (!newActiveAnchor) {
			firstHeading?.classList.remove('border-transparent');
			firstHeading?.classList.remove('text-grey');
			firstHeading?.classList.add('border-neon');
			firstHeading?.classList.add('text-white');
			return;
		}

		toc.current?.forEach((link) => {
			link.classList.remove('border-neon');
			link.classList.remove('text-white');
			link.classList.add('border-transparent');
			link.classList.add('text-grey');
			const sanitizedHref = (link.getAttribute('href') ?? '').replace(
				'#',
				'',
			);

			const isMatch = sanitizedHref === newActiveAnchor;

			if (isMatch) {
				link.classList.remove('border-transparent');
				link.classList.remove('text-grey');
				link.classList.add('text-white');
				link.classList.add('border-neon');
			}
		});
	};

	useEffect(() => {
		anchors.current = document.querySelectorAll(anchorsQuerySelector);
		toc.current = document.querySelectorAll(tocQuerySelector);
		const scrollListenerContainer = isDocs
			? (document.getElementById('docs-content') as HTMLElement)
			: window;

		scrollListenerContainer?.addEventListener('scroll', handleScroll);
		return () => {
			scrollListenerContainer?.removeEventListener(
				'scroll',
				handleScroll,
			);
		};
	}, []);

	return null;
};

export const uppercaseFirstLetter = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const sortSideBarLinks = (sideBarLinks: SideBarSection[]) =>
	sideBarLinks.sort((a, b) => {
		const labelA = a.label.toLowerCase();
		const labelB = b.label.toLowerCase();
		const aOrder = SIDEBAR_DOCS_ORDER.hasOwnProperty(labelA)
			? SIDEBAR_DOCS_ORDER[labelA as keyof typeof SIDEBAR_DOCS_ORDER]
			: Infinity;
		const bOrder = SIDEBAR_DOCS_ORDER.hasOwnProperty(labelB)
			? SIDEBAR_DOCS_ORDER[labelB as keyof typeof SIDEBAR_DOCS_ORDER]
			: Infinity;

		if (aOrder < bOrder) {
			return -1;
		}
		if (aOrder > bOrder) {
			return 1;
		}
		return 0;
	});

export async function getSideBarLinks() {
	const docs = await getCollection('docs');
	const sideBarLinks: SideBarSection[] = [];
	const sideBarRoots = new Set();
	docs.forEach((doc) => {
		const sectionTitle = uppercaseFirstLetter(doc.id.split('/')[0]);
		sideBarRoots.add(sectionTitle);
	});

	Array.from(sideBarRoots).forEach(async (root: any) => {
		const rootDocs = docs.filter((doc) =>
			doc.id.startsWith(root.toLowerCase()),
		);
		const getItems = () => {
			const items = rootDocs
				.sort((docA, docB) => {
					const aOrder = docA.data?.sideBarPosition ?? Infinity;
					const bOrder = docB.data?.sideBarPosition ?? Infinity;
					if (aOrder < bOrder) {
						return -1;
					}
					if (aOrder > bOrder) {
						return 1;
					}
					return 0;
				})
				.map((doc) => {
					const split = doc.id.split('/');
					const title = uppercaseFirstLetter(
						split[split.length - 1]
							.replaceAll('-', ' ')
							.replaceAll('_', ' ')
							.replace(/\.mdx?/g, '')
							.toLowerCase(),
					);
					return {
						title: title,
						slug: `/docs/${doc.slug}`,
					};
				});
			return items;
		};

		sideBarLinks.push({
			label: root.toUpperCase().replaceAll('-', ' ').replaceAll('_', ' '),
			items: getItems(),
		});
	});
	return sortSideBarLinks(sideBarLinks);
}
