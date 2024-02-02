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
  tocQuerySelector: string = '.prose-toc a',
  offset: number = 200
) => {
  const anchors = useRef<NodeListOf<HTMLHeadingElement> | null>(null)
  const toc = useRef<NodeListOf<HTMLHeadingElement> | null>(null)

  const handleScroll = () => {
    const pageYOffset = window.pageYOffset
    let newActiveAnchor: string = ''

    anchors.current?.forEach((anchor) => {
      if (pageYOffset >= anchor.offsetTop - offset) {
        newActiveAnchor = anchor.id
      }
    })

    toc.current?.forEach((link) => {
      link.classList.remove('toc-animate')
      // TODO: escape emojis
      // The problem is that MDXRemote strips out emojis on slugs
      // but ReactMarkdown doesn't,instead it encodes them
      const sanitizedHref = (link.getAttribute('href') ?? '').replace('#', '')
      const isMatch = sanitizedHref === newActiveAnchor

      if (isMatch) {
        link.classList.add('toc-animate')
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

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const sections = document.querySelectorAll('h1, h2, h3, h4, h5, h6') as NodeListOf<HTMLHeadingElement>;

            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (
                    scrollPosition >= sectionTop &&
                    scrollPosition < sectionTop + sectionHeight
                ) {
                    setLink(section.id);
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleUrlAnchorChange = () => {
            const sectionFromUrl = window.location.hash.substring(1)
            setLink(sectionFromUrl);
        };

        window.addEventListener('hashchange', handleUrlAnchorChange);
        return () => {
            window.removeEventListener('hashchange', handleUrlAnchorChange);
        };
    }, []);

    useEffect(() => {
        window.location.hash = link
    }, [link])

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
