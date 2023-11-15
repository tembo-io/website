import { Oas3Rule, Oas3Preprocessor, Oas2Rule, Oas2Preprocessor } from './visitors';
export declare type RuleSet<T> = Record<string, T>;
export declare enum OasVersion {
    Version2 = "oas2",
    Version3_0 = "oas3_0",
    Version3_1 = "oas3_1"
}
export declare enum OasMajorVersion {
    Version2 = "oas2",
    Version3 = "oas3"
}
export declare type Oas3RuleSet = Record<string, Oas3Rule>;
export declare type Oas2RuleSet = Record<string, Oas2Rule>;
export declare type Oas3PreprocessorsSet = Record<string, Oas3Preprocessor>;
export declare type Oas2PreprocessorsSet = Record<string, Oas2Preprocessor>;
export declare type Oas3DecoratorsSet = Record<string, Oas3Preprocessor>;
export declare type Oas2DecoratorsSet = Record<string, Oas2Preprocessor>;
export declare function detectOpenAPI(root: any): OasVersion;
export declare function openAPIMajor(version: OasVersion): OasMajorVersion;
