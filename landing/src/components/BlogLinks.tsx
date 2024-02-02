import React, { useEffect, useState, useRef } from 'react';
import cx from 'classnames';

interface Props {
    headings: {
        text: string,
        slug: string
    }[]
}


const useActiveAnchors = (
  anchorsQuerySelector: string = 'h2',
  tocQuerySelector: string = '.prose-toc',
  offset: number = 120
) => {
  const anchors = useRef<NodeListOf<HTMLHeadingElement> | null>(null)
  const toc = useRef<NodeListOf<HTMLHeadingElement> | null>(null)

  const handleScroll = () => {
    const pageYOffset = window.scrollY;
    let newActiveAnchor: string = '';

    anchors.current?.forEach((anchor) => {
      if (pageYOffset >= anchor.offsetTop - offset) {
        if (!!anchor.id) {
            newActiveAnchor = anchor.id
        }
      }
    })

    toc.current?.forEach((link) => {
      link.classList.remove('border-neon')
      link.classList.add('border-transparent')
      const sanitizedHref = (link.getAttribute('href') ?? '').replace('#', '')

      const isMatch = sanitizedHref === newActiveAnchor;

      if (isMatch) {
        link.classList.remove('border-transparent')
        link.classList.add('border-neon')
      }
    })
  }

  useEffect(() => {
    anchors.current = document.querySelectorAll(anchorsQuerySelector)
    toc.current = document.querySelectorAll(tocQuerySelector)

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null
}


const BlogLinks: React.FC<Props> = ({ headings }) => {
    const [link, setLink] = useState('')
    useEffect(() => {
        setLink(window.location.hash)
    }, [])


    const handleLinkClick = (section: string) => {
        scrollToSection(section);
      };

    const scrollToSection = (section: string) => {
        const element = document.getElementById(section);
        element?.scrollIntoView({ behavior: 'smooth' });
    };
    const _ = useActiveAnchors();

    return (
        <div className='flex flex-col gap-6 max-w-[250px]'>
            <h2 className='text-lightGrey font-bold'>On this page</h2>
            <div className='flex flex-col border-l-2 border-[#9EA2A633] gap-4'>
                {headings.map(({ text, slug }, index) => <a href={`#${slug}`} key={slug} onClick={() => handleLinkClick(slug)} className={cx('text-white font-secondary text-xs pl-4 border-l-2 py-1 prose-toc', link === slug || link === '' && index === 0 ? 'border-neon' : 'border-transparent')}>{text}</a>)}
            </div>
        </div>
    )
}

export default BlogLinks;
