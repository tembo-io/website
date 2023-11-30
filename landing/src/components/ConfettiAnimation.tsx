import React from 'react';
import Lottie from 'lottie-react';
import ConfettiAnimationJson from '../animations/Confetti.json';

const ConfettiAnimation = () => {
  return (
	<Lottie
		animationData={ConfettiAnimationJson}
		loop={true}
		style={{
			position: 'absolute',
			width: '100%',
			overflow: 'hidden',
			zIndex: 1
		}}
	/>
  )
}

export default ConfettiAnimation;
