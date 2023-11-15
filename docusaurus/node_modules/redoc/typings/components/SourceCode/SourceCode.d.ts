/// <reference types="react" />
export interface SourceCodeProps {
    source: string;
    lang: string;
}
export declare const SourceCode: (props: SourceCodeProps) => JSX.Element;
export declare const SourceCodeWithCopy: (props: SourceCodeProps) => JSX.Element;
