const STACK_HERO_CARDS_DETAILS = [
	{
		title: 'Data Warehouse',
		description:
			'Extract, Transform and Load data from external sources. Build a centralized datastore for analytical and tactical queries.',
		image: '/datawarehouse-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/analytical/data-warehouse',
	},
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
		title: 'Retrieval Augmented Generation',
		description: 'LLM function calling directly from Postgres.',
		image: '/rag-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/ai/rag',
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
		title: 'OLAP',
		description:
			'Tuned for handling high volumes of short, atomic transactions that ensure data integrity and concurrency in real-time operational systems.',
		image: '/olap-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/analytical/olap',
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
	{
		title: 'Data Warehouse',
		description:
			'Extract, Transform and Load data from external sources. Build a centralized datastore for analytical and tactical queries.',
		image: '/datawarehouse-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/analytical/data-warehouse',
	},
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
		title: 'Retrieval Augmented Generation',
		description: 'LLM function calling directly from Postgres.',
		image: '/rag-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/ai/rag',
	},
	{
		title: 'OLTP',
		description:
			'tuned or handling high volumes of short, atomic transactions that ensure data integrity and concurrency in real-time operational systems.',
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
		title: 'OLAP',
		description:
			'Tuned or handling high volumes of short, atomic transactions that ensure data integrity and concurrency in real-time operational systems.',
		image: '/olap-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/analytical/olap',
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
	{
		title: 'Data Warehouse',
		description:
			'Extract, Transform and Load data from external sources. Build a centralized datastore for analytical and tactical queries.',
		image: '/datawarehouse-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/analytical/data-warehouse',
	},
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
		title: 'Retrieval Augmented Generation',
		description: 'LLM function calling directly from Postgres.',
		image: '/rag-stack-elephant.svg',
		url: 'https://tembo.io/docs/product/stacks/ai/rag',
	},
];

const StackHero = () => {
	const numberOfSquares = 25;
	const squareSize = 300;
	const radius = 1350;

	return (
		<div className='absolute w-full h-[700px] pt-4 flex justify-center items-center bg-transparent overflow-hidden fade-x-md'>
			<div className='relative w-full h-full'>
				<div className='circle-container absolute bottom-[-1020px] right-0 left-0 animate-spin-slow flex justify-center items-center'>
					{STACK_HERO_CARDS_DETAILS.map((stackCard, index) => {
						const angle = (index / numberOfSquares) * 2 * Math.PI;
						const x = radius * Math.cos(angle);
						const y = radius * Math.sin(angle);

						return (
							<a
								className={
									'stack-card absolute w-[300px] h-[350px] border bg-mwasi border-[#FFFFFF0D] rounded-[30px] px-4 pt-4 pb-6 flex flex-col gap-8 z-10 transition-all duration-300 ease-in-out hover:scale-[101.5%]'
								}
								style={{
									transform: `translate(${x}px, ${y}px) rotate(${angle + Math.PI / 2}rad) translate(0, -${squareSize / 2}px)`,
								}}
								href={stackCard.url}
								target='_blank'
								rel='noreferrer'
								key={index}
								data-stack={index}
							>
								<div className='w-[270px] rounded-[28.65px] border-[0.72px] border-[#FFFFFF0D] p-3'>
									<div className='border-dashed border-[#FFFFFF0D] border rounded-[28.65px] relative'>
										<img
											src='/dashed-rectangle.svg'
											alt={'dashed rectangle'}
											className='w-full h-full'
										/>
										<img
											src='/cartesian-grid.svg'
											alt={'cartesian grid'}
											className='w-full h-full absolute m-auto text-center left-0 right-0 top-0'
										/>
										<img
											src={stackCard.image}
											alt={'rag stack elephant'}
											className='absolute m-auto text-center left-0 right-0 top-6'
										/>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<h3 className='font-bold text-base leading-[17.19px] text-white'>
										{stackCard.title}
									</h3>
									<p className='font-normal text-xs leading-[14.52px] font-["Inter"] text-otherGrey'>
										{stackCard.description}
									</p>
								</div>
							</a>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default StackHero;
