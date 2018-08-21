"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const Progress_1 = require("./Progress");
const readAndParse_1 = require("./readAndParse");
var fs = require('fs-extra');
class SqlRunner {
    constructor(connection) {
        this._connection = connection;
    }
    runFilesInternal(filesInfo, callbackProgress) {
        let files;
        let promise;
        if (!Array.isArray(filesInfo)) {
            promise = readAndParse_1.readFile(filesInfo);
        }
        else {
            promise = readAndParse_1.readFiles(filesInfo);
        }
        return promise.then(scripts => {
            if (Array.isArray(scripts))
                return readAndParse_1.parseScripts(scripts, callbackProgress);
            else
                return readAndParse_1.parseScript(scripts);
        });
    }
    allToSqlScriptArray(sqlScripts) {
        if (!Array.isArray(sqlScripts)) {
            return [sqlScripts];
        }
        else {
            return sqlScripts;
        }
    }
    runSqlsPromise(scripts) {
        let tmpScript = scripts.shift();
        let script;
        if (tmpScript == undefined) {
            throw "Error interating array of scripts. It should never be undefined.";
        }
        else {
            script = tmpScript;
        }
        return this.run(script.toString())
            .then((result) => {
            let report = {
                script: script,
                sucess: true,
                result: result
            };
            return report;
        })
            .catch((err) => {
            let report = {
                script: script,
                sucess: false,
                result: err
            };
            return report;
        });
    }
    runFiles(filesInfo, callbackProgress) {
        return this.runFilesInternal(filesInfo, callbackProgress).then(data => {
            return this.runSqls(data, callbackProgress);
        });
    }
    runSqls(sqlScripts, callbackProgress) {
        let scripts = this.allToSqlScriptArray(sqlScripts);
        var progress = new Progress_1.Progress(scripts.length, callbackProgress);
        progress.start(`running scripts ${scripts.length}`);
        var promises = [];
        while (scripts.length > 0) {
            promises.push(this.runSqlsPromise(scripts).then(report => {
                progress.run(report.script.info.file + "-" + report.script.toString().trim(), report);
                return report;
            }));
        }
        return bluebird_1.default.all(promises).then(report => {
            progress.finish("scripts executados", report);
            return report;
        });
    }
    runFilesOrdered(filesInfo, callbackProgress) {
        return this.runFilesInternal(filesInfo, callbackProgress).then(data => {
            return this.runSqlsOrdered(data, callbackProgress);
        });
    }
    runSqlsOrdered(sqlScripts, callbackProgress) {
        let scripts = this.allToSqlScriptArray(sqlScripts);
        var progress = new Progress_1.Progress(scripts.length, callbackProgress);
        let context = this;
        progress.start(`running scripts ${scripts.length}`);
        var percent = scripts.length;
        return new bluebird_1.default(function (resolve, reject) {
            var results = {
                executions: [],
                sucesses: [],
                errors: []
            };
            recursiveExec(scripts).then((end) => {
                progress.finish("scripts executados", true);
                resolve(results);
            }).catch((err) => {
                progress.finish(err, false);
                reject(err);
            });
            function recursiveExec(scripts) {
                return context.runSqlsPromise(scripts).then((report) => {
                    results.executions.push(report);
                    progress.run(report.script.info.file + "-" + report.script.toString().trim(), report);
                    if (scripts.length > 0) {
                        return recursiveExec(scripts);
                    }
                });
            }
        });
    }
}
exports.SqlRunner = SqlRunner;
//# sourceMappingURL=SqlRunner.js.map