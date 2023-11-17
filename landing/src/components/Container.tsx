import React from 'react';

interface Props {
    children: React.ReactNode
}

const Container: React.FC<Props> = ({ children }) => {
  return (
    <div className='container px-4 max-w-container mx-auto'>
        {children}
    </div>
  )
}

export default Container;
