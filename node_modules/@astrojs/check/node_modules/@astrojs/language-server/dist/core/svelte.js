"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSvelteLanguageModule = void 0;
const language_core_1 = require("@volar/language-core");
const utils_js_1 = require("./utils.js");
function getSvelteLanguageModule() {
    return {
        createVirtualFile(fileName, snapshot) {
            if (fileName.endsWith('.svelte')) {
                return new SvelteFile(fileName, snapshot);
            }
        },
        updateVirtualFile(svelteFile, snapshot) {
            svelteFile.update(snapshot);
        },
    };
}
exports.getSvelteLanguageModule = getSvelteLanguageModule;
class SvelteFile {
    constructor(sourceFileName, snapshot) {
        this.sourceFileName = sourceFileName;
        this.snapshot = snapshot;
        this.kind = language_core_1.FileKind.TextFile;
        this.capabilities = language_core_1.FileCapabilities.full;
        this.codegenStacks = [];
        this.fileName = sourceFileName;
        this.onSnapshotUpdated();
    }
    update(newSnapshot) {
        this.snapshot = newSnapshot;
        this.onSnapshotUpdated();
    }
    onSnapshotUpdated() {
        this.mappings = [
            {
                sourceRange: [0, this.snapshot.getLength()],
                generatedRange: [0, this.snapshot.getLength()],
                data: language_core_1.FileRangeCapabilities.full,
            },
        ];
        this.embeddedFiles = [];
        this.embeddedFiles.push((0, utils_js_1.framework2tsx)(this.fileName, this.fileName, this.snapshot.getText(0, this.snapshot.getLength()), 'svelte'));
    }
}
//# sourceMappingURL=svelte.js.map