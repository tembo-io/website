import { useOrganization, useUser } from '@clerk/clerk-react';
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
					: 'https://cloud.tembo.io'
			}
		>
			{isSignedIn ? 'Dashboard' : 'Try Free'}
		</Button>
	);
};

export default ClerkButton;
