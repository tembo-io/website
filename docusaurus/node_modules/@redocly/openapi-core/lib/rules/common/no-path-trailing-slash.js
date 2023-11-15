"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoPathTrailingSlash = void 0;
const NoPathTrailingSlash = () => {
    return {
        PathItem(_path, { report, key, location }) {
            if (key.endsWith('/') && key !== '/') {
                report({
                    message: `\`${key}\` should not have a trailing slash.`,
                    location: location.key(),
                });
            }
        },
    };
};
exports.NoPathTrailingSlash = NoPathTrailingSlash;
