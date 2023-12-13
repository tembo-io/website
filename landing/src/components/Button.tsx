import React from 'react';
import cx from 'classnames';

type Variant = 'neon' | 'gradient' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant: Variant;
	children: React.ReactNode;
	styles?: string;
	size?: Size;
}

const Button: React.FC<Props> = ({
	children,
	variant,
	styles,
	size,
	...rest
}) => {
	const getSizeStyles = () => {
		switch (size) {
			case 'sm':
				return 'py-2 px-6';
			case 'md':
				return 'py-2 px-8';
			case 'lg':
				return 'py-3 px-10';
			default:
				return 'py-2 px-6';
		}
	};
	const getVariantStyles = () => {
		switch (variant) {
			case 'neon':
				return 'bg-neon hover:bg-[#D1E278] text-black';
			case 'gradient':
				return 'bg-gradient-button text-white';
			case 'outline':
				return 'bg-transparent text-white border-2 border-white';
		}
	};
	return (
		<button
			className={cx(
				'transition-all duration-150 ease-in font-medium rounded-full font-secondary text-base',
				getVariantStyles(),
				getSizeStyles(),
				styles,
			)}
			{...rest}
		>
			{children}
		</button>
	);
};

export default Button;
