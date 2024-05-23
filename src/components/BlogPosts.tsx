import { useCallback, useMemo, useState } from 'react';
import { BlogPost } from './BlogPost';

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
		if (query.trim() === '') {
			setFilteredPosts(posts);
			return;
		}
		const filteredPosts_ = posts.filter(
			(post) =>
				post.title.toLowerCase().includes(query.trim().toLowerCase()) ||
				post.body.toLowerCase().includes(query.trim().toLowerCase()),
		);
		setFilteredPosts(filteredPosts_);
	};

	return (
		<div className='mt-16'>
			<div className='flex justify-between max-[720px]:flex-col-reverse max-[720px]:gap-y-4'>
				<div className='flex items-center gap-2 flex-wrap'>
					{children}
				</div>
				<div className='relative'>
					<input
						className='bg-mwasi border border-[#EAEAEA33] rounded-full px-[6px] pl-11 py-[6px] w-[400px] h-[42.57px] max-[720px]:w-full [@media(min-width:600px)]:h-[45px] flex items-center justify-between hover:cursor-pointer'
						onChange={(e) => search(e.target.value)}
					/>
					<div className='bg-white w-max p-2 rounded-full absolute top-2 left-2'>
						<img
							src={'/docs-search.svg'}
							width={12}
							height={12}
							alt='search icon'
						/>
					</div>
				</div>
			</div>
			<div className='mt-10 pb-2'>
				<div className='grid grid-cols-12 lg:gap-6'>
					{filteredPosts.length > 0 ? (
						filteredPosts.map((post) => {
							return (
								<BlogPost
									title={post.title}
									slug={post.slug}
									readingTime={post.readingTime}
									date={post.date}
									author={post.author}
									heroImage={post.heroImage}
									key={post.id}
								/>
							);
						})
					) : (
						<p className='text-salmon font-semibold col-span-2'>
							No results.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
