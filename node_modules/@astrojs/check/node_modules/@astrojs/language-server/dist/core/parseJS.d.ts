import type { ParseResult } from '@astrojs/compiler/types';
import { VirtualFile } from '@volar/language-core';
import type ts from 'typescript/lib/tsserverlibrary';
import type { HTMLDocument } from 'vscode-html-languageservice';
export declare function extractScriptTags(fileName: string, snapshot: ts.IScriptSnapshot, htmlDocument: HTMLDocument, ast: ParseResult['ast']): VirtualFile[];
