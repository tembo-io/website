"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAsObservableSource = void 0;
var utils_1 = require("./utils/utils");
var mobx_1 = require("mobx");
var react_1 = require("react");
function useAsObservableSource(current) {
    if ("production" !== process.env.NODE_ENV)
        (0, utils_1.useDeprecated)("[mobx-react-lite] 'useAsObservableSource' is deprecated, please store the values directly in an observable, for example by using 'useLocalObservable', and sync future updates using 'useEffect' when needed. See the README for examples.");
    var _a = __read((0, react_1.useState)(function () { return (0, mobx_1.observable)(current, {}, { deep: false }); }), 1), res = _a[0];
    (0, mobx_1.runInAction)(function () {
        Object.assign(res, current);
    });
    return res;
}
exports.useAsObservableSource = useAsObservableSource;
//# sourceMappingURL=useAsObservableSource.js.map