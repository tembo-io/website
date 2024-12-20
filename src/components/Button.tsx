import React, { type AnchorHTMLAttributes } from 'react';
import cx from 'classnames';
import { navigate } from 'astro:transitions/client';

export type Variant =
	| 'primary'
	| 'neon'
	| 'gradient'
	| 'outline'
	| 'blue'
	| 'sqlBlue'
	| 'green'
	| 'sqlPink'
	| 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant: Variant;
	children: React.ReactNode;
	target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
	styles?: string;
	size?: Size;
	link?: string;
	isLinkTag?: boolean;
	scrollTo?: boolean;
	scrollToElement?: string;
}

const Button: React.FC<Props> = ({
	children,
	variant,
	styles,
	size,
	target = '',
	link,
	isLinkTag = false,
	scrollTo,
	scrollToElement,
	...rest
}) => {
	const getSizeStyles = () => {
		switch (size) {
			case 'sm':
				return 'py-2 px-6 text-sm';
			case 'md':
				return 'py-2 px-8 text-base';
			case 'lg':
				return 'py-3 px-10 text-base';
			case 'xl':
				return 'py-6 px-8 text-base';
			default:
				return 'py-2 px-6 text-sm';
		}
	};
	const getVariantStyles = () => {
		switch (variant) {
			case 'neon':
				return 'bg-neon hover:bg-[#D1E278] text-black';
			case 'gradient':
				return 'bg-gradient-button hover:opacity-80 text-white';
			case 'primary':
				return 'bg-semiGrey2 hover:opacity-80 text-white';
			case 'outline':
				return 'bg-transparent hover:bg-white hover:text-black text-white border border-white';
			case 'blue':
				return 'bg-lightBlue hover:opacity-80 text-mwasi';
			case 'sqlBlue':
				return 'bg-sqlBlue hover:opacity-80 text-mwasi';
			case 'sqlPink':
				return 'bg-sqlPink hover:opacity-80 text-mwasi';
			case 'green':
				return 'bg-pricingGreen hover:opacity-80 text-mwasi';
			case 'ghost':
				return 'bg-transparent hover:bg-white/10 text-white transition-all duration-75';
		}
	};
	return isLinkTag ? (
		<a
			href={link}
			target={target}
			className={cx(
				'transition-all duration-75 ease-in font-medium rounded font-secondary text-base text-center',
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
				'transition-all duration-75 ease-in font-medium rounded font-secondary text-base',
				getVariantStyles(),
				getSizeStyles(),
				styles,
			)}
			onClick={
				scrollTo
					? () => {
							document
								.getElementById(scrollToElement || '')
								?.scrollIntoView({
									behavior: 'smooth',
									block: 'center',
								});
						}
					: ['gradient', 'blue', 'green'].includes(variant)
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
