import React, { useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import { toast } from 'sonner';
import CountrySelect from '@components/CountrySelect';

const BuildcampForm: React.FC = () => {
	const [selectedCountry, setSelectedCountry] = useState('');
	const firstNameRef = useRef<HTMLInputElement | null>(null);
	const lastNameRef = useRef<HTMLInputElement | null>(null);
	const jobTitleRef = useRef<HTMLInputElement | null>(null);
	const emailRef = useRef<HTMLInputElement | null>(null);
	const companyRef = useRef<HTMLInputElement | null>(null);
	const cityRef = useRef<HTMLInputElement | null>(null);
	const countryRef = useRef<HTMLSelectElement | null>(null);
	const dateRef = useRef<HTMLInputElement | null>(null);
	const useCaseRef = useRef<HTMLTextAreaElement | null>(null);

	const onSubmit = useCallback(
		async (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
			e.preventDefault();

			if (
				!firstNameRef.current?.value ||
				!lastNameRef.current?.value ||
				!jobTitleRef.current?.value ||
				!emailRef.current?.value ||
				!cityRef.current?.value ||
				!companyRef.current?.value ||
				!countryRef.current?.value ||
				!dateRef.current?.value ||
				!useCaseRef.current?.value
			) {
				toast.error('Please fill in all fields');
				return;
			}

			const referrer = localStorage.getItem('referrer');
			const utmCampaign = localStorage.getItem('utm_campaign');
			const utmContent = localStorage.getItem('utm_content');
			const utmId = localStorage.getItem('utm_id');
			const utmMedium = localStorage.getItem('utm_medium');
			const utmSource = localStorage.getItem('utm_source');
			const utmTerm = localStorage.getItem('utm_term');
			const hubspotId = localStorage.getItem('hubspotutk');

			const hubspotRequestBody = {
				fields: [
					{
						objectTypeId: '0-1',
						name: 'first_name',
						value: firstNameRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'last_name',
						value: lastNameRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'jobtitle',
						value: jobTitleRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'email',
						value: emailRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'company',
						value: companyRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'city',
						value: cityRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'country',
						value: countryRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'buildcamp_preferred_dates',
						value: dateRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'buildcamp_use_case',
						value: useCaseRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'referrer',
						value: referrer || '',
					},
					{
						objectTypeId: '0-1',
						name: 'utm_campaign',
						value: utmCampaign || '',
					},
					{
						objectTypeId: '0-1',
						name: 'utm_content',
						value: utmContent || '',
					},
					{
						objectTypeId: '0-1',
						name: 'utm_id',
						value: utmId || '',
					},
					{
						objectTypeId: '0-1',
						name: 'utm_medium',
						value: utmMedium || '',
					},
					{
						objectTypeId: '0-1',
						name: 'utm_source',
						value: utmSource || '',
					},
					{
						objectTypeId: '0-1',
						name: 'utm_term',
						value: utmTerm || '',
					},
				],
				context: {
					hutk: hubspotId,
					pageUri: 'https://www.tembo.io/buildcamp',
					pageName: 'Tembo Buildcamp',
				},
			};

			const hubspotFormPromise = fetch(
				'https://api.hsforms.com/submissions/v3/integration/submit/23590420/c2234c84-0d20-4d2c-97d7-3cd772b1b9d9',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(hubspotRequestBody),
				},
			);
			toast.promise(hubspotFormPromise, {
				error: 'There was an error submitting the form. Please try again later.',
				loading: 'Submitting form...',
				success:
					'Thank you for your interest in Tembo! We will be in touch shortly.',
			});

			// reset all form fields
			if (firstNameRef.current) firstNameRef.current.value = '';
			if (lastNameRef.current) lastNameRef.current.value = '';
			if (jobTitleRef.current) jobTitleRef.current.value = '';
			if (emailRef.current) emailRef.current.value = '';
			if (companyRef.current) companyRef.current.value = '';
			if (cityRef.current) cityRef.current.value = '';
			if (countryRef.current) setSelectedCountry('');
			if (dateRef.current) setHasValue(false);
			if (useCaseRef.current) useCaseRef.current.value = '';
		},
		[],
	);

	const [hasValue, setHasValue] = useState(false); // State to track if the date input has a value

	const handleFocus = () => {
		setHasValue(true);
	};

	const handleBlur = (e: any) => {
		if (!e.target.value) {
			setHasValue(false); // Only hide placeholder if there's no value
		}
	};

	return (
		<div className='flex flex-col w-full lg:w-2/3 justify-center items-center'>
			<h2 className='text-neon font-primary font-semibold md:text-5xl text-[32px] pb-12'>
				Schedule a Buildcamp
			</h2>
			<form id='buildcampForm' className='w-full'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-full'>
					<input
						placeholder='First Name*'
						name='firstName'
						ref={firstNameRef}
						type='text'
						className='w-full rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
					/>
					<input
						placeholder='Last Name*'
						name='lastName'
						ref={lastNameRef}
						type='text'
						className='w-full rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
					/>
					<input
						placeholder='Job Title*'
						type='text'
						name='jobTitle'
						ref={jobTitleRef}
						className='w-full rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
					/>
					<input
						placeholder='Work Email*'
						type='email'
						name='email'
						ref={emailRef}
						className='w-full rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
					/>
					<input
						placeholder='Company*'
						type='text'
						name='company'
						ref={companyRef}
						className='w-full rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
					/>
					<input
						placeholder='City*'
						type='text'
						name='city'
						ref={cityRef}
						className='w-full rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
					/>
					<CountrySelect
						ref={countryRef}
						selectedCountry={selectedCountry}
						setSelectedCountry={setSelectedCountry}
					/>
					<div className='relative w-full'>
						<input
							ref={dateRef}
							type='date'
							onFocus={handleFocus}
							onBlur={handleBlur}
							onChange={(e) => setHasValue(!!e.target.value)}
							className={cx(
								'w-full rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-transparent appearance-none',
								!hasValue ? 'text-transparent' : 'text-white',
							)}
						/>
						{!hasValue && (
							<span className='absolute left-3 top-1/2 transform -translate-y-1/2 p-2 text-ghostWhite md:text-base text-xs pointer-events-none transition-opacity duration-200'>
								Preferred Buildcamp Date*
							</span>
						)}
					</div>
					<textarea
						ref={useCaseRef}
						placeholder='Please provide a brief description on the specific use case you would like to work on during the Buildcamp.*'
						className='w-full rounded-3xl border-[1px] p-4 bg-mwasi border-whiteGrey h-40 z-10 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
					/>
				</div>
			</form>
			<input
				type='submit'
				className='flex h-14 justify-center items-center w-full lg:w-[412px] bg-gradient-button text-white transition-all duration-150 ease-in font-medium rounded-full font-secondary text-base cursor-pointer text-white mt-4'
				onClick={(e) => onSubmit(e)}
			/>
		</div>
	);
};

export default BuildcampForm;
