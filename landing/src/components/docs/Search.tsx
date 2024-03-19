// @ts-nocheck
import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import SearchItem from './SearchItem';

const Search = () => {
	const [searchResults, setSearchResults] = useState([]);
	const [isShowingSearch, setIsShowingSearch] = useState(false);
	const reactWindow = import.meta.env.SSR
		? {
				pagefind: {
					search(value: string) {
						return '';
					},
				},
			}
		: window;

	useEffect(() => {
		const initSearch = async () => {
			await reactWindow.initSearch();
		};
		if (isShowingSearch) initSearch();
	}, [isShowingSearch]);

	useEffect(() => {
		const down = (e) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsShowingSearch((open) => !open);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	return (
		<>
			<div
				className='bg-mwasi border border-[#EAEAEA33] rounded-full px-[6px] py-[6px] docsSearch:w-[280px] mobile:w-[420px] flex items-center justify-between hover:cursor-pointer'
				onClick={() => setIsShowingSearch(true)}
			>
				<div className='bg-white w-max p-2 rounded-full'>
					<img
						src={'/docs-search.svg'}
						width={12}
						height={12}
						alt='search icon'
					/>
				</div>
				<div className='border border-[#EAEAEA33] rounded-[20px] py-1 px-[10px] mr-2 hidden docsSearch:flex'>
					<img src='/commandK.svg' alt='command + K' width={20} />
				</div>
			</div>
			{isShowingSearch && (
				<Command.Dialog
					open={isShowingSearch}
					onOpenChange={setIsShowingSearch}
					shouldFilter={false}
					className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-[#141412] rounded-2xl max-w-[600px] w-full shadow-md DocsSearchDialogContent min-[300px] max-h-[500px]'
					overlayClassName='DocsSearchDialogOverlay backdrop-blur-sm safari-blur'
				>
					<div className='px-6 pt-6'>
						<div className='bg-mwasi border border-[#EAEAEA33] rounded-full mb-2 px-4 py-[8px] focus-within:outline outline-2 outline-offset-4 outline-salmon relative'>
							<Command.Input
								className='w-full bg-mwasi focus:border-none focus:outline-none docs-search-input'
								placeholder='Search the Tembo docs...'
								onValueChange={async (val) => {
									const search =
										await reactWindow.pagefind.search(val);
									const cleanedResults = await Promise.all(
										search.results.map(async (item) => {
											const data = await item.data();
											console.log(item);
											return {
												id: item.id,
												title: data?.meta?.title,
												url: data?.url,
												excerpt: data?.excerpt,
											};
										}),
									);

									setSearchResults(cleanedResults);
								}}
							/>
							<div className='bg-[#141412] w-max p-2 rounded-full absolute right-[5px] top-1/2 -translate-y-1/2'>
								<img
									src={'/icons/docs-search-white.svg'}
									width={12}
									height={12}
									alt='search icon'
								/>
							</div>
						</div>
					</div>
					<div className='w-full h-[1px] bg-[#292929] mt-6' />
					<div className='max-h-[400px] overflow-y-auto'>
						<Command.List className='p-6'>
							<Command.Empty>No results found.</Command.Empty>
							{searchResults.length > 0 && (
								<Command.Group
									heading='Results'
									className='text-sm text-lightGrey'
								>
									<div className='mt-4 flex flex-col gap-4'>
										{searchResults.map((item) => (
											<SearchItem
												key={item.id}
												title={item.title}
												url={item.url}
												excerpt={item.excerpt}
											/>
										))}
									</div>
								</Command.Group>
							)}
						</Command.List>
					</div>
				</Command.Dialog>
			)}
		</>
	);
};

export default Search;
