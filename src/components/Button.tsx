import React from 'react';
import cx from 'classnames';
import { navigate } from 'astro:transitions/client';

type Variant = 'primary' | 'neon' | 'gradient' | 'outline' | 'blue' | 'green';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant: Variant;
	children: React.ReactNode;
	styles?: string;
	size?: Size;
	link?: string;
	isLinkTag?: boolean;
}

const Button: React.FC<Props> = ({
	children,
	variant,
	styles,
	size,
	link,
	isLinkTag = false,
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
			case 'xl':
				return 'py-6 px-8';
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
			case 'primary':
				return 'bg-semiGrey2 hover:opacity-[80%] text-white';
			case 'outline':
				return 'bg-transparent text-white border border-white';
			case 'blue':
				return 'bg-lightBlue text-mwasi';
			case 'green':
				return 'bg-pricingGreen text-mwasi';
		}
	};
	return isLinkTag ? (
		<a
			href={link}
			className={cx(
				'transition-all duration-150 ease-in font-medium rounded-full font-secondary text-base text-center',
				getVariantStyles(),
				getSizeStyles(),
				styles,
			)}
		>
			{children}
		</a>
	) : (
		<button
			className={cx(
				'transition-all duration-150 ease-in font-medium rounded-full font-secondary text-base',
				getVariantStyles(),
				getSizeStyles(),
				styles,
			)}
			onClick={
				['gradient', 'blue', 'green'].includes(variant)
					? () => navigate('https://cloud.tembo.io')
					: link
						? () => navigate(link)
						: undefined
			}
			{...rest}
		>
			{children}
		</button>
	);
};

export default Button;
