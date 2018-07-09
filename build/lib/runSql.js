"use strict";
// import * as  oracledb from 'oracledb';
// import  Bluebird =require( 'bluebird');
// import {  SqlScript,SqlFile } from './Model';
// import { Progress, ProgressCallback } from './Progress';
// import { readFiles,readFile, parseScript, parseScripts } from './readAndParse';
// declare var Promise: Bluebird<any>;
// var fs=  require('fs-extra');
// interface Result {
//     executions:Report[],
//     sucesses:Report[],
//     errors:Report[]
// }
// interface Report {
//     script:SqlScript,
//     sucess:boolean,
//     result:any
// }
// export function runFiles(filesInfo:SqlFile[]|string[]|SqlFile|string,connection:oracledb.IConnectionAttributes,callbackProgress?:ProgressCallback){
//     let files:SqlFile[]|string[];
//     let promise:Promise<SqlFile[]|SqlFile>|Bluebird<SqlFile[]|SqlFile>;
//     if(!Array.isArray(filesInfo)){
//         promise= readFile(<SqlFile|string>filesInfo);
//     }else{
//         promise= readFiles(filesInfo)
//     }
//     return promise.then(scripts=>{
//         if(Array.isArray(scripts))
//             return parseScripts(scripts)
//         else
//             return parseScripts(script)
//     });
// }
// export function runSqlsOrdered (sqlScripts:SqlScript[]|SqlScript,connection:oracledb.IConnectionAttributes,callbackProgress?:ProgressCallback) {
//     let scripts:SqlScript[];
//     if(!Array.isArray(sqlScripts)){
//         scripts=[sqlScripts];
//     }else{
//         scripts=sqlScripts;
//     }
//     var progress=new Progress(scripts.length,callbackProgress);
//     progress.start(`running scripts ${scripts.length}`);
//     var percent=scripts.length;
//     return new Bluebird(function(resolve,reject){
//         var results:Result={
//             executions:[],
//             sucesses:[],
//             errors:[]
//         };
//         recursiveExec(scripts).then((end:any)=>{
//             progress.finish("scripts executados",true );
//             resolve(results)
//         }).catch((err:string)=>{
//             progress.finish(err,false);
//             reject(err)
//         });
//         function recursiveExec(scripts:SqlScript[]):Bluebird<any>{
//             let tmpScript=scripts.shift();
//             let script:SqlScript;
//             if(tmpScript==undefined){
//                 throw "Error interating array of scripts. It should never be undefined.";
//             }else{
//                 script=tmpScript;
//             }
//             return run(script.toString(),connection)
//             .then((result:any)=>{
//                 let report:Report={
//                     script:script,
//                     sucess:true,
//                     result:result
//                 }
//                 results.sucesses.push(report);
//                 return report;
//             })
//             .catch((err:any)=>{
//                 let report:Report={
//                     script:script,
//                     sucess:false,
//                     result:err
//                 }
//                 results.errors.push(report);
//                 return report;
//             }).then((report:Report)=>{
//                 results.executions.push(report);
//                 progress.run(script.info.file+"-"+script.toString().trim(),report );
//                 if(scripts.length>0){
//                     return recursiveExec(scripts);
//                 }
//             })
//         }
//     })
// }
// export function run(script:string,connection:oracledb.IConnectionAttributes){
//     return new Bluebird(function(resolve,reject){
//         if(!script){
//             resolve()
//         }else{
//             oracledb.getConnection(connection)
//             .then(function(conn) {
//                 //block=`BEGIN EXECUTE IMMEDIATE '${script.replace(/'/g,"''")}';END;`
//                 let block=script;
//                 return conn.execute(block)
//                 .then(function(result) {
//                     conn.close().then(e=>{
//                         resolve( result);
//                     });
//                 })
//                 .catch(function(err) {
//                     conn.close().then(e=>{
//                         reject( err);
//                     });
//                 });
//             })
//             .catch(function(err) {
//                 reject( err);
//             })
//         }
//     })
// }
//# sourceMappingURL=runSql.js.map