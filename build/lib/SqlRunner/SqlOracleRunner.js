"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb = __importStar(require("oracledb"));
const bluebird_1 = __importDefault(require("bluebird"));
const SqlRunner_1 = require("../SqlRunner");
class SqlOracleRunner extends SqlRunner_1.SqlRunner {
    constructor(connection) {
        super(connection);
    }
    get connection() {
        return super._connection;
    }
    run(script) {
        let connection = this.connection;
        return new bluebird_1.default(function (resolve, reject) {
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
}
exports.SqlOracleRunner = SqlOracleRunner;
//# sourceMappingURL=SqlOracleRunner.js.map