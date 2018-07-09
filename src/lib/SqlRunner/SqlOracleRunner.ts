

import * as  oracledb from 'oracledb';
import  Bluebird from 'bluebird';
import { SqlRunner } from '../SqlRunner/SqlRunner';
export abstract class SqlOracleRunner extends SqlRunner{
 
    constructor(connection: oracledb.IConnectionAttributes){
        super(connection);
    }
    get connection(){
        return <oracledb.IConnectionAttributes>super._connection;
    }
    run(script:string){
        let connection=this.connection;
        return new Bluebird(function(resolve,reject){
            if(!script){
                resolve()
            }else{
                oracledb.getConnection(connection)
                .then(function(conn) {
                    //block=`BEGIN EXECUTE IMMEDIATE '${script.replace(/'/g,"''")}';END;`
                    let block=script;
                    return conn.execute(block)
                    .then(function(result) {
                        conn.close().then(e=>{
                            resolve( result);
                        });
    
                    })
                    .catch(function(err) {
                        conn.close().then(e=>{
                            reject( err);
                        });
                    });
                })
                .catch(function(err) {
                    reject( err);
                })
            }
        })
    }
}

