import { LoadOptions, DumpOptions } from 'js-yaml';
export declare const parseYaml: (str: string, opts?: LoadOptions | undefined) => unknown;
export declare const stringifyYaml: (obj: any, opts?: DumpOptions | undefined) => string;
