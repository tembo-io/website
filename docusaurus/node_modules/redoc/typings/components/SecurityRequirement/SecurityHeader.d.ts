/// <reference types="react" />
import { SecurityRequirementModel } from '../../services/models/SecurityRequirement';
export interface SecurityRequirementProps {
    security: SecurityRequirementModel;
    showSecuritySchemeType?: boolean;
    expanded: boolean;
}
export declare function SecurityHeader(props: SecurityRequirementProps): JSX.Element;
