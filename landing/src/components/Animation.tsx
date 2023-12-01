import React from 'react';
import Lottie from 'lottie-react';

interface Props {
	animation: unknown;
	styles?: string;
	isFullWidth?: boolean;
}

const Animation: React.FC<Props> = ({ animation, styles, isFullWidth = true }) => {
  return (
	<Lottie
		animationData={animation}
		loop={true}
		className={styles}
		style={{
			position: 'absolute',
			width: isFullWidth ? '100%' : undefined,
			overflow: 'hidden',
			zIndex: 1
		}}
	/>
  )
}

export default Animation;
