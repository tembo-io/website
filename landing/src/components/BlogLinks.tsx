import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { Link, Button, Element, Events, animateScroll as scroll, scrollSpy } from 'react-scroll';

interface Props {
    headings: {
        text: string,
        slug: string
    }[]
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
            const sections = document.querySelectorAll('h2');

            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (
                    scrollPosition >= sectionTop - 50 &&
                    scrollPosition < sectionTop + sectionHeight - 50
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
            console.log('CALLED')
        };

        window.addEventListener('hashchange', handleUrlAnchorChange);
        return () => {
            window.removeEventListener('hashchange', handleUrlAnchorChange);
        };
    }, []);

    useEffect(() => {
        window.location.hash = link;
    }, [link]);

    return (
        <div className='flex flex-col gap-6 max-w-[250px]'>
            <h2 className='text-lightGrey font-bold'>On this page</h2>
            <div className='flex flex-col border-l-2 border-[#9EA2A633] gap-4'>
                {headings.map(({ text, slug }, index) => <a href={`#${slug}`} key={slug} onClick={() => handleLinkClick(slug)} className={cx('text-white font-secondary text-xs pl-4 border-l-2 py-1', link === slug || link === '' && index === 0 ? 'border-neon' : 'border-transparent')}>{text}</a>)}
            </div>
        </div>
    )
}

export default BlogLinks;
