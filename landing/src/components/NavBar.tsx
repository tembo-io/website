import React from 'react';
import pkg from '@rapid-web/ui';
const { Flex, Container } = pkg;

const NavBar = () => {
  return (
    <div>
      <div className='bg-gradient-rainbow h-[4px] w-full' />
      <Container maxWidth='lg'>
        <Flex styles='justify-between items-center py-8'>
          <img src='/logoWithText.svg' alt='tembo log' width={124} />
          <Flex>
            <a href="/product">Product</a>
            <a href="/pricing">Pricing</a>
            <a href="/blog">Blog</a>
          </Flex>
          <a href="https://cloud.tembo.io"><button>Try Free</button></a>
        </Flex>
      </Container>
    </div>

  )
}

export default NavBar;
