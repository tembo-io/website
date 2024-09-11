import { type FC } from 'react';
import { ClerkProvider, useOrganization, useUser } from '@clerk/clerk-react';
import Button from './Button';

interface Props {
	currentPage: string;
}

const ClerkButton: FC<Props> = ({ currentPage }) => {
	const { isSignedIn } = useUser();
	const { organization } = useOrganization();

	const getButtonStyles = () => {
		if (currentPage.includes('/solutions/transactional')) {
			return 'sqlBlue';
		} else if (currentPage.includes('/solutions/ai')) {
			return 'sqlPink';
		}

		return 'neon';
	};

	return (
		<Button
			variant={getButtonStyles()}
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

const ClerkProviderWithButton: FC<Props> = ({ currentPage }) => {
	return (
		<ClerkProvider
			publishableKey={import.meta.env.PUBLIC_VITE_CLERK_PUBLISHABLE_KEY!}
		>
			<ClerkButton currentPage={currentPage} />
		</ClerkProvider>
	);
};

export default ClerkProviderWithButton;
