import React, { useEffect, useState } from 'react';
import cx from 'classnames';

interface Props {
	scrollContainerId: string;
	parentContainerId: string;
	isScrollingWindow?: boolean;
}

const ProgressBar: React.FC<Props> = ({
	scrollContainerId,
	parentContainerId,
	isScrollingWindow = false,
}) => {
	const [scrollY, setScrollY] = useState(0);
	const [progressWidth, setProgressWidth] = useState(101);
	useEffect(() => {
		const container = document.getElementById(scrollContainerId);
		const handleScroll = () => {
			const { top, height } = (
				document.getElementById(parentContainerId) as any
			)?.getBoundingClientRect();
			let scrollDistance = -top;
			let progressPercentage =
				(scrollDistance /
					(height - document.documentElement.clientHeight)) *
				100;

			setProgressWidth(progressPercentage);

			if (isScrollingWindow) setScrollY(window.scrollY);
			else setScrollY(container?.scrollTop || window.scrollY);
		};

		handleScroll();

		window.addEventListener('scroll', handleScroll);
		container?.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			container?.removeEventListener('scroll', handleScroll);
		};
	}, []);
	let isActive = progressWidth <= 100;

	return (
		<>
			{scrollY > 0 && (
				<div
					className={cx(
						'w-full flex justify-start relative z-10',
						scrollY > 0 && 'h-[1.5px]',
					)}
				>
					<div
						className='h-full top-0 bottom-0 right-0 absolute w-full bg-salmon will-change-transform transition-opacity duration-[40] ease-linear'
						style={{
							transform: `translate3d(${isActive ? progressWidth - 100 + '%' : '0'},0,0)`,
							opacity: isActive ? 1 : 0,
						}}
					></div>
				</div>
			)}
		</>
	);
};

export default ProgressBar;
