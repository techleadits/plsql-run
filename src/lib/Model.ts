export interface SqlFile{
    file:string,
    delimiter?:string,
    encoding?:string,
    data?:string
}

export class SqlScript{
    constructor(script:string, info:SqlFile) {
        this.script = script; this.info = info;
      }

    script:string
    info:SqlFile
    toString(){
        return this.script;
    }
}