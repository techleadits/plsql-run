"use strict";
// import * as Bluebird from 'bluebird';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// declare global {
//     interface Promise<T> extends Bluebird<T> {
//         then(...args: any[]): any;
//         catch(...args: any[]): any;
//     }
//     interface PromiseConstructor extends DummyConstructor {}
//     var Promise: Promise<any>;
// }
// Promise = Bluebird as any;
const Promise = __importStar(require("bluebird"));
global.Promise = Promise;
const configurationService = __importStar(require("./configuration"));
const Model_1 = require("./Model");
const Progress_1 = require("./Progress");
// export function readFiles(files:SqlFile[]|string[]):Promise{
//     var promisses:Promise<SqlFile>[]=[];
//     while(files&&files.length>0){
//         let fileTemp=files.shift();
//         if(fileTemp&&fileTemp){
//             promisses.push(readFile(fileTemp));
//         }
//     }
//     return Bluebird.all(promisses)
// }
// export function readFile(fileConfigParam:SqlFile|string):Promise<SqlFile>{
//     let fileConfig:SqlFile;
//     if(typeof fileConfigParam=='string'){
//         fileConfig={file:fileConfigParam}
//     }else{
//         fileConfig=<SqlFile>fileConfigParam;
//     }
//     let encoding=configurationService.get().encoding;
//     if(fileConfig.encoding){
//         encoding=fileConfig.encoding;
//     }
//     return fse.readFile(fileConfig.file,{encoding:encoding})
//     .then((data:string)=>{
//         fileConfig.data=data;
//         return fileConfig;
//     })
//     .catch((err:string)=>{
//         console.error("cant read file "+ "");
//         fileConfig.data=err;
//         return fileConfig;
//     })
// }
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