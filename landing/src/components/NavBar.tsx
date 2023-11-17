import React from 'react';
import pkg from '@rapid-web/ui';
const { Flex, Container, styles } = pkg;

interface Props {
  currentPage: string;
}

const NavBar = () => {
  return (
    <div>
      <div className='bg-gradient-rainbow h-[4px] w-full' />
      <Container maxWidth='lg'>
        <Flex styles='justify-between items-center py-8'>
          <img src='/logoWithText.svg' alt='tembo log' width={124} />
          <Flex styles='gap-12'>
            <a href="/home" className='font-secondary font-medium'>Home</a>
            <a href="/product" className='font-secondary font-medium'>Product</a>
            <a href="/pricing" className='font-secondary font-medium'>Pricing</a>
            <a href="/blog" className='font-secondary font-medium'>Blog</a>
          </Flex>
          <a href="https://cloud.tembo.io"><button>Try Free</button></a>
        </Flex>
      </Container>
    </div>

  )
}

export default NavBar;
