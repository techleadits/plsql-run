"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Progress {
    constructor(total, callback) {
        this._total = total;
        if (callback)
            this._callback = callback;
        else
            this._callback = function () {
            };
        this._runnedCount = 0;
    }
    get total() {
        return this._total;
    }
    get runnedCount() {
        return this._runnedCount;
    }
    get callback() {
        return this._callback;
    }
    start(message, data) {
        this._runnedCount = 0;
        this._callback(ProgresState.started, this.progressPercent(), message, data);
    }
    run(message, data) {
        if (this._runnedCount == this._total) {
            this.finish(message, data);
        }
        else {
            this._runnedCount++;
            this._callback(ProgresState.running, this.progressPercent(), message, data);
        }
    }
    finish(message, data) {
        this._runnedCount = this._total;
        this._callback(ProgresState.finished, this.progressPercent(), message, data);
    }
    progressPercent() {
        return (100 * this._runnedCount) / this._total;
    }
}
exports.Progress = Progress;
var ProgresState;
(function (ProgresState) {
    ProgresState[ProgresState["started"] = 0] = "started";
    ProgresState[ProgresState["running"] = 1] = "running";
    ProgresState[ProgresState["finished"] = 2] = "finished";
})(ProgresState = exports.ProgresState || (exports.ProgresState = {}));
//# sourceMappingURL=Progress.js.map