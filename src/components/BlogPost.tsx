import { AUTHORS } from 'src/blogAuthors';

interface BlogPostProps {
	title: string;
	slug: string;
	readingTime: string;
	date: string;
	author: string;
	heroImage: string;
}

export function BlogPost({
	title,
	slug,
	readingTime,
	date,
	author,
	heroImage,
}: BlogPostProps) {
	const authorInfo = AUTHORS[author || 'ryw'];

	return (
		<a
			href={`/blog/${slug}`}
			className='group flex flex-col h-[400px] bg-[#1C1C1C] rounded-xl overflow-hidden border border-[#383838] 
			transition-all duration-200 hover:border-[#4B4B4B] hover:-translate-y-1'
		>
			<div className='h-[200px] overflow-hidden'>
				<img
					src={heroImage}
					alt={title}
					className='w-full h-full object-cover transition-transform duration-200 group-hover:scale-105'
				/>
			</div>
			<div className='flex flex-col flex-1 p-6 justify-between'>
				<h3 className='font-semibold text-xl text-white line-clamp-2'>
					{title}
				</h3>
				<div className='flex items-center gap-4'>
					<img
						src={authorInfo.image_url}
						alt={authorInfo.name}
						className='w-8 h-8 rounded-full object-cover'
					/>
					<div className='flex flex-col'>
						<span className='text-sm text-white font-medium'>
							{authorInfo.name}
						</span>
						<div className='flex items-center gap-2 text-sm text-[#666]'>
							<span>{date}</span>
							<span>•</span>
							<span>{readingTime}</span>
						</div>
					</div>
				</div>
			</div>
		</a>
	);
}
