import React, { useState, useEffect } from 'react';
import { styles } from '../util';

interface Props {
	title: string;
	classNames?: string;
}
// const splitPath = currentPath.split('/').filter((path) => path !== '/');
// console.log(splitPath[splitPath.length - 1].replace('/', ''));

const Tag: React.FC<Props> = ({ title, classNames }) => {
	const [splitPath, setSplitPath] = useState<string[]>([]);
	const [currentPath, setCurrentPath] = useState<string>('');

	useEffect(() => {
		setSplitPath(
			window.location.pathname.split('/').filter((path) => path !== '/'),
		);
		setCurrentPath(window.location.pathname);
	}, []);
	return (
		<a
			href={
				title === 'All' ? '/blog' : `/blog/tags/${title.toLowerCase()}`
			}
			className={styles(
				'flex items-center justify-center border border-otherGrey rounded-full px-4 py-3 h-[40px] text-otherGrey',
				classNames,
				splitPath[splitPath.length - 1] === title.toLowerCase() ||
					(title === 'All' &&
						(currentPath === '/blog' || currentPath === '/blog/'))
					? 'border-salmon text-lightSalmon font-semibold bg-salmon bg-opacity-10'
					: '',
			)}
		>
			<span>{title}</span>
		</a>
	);
};

export default Tag;
