import React from 'react';
import { Tweet as ReactTweet } from 'react-tweet'

interface Props {
    id: string;
}

const Tweet = ({ id }: Props) => {
  return (
    <div className='not-prose'>
        <ReactTweet id={id} />
    </div>
  )
}

export default Tweet;
