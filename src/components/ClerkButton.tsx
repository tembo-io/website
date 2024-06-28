import { useUser } from '@clerk/clerk-react';
import Button from './Button';

const ClerkButton = () => {
	const { isSignedIn } = useUser();
	return (
		<Button
			variant='neon'
			styles='z-100'
			isLinkTag={true}
			link={
				isSignedIn
					? 'https://cloud.tembo.io/'
					: 'https://cloud.tembo.io/sign-up'
			}
		>
			{isSignedIn ? 'Dashboard' : 'Try Free'}
		</Button>
	);
};

export default ClerkButton;
