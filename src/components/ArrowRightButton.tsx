import { type FC } from 'react';

interface Props {
	link: string;
}

const ArrowRightButton: FC<Props> = ({ link }) => {
	return (
		<a href={link} target='_blank'>
			<img
				src='/public/arrow-right-white.svg'
				width={24}
				height={24}
				alt='chevron arrow right'
			/>
		</a>
	);
};

export default ArrowRightButton;
