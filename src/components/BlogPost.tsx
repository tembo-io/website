import BookIcon from '../images/book.svg';
import { AUTHORS } from '../blogAuthors';
interface Props {
	title: string;
	slug: string;
	heroImage?: string;
	readingTime: string;
	date: string;
	author?: string;
}

export function BlogPost({
	title,
	slug,
	heroImage,
	readingTime,
	date,
	author: authorProp,
}: Props) {
	const author = AUTHORS[authorProp || 'ryw'];
	return (
		<a
			className='col-span-12 mb-8 md:col-span-12 lg:col-span-6 xl:col-span-4 flex flex-col items-start justify-between bg-mwasi rounded-xl p-4 min-w-full gap-6 transition-all duration-300 ease-in-out hover:scale-[101.5%]'
			href={`/blog/${slug}`}
		>
			<div className='flex flex-col gap-6'>
				{heroImage ? (
					<img
						src={heroImage}
						alt={`${title} thumbnail`}
						className='rounded-xl w-full lg:max-h-[200px]'
					/>
				) : (
					<img
						src='/blogFallbackImage.svg'
						alt={`${title} thumbnail`}
						className='rounded-xl w-full lg:max-h-[200px]'
					/>
				)}

				<div className='flex items-center gap-4'>
					<img
						src={author.image_url}
						className='rounded-full w-12 h-12'
						alt={author.name}
					/>
					<div>
						<h1 className='text-sm font-bold text-white'>
							{author.name}
						</h1>
						<p className='text-lightGrey text-sm'>{author.title}</p>
					</div>
				</div>
				<h2 className='text-white text-[20px]'>{title}</h2>
			</div>
			<div className='flex items-center justify-between w-full'>
				<div className='flex gap-2'>
					<img
						src={'src/images/book.svg'}
						alt='book'
						width={24}
						height={24}
					/>
					<p className='text-lightGrey'>{readingTime}</p>
				</div>
				<p className='text-lightGrey'>{date}</p>
			</div>
		</a>
	);
}
