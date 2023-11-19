import React, { useEffect, useState} from 'react';
import Container from '../components/Container';
import Button from './Button';
import cx from 'classnames';

interface Props {
  currentPage: string
}

const NavBar: React.FC<Props> = ({ currentPage }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
			setScrollY(window.scrollY);
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
  }, []);

  return (
    <div className={cx('fixed top-0 w-full z-50 transition duration-100', scrollY > 20 ? 'backdrop-blur-lg safari-blur' : '')} >
      <div className='bg-gradient-rainbow h-[4px] w-full' />
      <Container>
        <nav className={cx('flex justify-between items-center transition-all duration-100', scrollY > 20 ? 'py-4' : 'py-8')}>
          <a href="/"><img src='/logoWithText.svg' alt='tembo log' width={124} /></a>
          <div className='flex items-center gap-12'>
            <a href="/" className={cx('font-secondary font-medium z-10', currentPage == '/' ? 'text-neon' : 'text-white opacity-70')}>Home</a>
            <a href="/product" className={cx('font-secondary font-medium z-10', currentPage == '/product' ? 'text-neon' : 'text-white opacity-70')}>Product</a>
            <a href="/pricing" className={cx('font-secondary font-medium z-10', currentPage == '/pricing' ? 'text-neon' : 'text-white opacity-70')}>Pricing</a>
            <a href="/blog" className={cx('font-secondary font-medium z-10', currentPage == '/blog' ? 'text-neon' : 'text-white opacity-70')}>Blog</a>
          </div>
          <a href="https://cloud.tembo.io"><Button variant='neon' styles='z-100'>Try Free</Button></a>
        </nav>
      </Container>
      <div className={cx('absolute bottom-0 flex h-[1px] w-full flex-row items-center justify-center opacity-100 shine', scrollY > 20 ? 'flex' : 'hidden' )} />
    </div>
  )
}

export default NavBar;
