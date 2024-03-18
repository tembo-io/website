const Search = () => {
	return (
		<div className='bg-mwasi border border-[#EAEAEA33] rounded-full px-[6px] py-[6px] docsSearch:w-[280px] mobile:w-[420px] flex items-center justify-between hover:cursor-pointer'>
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
	);
};

export default Search;
