import React, { useEffect, useState, useRef } from 'react';
import { useActiveAnchors } from '../util';
import cx from 'classnames';

interface Props {
    headings: {
        text: string,
        slug: string
    }[]
}


const BlogLinks: React.FC<Props> = ({ headings }) => {
    const [link, setLink] = useState('')
    const firstHeadingSlug = headings[0]?.slug || '';

    useEffect(() => {
        setLink(window.location.hash.substring(1))
    }, [])


    const handleLinkClick = (section: string) => {
        scrollToSection(section);
      };

    const scrollToSection = (section: string) => {
        const element = document.getElementById(section);
        element?.scrollIntoView();
    };

    const _ = useActiveAnchors(firstHeadingSlug);

    return (
        <div className='flex flex-col gap-6 max-w-[250px]'>
            <h2 className='text-lightGrey font-bold'>On this page</h2>
            <div className='flex flex-col border-l-2 border-[#9EA2A633] gap-4'>
                {headings.map(({ text, slug }, index) => <a href={`#${slug}`} key={slug} onClick={() => handleLinkClick(slug)} className={cx('font-secondary text-xs pl-4 border-l-2 py-1 prose-toc transition-all duration-75 ease-in-out', link === slug || link === '' && index === 0 ? 'border-neon text-white' : 'border-transparent text-grey')}>{text}</a>)}
            </div>
        </div>
    )
}

export default BlogLinks;
