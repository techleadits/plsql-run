"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const configurationService = __importStar(require("./configuration"));
const Promise = require("bluebird");
function readFiles(files) {
    var promisses = [];
    while (files && files.length > 0) {
        let fileConfig = files.shift();
        if (fileConfig && fileConfig.file) {
            //promisses.push(readFile(fileConfig));
        }
    }
    return Promise.all(promisses);
}
exports.readFiles = readFiles;
function readFile(fileConfig) {
    let encoding = configurationService.get().encoding;
    return fse.readFile(fileConfig.file, { encoding: encoding })
        .then((data) => {
        fileConfig.data = data;
        return fileConfig;
    })
        .catch((err) => {
        console.error("cant read file " + "");
        return err;
    });
}
exports.readFile = readFile;
//# sourceMappingURL=readScript.js.map