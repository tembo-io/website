import React, { useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import { toast } from 'sonner';
import CountrySelect from '@components/CountrySelect';

const BootcampForm: React.FC = () => {
	const firstNameRef = useRef<HTMLInputElement | null>(null);
	const lastNameRef = useRef<HTMLInputElement | null>(null);
	const emailRef = useRef<HTMLInputElement | null>(null);
	const companyRef = useRef<HTMLInputElement | null>(null);
	const countryRef = useRef<HTMLSelectElement | null>(null);
	const dateRef = useRef<HTMLInputElement | null>(null);
	const optinRef = useRef<HTMLInputElement | null>(null);

	const onSubmit = useCallback(
		async (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
			e.preventDefault();

			if (
				!firstNameRef.current?.value ||
				!lastNameRef.current?.value ||
				!emailRef.current?.value ||
				!companyRef.current?.value ||
				!countryRef.current?.value ||
				!dateRef.current?.value ||
				!optinRef.current?.value
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
						name: 'country',
						value: countryRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'message',
						value: dateRef.current?.value,
					},
					{
						objectTypeId: '0-1',
						name: 'stayinformed',
						value: optinRef.current?.value,
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
					pageUri: 'https://www.tembo.io/bootcamp',
					pageName: 'Tembo Bootcamp',
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
			if (emailRef.current) emailRef.current.value = '';
			if (companyRef.current) companyRef.current.value = '';
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
		<div className='flex flex-col md:gap-12 mx-[100px]'>
			<h2
				className='text-neon
			font-primary
			font-semibold
			md:text-5xl
			text-[32px]
			'
			>
				Schedule a Tembo Bootcamp
			</h2>
			<form className='flex flex-col gap-4'>
				<input
					placeholder='First Name*'
					name='firstName'
					ref={firstNameRef}
					type='text'
					className='min-[840px]:w-[412px] rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 w-full z-10 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
				/>
				<input
					placeholder='Last Name*'
					name='lastName'
					ref={lastNameRef}
					type='text'
					className='min-[840px]:w-[412px] rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 w-full z-10 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
				/>
				<input
					placeholder='Work email*'
					type='email'
					name='email'
					ref={emailRef}
					className='min-[840px]:w-[412px] rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 w-full z-10 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
				/>
				<input
					placeholder='Company*'
					type='text'
					name='company'
					ref={companyRef}
					className='min-[840px]:w-[412px] rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 w-full z-10 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-white'
				/>
				<CountrySelect ref={countryRef} />
				<div className='relative'>
					<input
						ref={dateRef}
						type='date'
						onFocus={handleFocus}
						onBlur={handleBlur}
						onChange={(e) => setHasValue(!!e.target.value)}
						className={cx(
							'min-[840px]:w-[412px] rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 w-full z-10 focus:border-white focus:outline-none placeholder:text-ghostWhite md:text-base text-xs text-transparent',
							!hasValue ? 'text-transparent' : 'text-white',
						)}
					/>
					{!hasValue && (
						<span className='absolute left-3 top-1/2 transform -translate-y-1/2 p-2 text-ghostWhite pointer-events-none transition-opacity duration-200'>
							Select a date
						</span>
					)}
				</div>

				<div className='flex flex-row gap-2'>
					<input
						ref={optinRef}
						type='checkbox'
						id='bootcampOptin'
						className='flex justify-start items-start rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey z-10 focus:border-white focus:outline-none text-ghostWhite md:text-base text-xs text-white'
					/>
					<label htmlFor='bootcampOptin'>
						Opt In for Bootcamp Updates
					</label>
				</div>

				<input
					type='submit'
					className='flex h-14 min-[840px]:w-[412px] justify-center items-center w-full bg-gradient-button text-white transition-all duration-150 ease-in font-medium rounded-full font-secondary text-base cursor-pointer text-white'
					onClick={(e) => onSubmit(e)}
				/>
			</form>
		</div>
	);
};

export default BootcampForm;
