"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoServerExample = void 0;
const NoServerExample = () => {
    return {
        Server(server, { report, location }) {
            if (['example.com', 'localhost'].indexOf(server.url) !== -1) {
                report({
                    message: 'Server `url` should not point at example.com.',
                    location: location.child(['url']),
                });
            }
        },
    };
};
exports.NoServerExample = NoServerExample;
