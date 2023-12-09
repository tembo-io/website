import React from 'react';
import cx from 'classnames';

type Variant = 'neon' | 'gradient';
type Size = 'sm' | 'md' | 'lg';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant: Variant;
    children: React.ReactNode;
    styles?: string;
    size?: Size;
}

const Button: React.FC<Props> = ({ children, variant, styles, size, ...rest }) => {
    const getSizeStyles = () => {
        switch(size) {
            case 'sm':
                return 'py-2 px-6';
            case 'md':
                return 'py-2 px-8';
            case 'lg':
                return 'py-4 px-12';
            default:
                return 'py-2 px-6'
        }
    }
    return (
        <button
            className={cx('transition-all duration-150 ease-in font-medium rounded-full font-secondary', variant == 'neon' ? 'bg-neon hover:bg-[#D1E278]' : 'bg-gradient-button text-white', getSizeStyles(), styles)}
            {...rest}
        >
            {children}
        </button>
    )
}

export default Button;
