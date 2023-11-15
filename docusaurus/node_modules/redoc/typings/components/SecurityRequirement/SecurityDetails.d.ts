/// <reference types="react" />
import { SecuritySchemeModel } from '../../services';
interface SecuritySchemaProps {
    RequiredScopes?: JSX.Element;
    scheme: SecuritySchemeModel;
}
export declare function SecurityDetails(props: SecuritySchemaProps): JSX.Element;
export {};
