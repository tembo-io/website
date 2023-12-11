import React from 'react';
import cx from 'classnames';

interface Props {
  iconPath?: string;
  header: string;
  text: string;
  styles?: string;
}

const DetailSequence: React.FC<Props> = ({ iconPath, header, text, styles }) => {
  return (
    <div className={cx('flex flex-col gap-4 max-w-[530px]', styles)}>
      {iconPath && <img src={iconPath} alt='Colored Icon' className='w-[56px] h-[56px]' />}
      <h1 className='text-white font-semibold font-secondary text-xl'>{header}</h1>
      <p className='font-secondary font-normal text-base text-otherGrey opacity-70'>{text}</p>
    </div>
  )
}

export default DetailSequence;
