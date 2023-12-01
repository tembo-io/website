import React from 'react';

interface Props {
  iconPath?: string;
  header: string;
  text: string;

}

const DetailSequence: React.FC<Props> = ({ iconPath, header, text }) => {
  return (
    <div className='flex flex-col gap-4 max-w-[530px]'>
      {iconPath && <img src={iconPath} alt='Colored Icon' className='w-[56px] h-[56px]' />}
      <h1 className='text-white font-semibold font-secondary text-xl'>{header}</h1>
      <p className='font-secondary font-medium text-base text-otherGrey opacity-70'>{text}</p>
    </div>
  )
}

export default DetailSequence;
