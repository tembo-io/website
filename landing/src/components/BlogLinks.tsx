import React from 'react';
import cx from 'classnames';

interface Props {
    headings: {
        text: string,
        slug: string
    }[]
}

const BlogLinks: React.FC<Props> = ({ headings }) => {
  return (
    <div className='flex flex-col min-w-[300px] items-end'>
        <div className='flex flex-col gap-4 w-max'>
            <h2 className='text-lightGrey font-bold'>On this page</h2>
            <div className='flex flex-col gap-2 border-l-2 border-[#9EA2A633]'>
                {headings.map(({ text, slug }) => <a href={`#${slug}`} className={cx('text-white font-secondary text-xs pl-4 border-l-2 border-transparent', window.location.href.includes(`${slug}`) ? 'border-neon' : 'border-transparent')}>{text}</a>)}
            </div>
        </div>
    </div>
  )
}

export default BlogLinks;