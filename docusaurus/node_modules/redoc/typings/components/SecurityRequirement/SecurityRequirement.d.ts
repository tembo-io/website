/// <reference types="react" />
import { SecurityRequirementModel } from '../../services/models/SecurityRequirement';
export interface SecurityRequirementsProps {
    securities: SecurityRequirementModel[];
}
export declare function SecurityRequirements(props: SecurityRequirementsProps): JSX.Element | null;
