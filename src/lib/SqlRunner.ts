

import * as  oracledb from 'oracledb';
import  Bluebird from 'bluebird';
import {  SqlScript,SqlFile } from './Model';
import { Progress, ProgressCallback } from './Progress';
import { readFiles,readFile, parseScript, parseScripts } from './readAndParse';

var fs=  require('fs-extra');

interface Result {
    executions:Report[],
    sucesses:Report[],
    errors:Report[]
}

interface Report {
    script:SqlScript,
    sucess:boolean,
    result:any
}

interface GeneralConnection {
    user?:string,
    password?:string
    connectionString:string
}

export abstract class SqlRunner{
    constructor(connection:GeneralConnection| oracledb.IConnectionAttributes){
        this._connection=connection;
    }
    protected _connection:GeneralConnection| oracledb.IConnectionAttributes;

    runFilesInternal(filesInfo:SqlFile[]|string[]|SqlFile|string,callbackProgress?:ProgressCallback){
        let files:SqlFile[]|string[];
        let promise:Bluebird<SqlFile[]|SqlFile>|Bluebird<SqlFile[]|SqlFile>;
        if(!Array.isArray(filesInfo)){
            promise= readFile(<SqlFile|string>filesInfo);
        }else{
            promise= readFiles(filesInfo)
        }
        
        return promise.then(scripts=>{
            if(Array.isArray(scripts))
                return parseScripts(scripts,callbackProgress)
            else
                return parseScript(scripts)
        })
    }
    
    allToSqlScriptArray(sqlScripts:SqlScript[]|SqlScript){
        if(!Array.isArray(sqlScripts)){
            return [sqlScripts];
        }else{
            return sqlScripts;
        }
    }
    
    runSqlsPromise(scripts:SqlScript[]){
        let tmpScript=scripts.shift();
        let script:SqlScript;
        if(tmpScript==undefined){
            throw "Error interating array of scripts. It should never be undefined.";
        }else{
            script=tmpScript;
        }
        return this.run(script.toString())
        .then((result:any)=>{
            let report:Report={
                script:script,
                sucess:true,
                result:result
            }
    
            return report;
        })
        .catch((err:any)=>{
            let report:Report={
                script:script,
                sucess:false,
                result:err
            }
            
            return report;
        })
        
    }
    
    
    runFiles(filesInfo:SqlFile[]|string[]|SqlFile|string,callbackProgress?:ProgressCallback){
        return this.runFilesInternal(filesInfo,callbackProgress).then(data=>{
            return this.runSqls(data,callbackProgress);
        });
    }
    
    
    
    runSqls (sqlScripts:SqlScript[]|SqlScript,callbackProgress?:ProgressCallback) {
        let scripts=this.allToSqlScriptArray(sqlScripts);
    
        var progress=new Progress(scripts.length,callbackProgress);
        progress.start(`running scripts ${scripts.length}`);
        
        var promises=[]
        while(scripts.length>0){
            promises.push(this.runSqlsPromise(scripts).then(report=>{
                progress.run(report.script.info.file+"-"+report.script.toString().trim(),report );
                return report;
            }));
        }
        return Bluebird.all(promises).then(report=>{
            progress.finish("scripts executados",report );
            return report;
        });
    }
    
    runFilesOrdered(filesInfo:SqlFile[]|string[]|SqlFile|string,callbackProgress?:ProgressCallback){
        return this.runFilesInternal(filesInfo,callbackProgress).then(data=>{
            return this.runSqlsOrdered(data,callbackProgress);
        });
    }
    
    runSqlsOrdered (sqlScripts:SqlScript[]|SqlScript,callbackProgress?:ProgressCallback) {
        let scripts=this.allToSqlScriptArray(sqlScripts);
        var progress=new Progress(scripts.length,callbackProgress);
        let context=this;
        
        progress.start(`running scripts ${scripts.length}`);
        var percent=scripts.length;
        return new Bluebird(function(resolve,reject){
            var results:Result={
                executions:[],
                sucesses:[],
                errors:[]
            };
            recursiveExec(scripts).then((end:any)=>{
                progress.finish("scripts executados",true );
                resolve(results)
            }).catch((err:string)=>{
                progress.finish(err,false);
                reject(err)
            });
            function recursiveExec(scripts:SqlScript[]):Bluebird<any>{
                return context.runSqlsPromise(scripts).then((report:Report)=>{
                    results.executions.push(report);
                    progress.run(report.script.info.file+"-"+report.script.toString().trim(),report );
                    if(scripts.length>0){
                        return recursiveExec(scripts);
                    }
                })
            }
        })
    }

    abstract get connection():GeneralConnection| oracledb.IConnectionAttributes;
    abstract run(script:string): Bluebird<any>;
    
    // run(script:string,connection:oracledb.IConnectionAttributes){
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
}

