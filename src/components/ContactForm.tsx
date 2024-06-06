import React, { useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import toast, { Toaster } from 'react-hot-toast';

const ContactForm: React.FC = () => {
	const firstNameRef = useRef<HTMLInputElement | null>(null);
	const lastNameRef = useRef<HTMLInputElement | null>(null);
	const emailRef = useRef<HTMLInputElement | null>(null);
	const companyRef = useRef<HTMLInputElement | null>(null);
	const messageRef = useRef<HTMLTextAreaElement | null>(null);

	const onSubmit = useCallback(
		async (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
			e.preventDefault();

			if (
				!firstNameRef.current?.value ||
				!lastNameRef.current?.value ||
				!emailRef.current?.value ||
				!companyRef.current?.value ||
				!messageRef.current?.value
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
						name: 'message',
						value: messageRef.current?.value,
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
					pageUri: 'https://www.tembo.io/contact',
					pageName: 'Tembo Contact Us',
				},
			};

			const hubspotFormPromise = fetch(
				'https://api.hsforms.com/submissions/v3/integration/submit/23590420/c4191f14-4c89-464a-96d8-8221ba575d8f',
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
			if (messageRef.current) messageRef.current.value = '';
		},
		[],
	);
	return (
		<div className='flex flex-col gap-12'>
			<h2
				className='text-neon
			font-primary
			font-semibold
			text-5xl'
			>
				Contact us
			</h2>
			<form className='flex flex-col gap-6'>
				<input
					placeholder='First Name'
					name='firstName'
					ref={firstNameRef}
					type='text'
					className='min-[840px]:w-[412px] rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 w-full'
				/>
				<input
					placeholder='Last Name'
					name='lastName'
					ref={lastNameRef}
					type='text'
					className='min-[840px]:w-[412px] rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 w-full'
				/>
				<input
					placeholder='Company email'
					type='email'
					name='email'
					ref={emailRef}
					className='min-[840px]:w-[412px] rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 w-full'
				/>
				<input
					placeholder='Company'
					type='text'
					name='company'
					ref={companyRef}
					className='min-[840px]:w-[412px] rounded-full border-[1px] p-4 bg-mwasi border-whiteGrey h-14 w-full'
				/>
				<textarea
					placeholder='Describe your Postgres usage and use case for Tembo Cloud or Tembo Self Hosted'
					className='min-[840px]:w-[412px] rounded-3xl border-[1px] p-4 bg-mwasi border-whiteGrey h-40 w-full'
					name='message'
					ref={messageRef}
				></textarea>
				<input
					type='submit'
					className='flex h-14 min-[840px]:w-[412px] justify-center items-center w-full bg-gradient-button text-white transition-all duration-150 ease-in font-medium rounded-full font-secondary text-base cursor-pointer'
					onClick={(e) => onSubmit(e)}
				/>
			</form>
		</div>
	);
};

export default ContactForm;
