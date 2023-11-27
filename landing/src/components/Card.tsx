import React from 'react';
import cx from 'classnames'

interface Props {
  children: React.ReactNode;
  styles?: string;
}

const Card: React.FC<Props> = ({ children, styles }) => {
  return (
    <div className={cx('rounded-[30px] p-5 bg-neon', styles)}>{children}</div>
  )
}

export default Card;
