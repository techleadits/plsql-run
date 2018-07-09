import Bluebird from 'bluebird';

import fse =require( 'fs-extra');
import * as configurationService from './configuration';

import {SqlFile,SqlScript} from  './Model';

import { Progress, ProgressCallback } from './Progress';





export function readFiles(files:SqlFile[]|string[]):Bluebird<SqlFile[]>{
    
    var promisses:Bluebird<SqlFile>[]=[];
    while(files&&files.length>0){
        let fileTemp=files.shift();

        if(fileTemp&&fileTemp){
            promisses.push(readFile(fileTemp));
        }
    }

    return Bluebird.all(promisses)
}

export function readFile(fileConfigParam:SqlFile|string):Bluebird<SqlFile>{
    let fileConfig:SqlFile;
    if(typeof fileConfigParam=='string'){
        fileConfig={file:fileConfigParam}
    }else{
        fileConfig=<SqlFile>fileConfigParam;
    }
    
    let encoding=configurationService.get().encoding;
    if(fileConfig.encoding){
        encoding=fileConfig.encoding;
    }
    
    return new Bluebird((resolve,reject)=>{
        fse.readFile(fileConfig.file,{encoding:encoding})
        .then((data:string)=>{
            fileConfig.data=data;
            resolve(fileConfig);
        })
        .catch((err:string)=>{
            fileConfig.data=err;
            reject(fileConfig);
        })

    }) 
}

export function parseScripts(files:SqlFile[],callbackProgress?:ProgressCallback):SqlScript[]{
    
    var progress=new Progress(files.length,callbackProgress);
    progress.start(`parsingFiles ${files.length}`);
    
    var scripts:SqlScript[]=[];
    files.forEach(scriptFile=>{
        scripts=scripts.concat( parseScript(scriptFile));
        progress.run(`parsing script`);
    })

    progress.finish(`finished parsing`);
    return scripts;
}

export function parseScript(file:SqlFile):SqlScript[]{
    var endDelimiter=configurationService.get().defaultCommandDelimiter;
   
    if(file.delimiter){
        endDelimiter=file.delimiter;
    }
    var re = new RegExp(endDelimiter,'mg');
    let scripts=file.data?file.data.split(re):[];

    return scripts.map(e=>{
        e=e.trim();
       
        e=e.replace(/--.*/g,"");
        e=e.replace(/\s*;\s*$/,"");
        

        return new SqlScript(e,file);
    });
}


