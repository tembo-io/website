import { ClerkProvider, useOrganization, useUser } from '@clerk/clerk-react';
import Button from './Button';

const ClerkButton = () => {
	const { isSignedIn } = useUser();
	const { organization } = useOrganization();

	return (
		<Button
			variant='neon'
			styles='z-100'
			isLinkTag={true}
			link={
				organization?.id
					? `https://cloud.tembo.io/orgs/${organization.id}/clusters`
					: 'https://cloud.tembo.io/sign-up'
			}
		>
			{isSignedIn ? 'Dashboard' : 'Try Free'}
		</Button>
	);
};

const ClerkProviderWithButton = () => {
	return (
		<ClerkProvider
			publishableKey={import.meta.env.PUBLIC_VITE_CLERK_PUBLISHABLE_KEY!}
		>
			<ClerkButton />
		</ClerkProvider>
	);
};

export default ClerkProviderWithButton;
