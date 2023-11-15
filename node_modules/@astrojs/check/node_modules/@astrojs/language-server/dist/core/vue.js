"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVueLanguageModule = void 0;
const language_core_1 = require("@volar/language-core");
const utils_js_1 = require("./utils.js");
function getVueLanguageModule() {
    return {
        createVirtualFile(fileName, snapshot) {
            if (fileName.endsWith('.vue')) {
                return new VueFile(fileName, snapshot);
            }
        },
        updateVirtualFile(vueFile, snapshot) {
            vueFile.update(snapshot);
        },
    };
}
exports.getVueLanguageModule = getVueLanguageModule;
class VueFile {
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
        this.embeddedFiles.push((0, utils_js_1.framework2tsx)(this.fileName, this.fileName, this.snapshot.getText(0, this.snapshot.getLength()), 'vue'));
    }
}
//# sourceMappingURL=vue.js.map