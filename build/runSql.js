"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb = __importStar(require("oracledb"));
const Bluebird = require("bluebird");
const Progress_1 = require("./Progress");
var fs = require('fs-extra');
function runScripts(scripts, connection, callbackProgress) {
    var progress = new Progress_1.Progress(scripts.length, callbackProgress);
    progress.start(`running scripts ${scripts.length}`);
    var percent = scripts.length;
    return new Bluebird(function (resolve, reject) {
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
            let tmpScript = scripts.shift();
            let script;
            if (tmpScript == undefined) {
                throw "Error interating array of scripts. It should never be undefined.";
            }
            else {
                script = tmpScript;
            }
            return oraclePromise(script.toString(), connection)
                .then((result) => {
                let report = {
                    script: script,
                    sucess: true,
                    result: result
                };
                results.sucesses.push(report);
                return report;
            })
                .catch((err) => {
                let report = {
                    script: script,
                    sucess: false,
                    result: err
                };
                results.errors.push(report);
                return report;
            }).then((report) => {
                results.executions.push(report);
                progress.run(script.info.file + "-" + script.toString().trim(), report);
                if (scripts.length > 0) {
                    return recursiveExec(scripts);
                }
            });
        }
    });
}
exports.runScripts = runScripts;
function oraclePromise(script, connection) {
    return new Bluebird(function (resolve, reject) {
        if (!script) {
            resolve();
        }
        else {
            oracledb.getConnection(connection)
                .then(function (conn) {
                //block=`BEGIN EXECUTE IMMEDIATE '${script.replace(/'/g,"''")}';END;`
                let block = script;
                return conn.execute(block)
                    .then(function (result) {
                    conn.close().then(e => {
                        resolve(result);
                    });
                })
                    .catch(function (err) {
                    conn.close().then(e => {
                        reject(err);
                    });
                });
            })
                .catch(function (err) {
                reject(err);
            });
        }
    });
}
//# sourceMappingURL=runSql.js.map