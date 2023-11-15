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
exports.collectClassesAndIdsFromDocument = exports.extractStylesheets = void 0;
const utils_1 = require("@astrojs/compiler/utils");
const language_core_1 = require("@volar/language-core");
const SourceMap = __importStar(require("@volar/source-map"));
const muggle = __importStar(require("muggle-string"));
function extractStylesheets(fileName, snapshot, htmlDocument, ast) {
    const embeddedCSSFiles = findEmbeddedStyles(fileName, snapshot, htmlDocument.roots);
    const inlineStyles = findInlineStyles(ast);
    if (inlineStyles.length > 0) {
        const codes = [];
        for (const inlineStyle of inlineStyles) {
            codes.push('x { ');
            codes.push([
                inlineStyle.value,
                undefined,
                inlineStyle.position.start.offset + 'style="'.length,
                language_core_1.FileRangeCapabilities.full,
            ]);
            codes.push(' }\n');
        }
        const mappings = SourceMap.buildMappings(codes);
        const text = muggle.toString(codes);
        embeddedCSSFiles.push({
            fileName: fileName + '.inline.css',
            codegenStacks: [],
            snapshot: {
                getText: (start, end) => text.substring(start, end),
                getLength: () => text.length,
                getChangeRange: () => undefined,
            },
            capabilities: { documentSymbol: true },
            embeddedFiles: [],
            kind: language_core_1.FileKind.TextFile,
            mappings,
        });
    }
    return embeddedCSSFiles;
}
exports.extractStylesheets = extractStylesheets;
/**
 * Find all embedded styles in a document.
 * Embedded styles are styles that are defined in `<style>` tags.
 */
function findEmbeddedStyles(fileName, snapshot, roots) {
    const embeddedCSSFiles = [];
    let cssIndex = 0;
    getEmbeddedCSSInNodes(roots);
    function getEmbeddedCSSInNodes(nodes) {
        for (const [_, node] of nodes.entries()) {
            if (node.tag === 'style' &&
                node.startTagEnd !== undefined &&
                node.endTagStart !== undefined) {
                const styleText = snapshot.getText(node.startTagEnd, node.endTagStart);
                embeddedCSSFiles.push({
                    fileName: fileName + `.${cssIndex}.css`,
                    kind: language_core_1.FileKind.TextFile,
                    snapshot: {
                        getText: (start, end) => styleText.substring(start, end),
                        getLength: () => styleText.length,
                        getChangeRange: () => undefined,
                    },
                    codegenStacks: [],
                    mappings: [
                        {
                            sourceRange: [node.startTagEnd, node.endTagStart],
                            generatedRange: [0, styleText.length],
                            data: language_core_1.FileRangeCapabilities.full,
                        },
                    ],
                    capabilities: {
                        diagnostic: false,
                        documentSymbol: true,
                        foldingRange: true,
                        documentFormatting: false,
                    },
                    embeddedFiles: [],
                });
                cssIndex++;
            }
            if (node.children)
                getEmbeddedCSSInNodes(node.children);
        }
    }
    return embeddedCSSFiles;
}
/**
 * Find all inline styles using the Astro AST
 * Inline styles are styles that are defined in the `style` attribute of an element.
 * TODO: Merge this with `findEmbeddedCSS`? Unlike scripts, there's no scoping being done here, so merging all of it in
 * the same virtual file is possible, though it might make mapping more tricky.
 */
function findInlineStyles(ast) {
    const styleAttrs = [];
    // `@astrojs/compiler`'s `walk` method is async, so we can't use it here. Arf
    function walkDown(parent) {
        if (!parent.children)
            return;
        parent.children.forEach((child) => {
            if (utils_1.is.element(child)) {
                const styleAttribute = child.attributes.find((attr) => attr.name === 'style' && attr.kind === 'quoted');
                if (styleAttribute && styleAttribute.position) {
                    styleAttrs.push(styleAttribute);
                }
            }
            if (utils_1.is.parent(child)) {
                walkDown(child);
            }
        });
    }
    walkDown(ast);
    return styleAttrs;
}
// TODO: Provide completion for classes and IDs
function collectClassesAndIdsFromDocument(ast) {
    const classesAndIds = [];
    function walkDown(parent) {
        if (!parent.children)
            return;
        parent.children.forEach((child) => {
            if (utils_1.is.element(child)) {
                const classOrIDAttributes = child.attributes
                    .filter((attr) => attr.kind === 'quoted' && (attr.name === 'class' || attr.name === 'id'))
                    .flatMap((attr) => attr.value.split(' '));
                classesAndIds.push(...classOrIDAttributes);
            }
            if (utils_1.is.parent(child)) {
                walkDown(child);
            }
        });
    }
    walkDown(ast);
    return classesAndIds;
}
exports.collectClassesAndIdsFromDocument = collectClassesAndIdsFromDocument;
//# sourceMappingURL=parseCSS.js.map