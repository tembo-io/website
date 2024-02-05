import React, { useRef, useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { useIntersection, useDelayUnmount } from '../util';
import FooterCrossingWalk from '../animations/CrossingWalk1.json';

interface Props {
	animation?: unknown;
	styles?: string;
	isFullWidth?: boolean;
	loop?: boolean;
	animateOnInView?: boolean;
	autoPlay?: boolean;
	isFooter?: boolean;
	position?: string;
}

const Animation: React.FC<Props> = ({
	animation,
	styles,
	isFullWidth = true,
	loop = true,
	animateOnInView = false,
	isFooter,
	position = 'absolute'
}) => {
	const triggerRef = useRef(null);
	const lottieRef = useRef(null);
	const [isMounted, setIsMounted] = useState(true);
	const isVisible = useIntersection(triggerRef, '700px');
	const shouldRenderChild = useDelayUnmount(isMounted, 1000);
	const mountedStyle = {
		opacity: 1,
		transition: 'opacity 1000ms ease-in-out',
	};
	const unmountedStyle = {
		opacity: 0,
		transition: 'opacity 1000ms ease-in-out',
	};
	useEffect(() => {
		if (isVisible && animateOnInView) {
			setTimeout(() => {
				setIsMounted(true);
			}, 1500);

			setTimeout(() => {
				setIsMounted(false);
			}, 3000);
		} else {
			setIsMounted(isVisible);
		}
	}, [isVisible]);
	return (
		<div
			ref={triggerRef}
			style={
				animateOnInView
					? isMounted
						? mountedStyle
						: unmountedStyle
					: undefined
			}
		>
			{!isMounted && animateOnInView && !shouldRenderChild ? (
				<></>
			) : (
				<Lottie
					lottieRef={lottieRef}
					animationData={isFooter ? FooterCrossingWalk : animation}
					loop={loop}
					autoPlay={false}
					className={styles}
					style={{
						position: position as any,
						width: isFullWidth ? '100%' : undefined,
						overflow: 'hidden',
						zIndex: 1,
						padding: 0,
						margin: 0,
					}}
				/>
			)}
		</div>
	);
};

export default Animation;
