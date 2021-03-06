"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const fse = require("fs-extra");
const configurationService = __importStar(require("./configuration"));
const Model_1 = require("./Model");
const Progress_1 = require("./Progress");
function readFiles(files) {
    var promisses = [];
    while (files && files.length > 0) {
        let fileTemp = files.shift();
        if (fileTemp && fileTemp) {
            promisses.push(readFile(fileTemp));
        }
    }
    return bluebird_1.default.all(promisses);
}
exports.readFiles = readFiles;
function readFile(fileConfigParam) {
    let fileConfig;
    if (typeof fileConfigParam == 'string') {
        fileConfig = { file: fileConfigParam };
    }
    else {
        fileConfig = fileConfigParam;
    }
    let encoding = configurationService.get().encoding;
    if (fileConfig.encoding) {
        encoding = fileConfig.encoding;
    }
    return new bluebird_1.default((resolve, reject) => {
        fse.readFile(fileConfig.file, { encoding: encoding })
            .then((data) => {
            fileConfig.data = data;
            resolve(fileConfig);
        })
            .catch((err) => {
            fileConfig.data = err;
            reject(fileConfig);
        });
    });
}
exports.readFile = readFile;
function parseScripts(files, callbackProgress) {
    var progress = new Progress_1.Progress(files.length, callbackProgress);
    progress.start(`parsingFiles ${files.length}`);
    var scripts = [];
    files.forEach(scriptFile => {
        scripts = scripts.concat(parseScript(scriptFile));
        progress.run(`parsing script`);
    });
    progress.finish(`finished parsing`);
    return scripts;
}
exports.parseScripts = parseScripts;
function parseScript(file) {
    var endDelimiter = configurationService.get().defaultCommandDelimiter;
    if (file.delimiter) {
        endDelimiter = file.delimiter;
    }
    var re = new RegExp(endDelimiter, 'mg');
    let scripts = file.data ? file.data.split(re) : [];
    return scripts.map(e => {
        e = e.trim();
        e = e.replace(/--.*/g, "");
        e = e.replace(/\s*;\s*$/, "");
        return new Model_1.SqlScript(e, file);
    });
}
exports.parseScript = parseScript;
//# sourceMappingURL=readAndParse.js.map