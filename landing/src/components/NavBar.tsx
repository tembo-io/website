import React from 'react';
import Container from '../components/Container';
import Button from './Button';
import cx from 'classnames';

interface Props {
  currentPage: string
}

const NavBar: React.FC<Props> = ({ currentPage }) => {
  return (
    <div className='z-100'>
      <div className='bg-gradient-rainbow h-[4px] w-full' />
      <Container>
        <div className='flex justify-between items-center py-8'>
          <a href="/"><img src='/logoWithText.svg' alt='tembo log' width={124} /></a>
          <div className='flex items-center gap-12'>
            <a href="/" className={cx('font-secondary font-medium z-10', currentPage == '/' ? 'text-neon' : 'text-white opacity-70')}>Home</a>
            <a href="/product" className={cx('font-secondary font-medium z-10', currentPage == '/product' ? 'text-neon' : 'text-white opacity-70')}>Product</a>
            <a href="/pricing" className={cx('font-secondary font-medium z-10', currentPage == '/pricing' ? 'text-neon' : 'text-white opacity-70')}>Pricing</a>
            <a href="/blog" className={cx('font-secondary font-medium z-10', currentPage == '/blog' ? 'text-neon' : 'text-white opacity-70')}>Blog</a>
          </div>
          <a href="https://cloud.tembo.io"><Button variant='neon' styles='z-100'>Try Free</Button></a>
        </div>
      </Container>
    </div>
  )
}

export default NavBar;
