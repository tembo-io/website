import React, { useRef, useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { useIntersection, useDelayUnmount } from '../util';

interface Props {
	animation: unknown;
	styles?: string;
	isFullWidth?: boolean;
	loop?: boolean;
	animateOnInView?: boolean;
	autoPlay?: boolean;
}

const Animation: React.FC<Props> = ({ animation, styles, isFullWidth = true, loop = true, animateOnInView = false }) => {
	const triggerRef = useRef(null);
    const lottieRef = useRef(null)
	const [isMounted, setIsMounted] = useState(true);
    const isVisible = useIntersection(triggerRef, "700px");
	const shouldRenderChild = useDelayUnmount(isMounted, 1000);
	const mountedStyle = {opacity: 1, transition: "opacity 1000ms ease-in-out"};
    const unmountedStyle = {opacity: 0, transition: "opacity 1000ms ease-in-out"};
	useEffect(() => {
		setIsMounted(isVisible)
		if (isVisible && animateOnInView) {
			setTimeout(() => {
				setIsMounted(false)
			}, 2200)
		}
	}, [isVisible])
	return (
		<div ref={triggerRef} style={animateOnInView ? isMounted ? mountedStyle : unmountedStyle : undefined}>
			{!isVisible && animateOnInView || !isMounted && animateOnInView && !shouldRenderChild ? <></> : <Lottie
				lottieRef={lottieRef}
				animationData={animation}
				loop={loop}
				autoPlay={false}
				className={styles}
				style={{
					position: 'absolute',
					width: isFullWidth ? '100%' : undefined,
					overflow: 'hidden',
					zIndex: 1,
					padding: 0,
					margin: 0,
				}}
			/>}
		</div>
	)
}

export default Animation;
