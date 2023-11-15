"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchTSX = exports.classNameFromFilename = exports.framework2tsx = void 0;
const language_core_1 = require("@volar/language-core");
const path = __importStar(require("node:path"));
const vscode_uri_1 = require("vscode-uri");
const importPackage_1 = require("../importPackage");
function framework2tsx(fileName, filePath, sourceCode, framework) {
    const integrationEditorEntrypoint = framework === 'vue' ? (0, importPackage_1.importVueIntegration)(filePath) : (0, importPackage_1.importSvelteIntegration)(filePath);
    if (!integrationEditorEntrypoint) {
        const EMPTY_FILE = '';
        return getVirtualFile(EMPTY_FILE);
    }
    const className = classNameFromFilename(filePath);
    const tsx = patchTSX(integrationEditorEntrypoint.toTSX(sourceCode, className), fileName);
    return getVirtualFile(tsx);
    function getVirtualFile(content) {
        return {
            fileName: fileName + '.tsx',
            capabilities: language_core_1.FileCapabilities.full,
            kind: language_core_1.FileKind.TypeScriptHostFile,
            snapshot: {
                getText: (start, end) => content.substring(start, end),
                getLength: () => content.length,
                getChangeRange: () => undefined,
            },
            codegenStacks: [],
            mappings: [
                {
                    sourceRange: [0, content.length],
                    generatedRange: [0, 0],
                    data: language_core_1.FileRangeCapabilities.full,
                },
            ],
            embeddedFiles: [],
        };
    }
}
exports.framework2tsx = framework2tsx;
/**
 * Transform a string into PascalCase
 */
function toPascalCase(string) {
    return `${string}`
        .replace(new RegExp(/[-_]+/, 'g'), ' ')
        .replace(new RegExp(/[^\w\s]/, 'g'), '')
        .replace(new RegExp(/\s+(.)(\w*)/, 'g'), ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`)
        .replace(new RegExp(/\w/), (s) => s.toUpperCase());
}
function classNameFromFilename(filename) {
    const url = vscode_uri_1.URI.parse(filename);
    const withoutExtensions = vscode_uri_1.Utils.basename(url).slice(0, -vscode_uri_1.Utils.extname(url).length);
    const withoutInvalidCharacters = withoutExtensions
        .split('')
        // Although "-" is invalid, we leave it in, pascal-case-handling will throw it out later
        .filter((char) => /[A-Za-z$_\d-]/.test(char))
        .join('');
    const firstValidCharIdx = withoutInvalidCharacters
        .split('')
        // Although _ and $ are valid first characters for classes, they are invalid first characters
        // for tag names. For a better import autocompletion experience, we therefore throw them out.
        .findIndex((char) => /[A-Za-z]/.test(char));
    const withoutLeadingInvalidCharacters = withoutInvalidCharacters.substring(firstValidCharIdx);
    const inPascalCase = toPascalCase(withoutLeadingInvalidCharacters);
    const finalName = firstValidCharIdx === -1 ? `A${inPascalCase}` : inPascalCase;
    return finalName;
}
exports.classNameFromFilename = classNameFromFilename;
// TODO: Patch the upstream packages with these changes
function patchTSX(code, fileName) {
    const basename = path.basename(fileName, path.extname(fileName));
    const isDynamic = basename.startsWith('[') && basename.endsWith(']');
    return code.replace(/\b(\S*)__AstroComponent_/gm, (fullMatch, m1) => {
        // If we don't have a match here, it usually means the file has a weird name that couldn't be expressed with valid identifier characters
        if (!m1) {
            if (basename === '404')
                return 'FourOhFour';
            return fullMatch;
        }
        return isDynamic ? `_${m1}_` : m1[0].toUpperCase() + m1.slice(1);
    });
}
exports.patchTSX = patchTSX;
//# sourceMappingURL=utils.js.map