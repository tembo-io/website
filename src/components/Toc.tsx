import React, { useEffect, useState } from 'react';
import { useActiveAnchors, styles } from '../util';

interface Props {
	headings: {
		text: string;
		slug: string;
		depth: number;
	}[];
	isDocs?: boolean;
	titleStyles?: string;
	title?: string;
	offset?: number;
}

const Toc: React.FC<Props> = ({
	headings,
	isDocs = false,
	titleStyles,
	title = 'On this page',
	offset = 120,
}) => {
	const [link, setLink] = useState('');
	const firstHeadingSlug = headings[0]?.slug || '';
	useEffect(() => {
		setLink(window.location.hash.substring(1));
	}, []);

	const handleLinkClick = (section: string) => {
		scrollToSection(section);
	};

	const scrollToSection = (section: string) => {
		const element = document.getElementById(section);
		element?.scrollIntoView();
	};

	const _ = useActiveAnchors(firstHeadingSlug, isDocs, offset);

	return (
		<div className='flex flex-col gap-6 max-w-[250px]'>
			<h2 className={styles('text-lightGrey font-bold', titleStyles)}>
				{title}
			</h2>
			<div className='flex flex-col border-l-2 border-[#9EA2A633] gap-4'>
				{headings.map(({ text, slug, depth }, index) => (
					<a
						href={`#${slug}`}
						key={slug}
						onClick={() => handleLinkClick(slug)}
						className={styles(
							'font-secondary text-xs border-l-2 py-1 prose-toc transition-all duration-75 ease-in-out hover:text-white',
							`pl-${depth * 2}`,
							link === slug || (link === '' && index === 0)
								? 'border-neon text-white'
								: 'border-transparent text-grey',
						)}
					>
						{text}
					</a>
				))}
			</div>
		</div>
	);
};

export default Toc;
