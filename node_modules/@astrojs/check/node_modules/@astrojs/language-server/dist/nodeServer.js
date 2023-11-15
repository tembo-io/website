"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@volar/language-server/node");
const languageServerPlugin_js_1 = require("./languageServerPlugin.js");
(0, node_1.startLanguageServer)((0, node_1.createConnection)(), languageServerPlugin_js_1.plugin);
//# sourceMappingURL=nodeServer.js.map