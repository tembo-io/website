import React from 'react';
import pkg from '@rapid-web/ui';
const { Flex, Container, styles, createVariant } = pkg;

interface Props {
  currentPage: string;
}

const NavBar: React.FC<Props> = ({ currentPage }) => {
  return (
    <div>
      <div className='bg-gradient-rainbow h-[4px] w-full' />
      <Container maxWidth='lg'>
        <Flex styles='justify-between items-center py-8'>
          <img src='/logoWithText.svg' alt='tembo log' width={124} />
          <Flex styles='gap-12'>
            <a href="/" className={styles('font-secondary font-medium', currentPage == '/' ? 'text-neon' : 'text-white')}>Home</a>
            <a href="/product" className={styles('font-secondary font-medium', currentPage == '/product' ? 'text-neon' : 'text-white')}>Product</a>
            <a href="/pricing" className={styles('font-secondary font-medium', currentPage == '/pricing' ? 'text-neon' : 'text-white')}>Pricing</a>
            <a href="/blog" className={styles('font-secondary font-medium', currentPage == '/blog' ? 'text-neon' : 'text-white')}>Blog</a>
          </Flex>
          <a href="https://cloud.tembo.io"><button className='bg-neon'>Try Free</button></a>
        </Flex>
      </Container>
    </div>

  )
}

export default NavBar;
