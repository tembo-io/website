"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAPIMajor = exports.detectOpenAPI = exports.OasMajorVersion = exports.OasVersion = void 0;
var OasVersion;
(function (OasVersion) {
    OasVersion["Version2"] = "oas2";
    OasVersion["Version3_0"] = "oas3_0";
    OasVersion["Version3_1"] = "oas3_1";
})(OasVersion = exports.OasVersion || (exports.OasVersion = {}));
var OasMajorVersion;
(function (OasMajorVersion) {
    OasMajorVersion["Version2"] = "oas2";
    OasMajorVersion["Version3"] = "oas3";
})(OasMajorVersion = exports.OasMajorVersion || (exports.OasMajorVersion = {}));
function detectOpenAPI(root) {
    if (typeof root !== 'object') {
        throw new Error(`Document must be JSON object, got ${typeof root}`);
    }
    if (!(root.openapi || root.swagger)) {
        throw new Error('This doesn’t look like an OpenAPI document.\n');
    }
    if (root.openapi && typeof root.openapi !== 'string') {
        throw new Error(`Invalid OpenAPI version: should be a string but got "${typeof root.openapi}"`);
    }
    if (root.openapi && root.openapi.startsWith('3.0')) {
        return OasVersion.Version3_0;
    }
    if (root.openapi && root.openapi.startsWith('3.1')) {
        return OasVersion.Version3_1;
    }
    if (root.swagger && root.swagger === '2.0') {
        return OasVersion.Version2;
    }
    throw new Error(`Unsupported OpenAPI Version: ${root.openapi || root.swagger}`);
}
exports.detectOpenAPI = detectOpenAPI;
function openAPIMajor(version) {
    if (version === OasVersion.Version2) {
        return OasMajorVersion.Version2;
    }
    else {
        return OasMajorVersion.Version3;
    }
}
exports.openAPIMajor = openAPIMajor;
