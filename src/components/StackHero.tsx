const STACK_HERO_CARDS_DETAILS = [
	{
		title: 'Message Queue',
		description:
			'An alternative to AWS SQS and Redis RSMQ, on Postgres. Interface to Postgres queues using SQL, REST API, and many client libraries including Python, Rust, and Go.',
		image: '/mq-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/transactional/message-queue',
	},
	{
		title: 'VectorDB',
		description:
			'Store, index, retrieve, and generate embeddings in Postgres.',
		image: '/vectordb-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/ai/vectordb/getting-started',
	},
	{
		title: 'Timeseries',
		description:
			'Efficiently store and query data indexed by time, optimizing performance for chronological data analysis in real-time monitoring and trend forecasting.',
		image: '/timeseries-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/analytical/timeseries',
	},
	{
		title: 'OLTP',
		description:
			'A low latency transactional processing stack with high I/O performance, concurrency, and real-time metrics.',
		image: '/oltp-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/transactional/oltp',
	},
	{
		title: 'Machine Learning Stack',
		description:
			'Machine learning training and inference directly from Postgres. Built on PostgresML, pg_vector and pg_vectorize.',
		image: '/ml-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/ai/machine-learning',
	},
	{
		title: 'Geospatial',
		description:
			'Postgres indices and operations optimized for Geospatial workloads.',
		image: '/geospatial-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/analytical/geospatial',
	},
	{
		title: 'Mongo Alternative on Postgres',
		description: 'Mongo-compatible wire protocol on Postgres.',
		image: '/mongo-alt-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/transactional/mongo-alternative',
	},
] as const;

function StackHero() {
	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
				{STACK_HERO_CARDS_DETAILS.map((stackCard, index) => (
					<a
						className='stack-card border bg-mwasi border-[#FFFFFF0D] rounded-[30px] px-4 pt-4 pb-6 flex flex-col gap-8 hover:scale-[101.5%] transition-all duration-300'
						href={stackCard.url}
						target='_blank'
						rel='noreferrer'
						key={index}
					>
						<div className='rounded-[28.65px] border-[0.72px] border-[#FFFFFF0D] p-3'>
							<div className='border-dashed border-[#FFFFFF0D] border rounded-[28.65px] relative'>
								<img
									src='/dashed-rectangle.svg'
									alt='dashed rectangle'
									className='w-full h-full'
								/>
								<img
									src='/cartesian-grid.svg'
									alt='cartesian grid'
									className='w-full h-full absolute m-auto text-center left-0 right-0 top-0'
								/>
								<img
									src={stackCard.image}
									alt={`${stackCard.title} elephant`}
									className='absolute m-auto text-center left-0 right-0 top-6'
								/>
							</div>
						</div>
						<div className='flex flex-col gap-2'>
							<h3 className='font-bold text-base leading-[17.19px] text-white'>
								{stackCard.title}
							</h3>
							<p className="font-normal text-xs leading-[14.52px] font-['Inter'] text-otherGrey">
								{stackCard.description}
							</p>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}

export default StackHero;
