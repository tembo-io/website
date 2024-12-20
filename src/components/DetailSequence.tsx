import React from 'react';
import cx from 'classnames';
import { motion } from 'framer-motion';

interface Props {
	iconPath?: string;
	header: string;
	text: string;
	styles?: string;
	delay?: number;
	headerStyles?: string;
	textStyles?: string;
}

function DetailSequence({
	iconPath,
	header,
	text,
	styles,
	headerStyles,
	textStyles,
	delay,
}: Props) {
	return (
		<div className={cx('flex flex-col gap-4 max-w-[530px]', styles)}>
			{iconPath && (
				<img
					src={iconPath}
					alt='Colored Icon'
					className='w-8 h-8 brightness-125'
				/>
			)}
			<h1
				className={cx('text-white font-semibold text-xl', headerStyles)}
			>
				{header}
			</h1>
			<p
				className={cx(
					'font-secondary font-normal text-base text-otherGrey opacity-70',
					textStyles,
				)}
			>
				{text}
			</p>
		</div>
	);
}

export default DetailSequence;
