import React, { type FC } from 'react';
import cx from 'classnames';

interface Props {
	bgDimensionsClassName?: string;
	iconDimensionsClassName?: string;
	iconPath: string;
}

const IconWithBackground: FC<Props> = ({
	bgDimensionsClassName = 'w-8 h-8',
	iconDimensionsClassName = 'w-4 h-4',
	iconPath,
}) => {
	return (
		<div
			className={cx(
				'flex justify-center items-center rounded-full bg-semiGrey2 p-2 mr-3',
				bgDimensionsClassName,
			)}
		>
			<img
				src={iconPath}
				alt='black and white icon representing title'
				className={iconDimensionsClassName}
			/>
		</div>
	);
};

export default IconWithBackground;
