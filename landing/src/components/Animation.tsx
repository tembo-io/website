import React from 'react';
import Lottie from 'lottie-react';

interface Props {
	animation: unknown;
	styles?: string;
}

const Animation: React.FC<Props> = ({ animation, styles }) => {
  return (
	<Lottie
		animationData={animation}
		loop={true}
		className={styles}
		style={{
			position: 'absolute',
			width: '100%',
			overflow: 'hidden',
			zIndex: 1
		}}
	/>
  )
}

export default Animation;
