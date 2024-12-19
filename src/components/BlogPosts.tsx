import { useState } from 'react';
import { BlogPost } from './BlogPost';
import { AUTHORS } from 'src/blogAuthors';

interface Post {
	id: string;
	slug: string;
	title: string;
	date: string;
	author: string;
	readingTime: string;
	heroImage: string;
	body: string;
}

interface BlogPostsProps {
	posts: Post[];
	children: React.ReactNode;
}

export function BlogPosts({ posts, children }: BlogPostsProps) {
	const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

	const search = (query: string) => {
		const trimmedQuery = query.trim();
		if (trimmedQuery === '') {
			setFilteredPosts(posts);
			return;
		}

		const searchedPosts = posts.filter(
			(post) =>
				post.title.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
				post.body.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
				AUTHORS[post.author || 'ryw'].name
					.toLowerCase()
					.includes(trimmedQuery.toLowerCase()),
		);
		setFilteredPosts(searchedPosts);
	};

	return (
		<div className='mt-16'>
			<div className='flex justify-between items-center max-[720px]:flex-col-reverse max-[720px]:gap-y-4 gap-x-4'>
				<div className='flex items-center gap-3 flex-wrap'>
					{children}
				</div>
				<div className='relative w-full max-w-md'>
					<input
						className='w-full bg-[#1C1C1C] border border-[#383838] rounded-xl px-11 py-3 text-[15px] 
						placeholder:text-[#666] transition-all duration-200
						focus:border-[#4B4B4B] focus:outline-none focus:ring-1 focus:ring-[#4B4B4B]
						hover:border-[#4B4B4B]'
						onChange={(e) => search(e.target.value)}
						placeholder='Search articles...'
					/>
					<div className='absolute left-4 top-1/2 -translate-y-1/2'>
						<svg
							width='15'
							height='15'
							viewBox='0 0 15 15'
							fill='none'
							className='text-[#666]'
						>
							<path
								d='M14.5 14.5L10.5 10.5M6.5 12.5C3.18629 12.5 0.5 9.81371 0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5C9.81371 0.5 12.5 3.18629 12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5Z'
								stroke='currentColor'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</div>
				</div>
			</div>
			<div className='mt-12'>
				{filteredPosts.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{filteredPosts.map((post) => (
							<BlogPost
								key={post.id}
								title={post.title}
								slug={post.slug}
								readingTime={post.readingTime}
								date={post.date}
								author={post.author}
								heroImage={post.heroImage}
							/>
						))}
					</div>
				) : (
					<div className='text-center py-12'>
						<p className='text-[#666] font-medium'>
							No matching articles found
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
