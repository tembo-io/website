import { VirtualFile } from '@volar/language-core';
import type ts from 'typescript/lib/tsserverlibrary';
import * as html from 'vscode-html-languageservice';
export declare function parseHTML(fileName: string, snapshot: ts.IScriptSnapshot, frontmatterEnd: number): {
    virtualFile: VirtualFile;
    htmlDocument: html.HTMLDocument;
};
/**
 * scan the text and remove any `>` or `<` that cause the tag to end short
 */
export declare function preprocessHTML(text: string, frontmatterEnd?: number): string;
