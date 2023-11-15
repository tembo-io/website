import { FileCapabilities, FileKind, FileRangeCapabilities, Language, VirtualFile } from '@volar/language-core';
import type { Mapping } from '@volar/source-map';
import type ts from 'typescript/lib/tsserverlibrary';
export declare function getVueLanguageModule(): Language<VueFile>;
declare class VueFile implements VirtualFile {
    sourceFileName: string;
    snapshot: ts.IScriptSnapshot;
    kind: FileKind;
    capabilities: FileCapabilities;
    fileName: string;
    mappings: Mapping<FileRangeCapabilities>[];
    embeddedFiles: VirtualFile[];
    codegenStacks: never[];
    constructor(sourceFileName: string, snapshot: ts.IScriptSnapshot);
    update(newSnapshot: ts.IScriptSnapshot): void;
    private onSnapshotUpdated;
}
export {};
