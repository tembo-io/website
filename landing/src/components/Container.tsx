import React from 'react';
import cx from 'classnames';

interface Props {
    children: React.ReactNode;
    styles?: string
}

const Container: React.FC<Props> = ({ children, styles }) => {
  return (
    <div className={cx('container px-[80px] max-w-container mx-auto', styles)}>
        {children}
    </div>
  )
}

export default Container;
