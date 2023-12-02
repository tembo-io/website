import React, { useRef, useEffect, useState } from 'react';
import Lottie, { useLottie, type LottieRefCurrentProps } from 'lottie-react';
import { useIntersection } from '../util';

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
    const isVisible = useIntersection(triggerRef, "700px");
	return (
		<div ref={triggerRef}>
			{!isVisible && animateOnInView? <></> : <Lottie
				lottieRef={lottieRef}
				animationData={animation}
				loop={loop}
				autoPlay={false}
				className={styles}
				style={{
					position: 'absolute',
					width: isFullWidth ? '100%' : undefined,
					overflow: 'hidden',
					zIndex: 1
				}}
			/>}

		</div>
	)
}

export default Animation;
