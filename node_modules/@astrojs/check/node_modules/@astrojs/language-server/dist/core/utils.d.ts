import { type VirtualFile } from '@volar/language-core';
export declare function framework2tsx(fileName: string, filePath: string, sourceCode: string, framework: 'vue' | 'svelte'): VirtualFile;
export declare function classNameFromFilename(filename: string): string;
export declare function patchTSX(code: string, fileName: string): string;
