import React, { useEffect, useState} from 'react';
import Container from '../components/Container';
import Button from './Button';
import cx from 'classnames';
import { navigate } from 'astro/transitions/router';

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
        <nav className={cx('flex justify-between items-center transition-all duration-100', scrollY > 20 ? 'py-3 mobile:py-4' : 'py-8')}>
          <a href="/" className='focus:outline-none transition hover:scale-105 duration-300 ease-in-out delay-70'><img src='/logoWithText.svg' alt='tembo log' className='w-[105px] mobile:w-[124px]' /></a>
          <div className='mobile:flex hidden items-center gap-12'>
            <a href="/" className={cx('font-secondary font-medium z-10', currentPage == '/' ? 'text-neon' : 'text-white opacity-70')}>Home</a>
            <a href="/product" className={cx('font-secondary font-medium z-10', currentPage == '/product' || currentPage == '/product/' ? 'text-neon' : 'text-white opacity-70')}>Product</a>
            <a href="/pricing" className={cx('font-secondary font-medium z-10', currentPage == '/pricing' || currentPage == '/pricing/' ? 'text-neon' : 'text-white opacity-70')}>Pricing</a>
            <a href="/blog" className={cx('font-secondary font-medium z-10', currentPage == '/blog' || currentPage == '/blog/' ? 'text-neon' : 'text-white opacity-70')}>Blog</a>
          </div>
         <Button variant='neon' styles='mobile:flex hidden z-100' onClick={() => navigate('https://cloud.tembo.io')}>Try Free</Button>
          <button onClick={() => console.log('MENU CLICKED!')} className='mobile:hidden flex flex-col gap-[2.5px] items-center justify-center bg-neon rounded-full w-[32.57px] h-[32.57px] p-2.5'>
            <div className='bg-[#292D32] rounded-full w-full h-[1.5px]' />
            <div className='bg-[#292D32] rounded-full w-full h-[1.5px]' />
            <div className='bg-[#292D32] rounded-full w-full h-[1.5px]' />
          </button>
        </nav>
      </Container>
      <div className={cx('absolute bottom-0 flex h-[1px] w-full flex-row items-center justify-center opacity-100 shine', scrollY > 20 ? 'flex' : 'hidden' )} />
    </div>
  )
}

export default NavBar;
