export class Progress{

    
    constructor(total:number,callback?:ProgressCallback){
        this._total=total; 
        if(callback)
            this._callback=callback;
        else
            this._callback=function(){

            }
        this._runnedCount=0;
    }
    private _total:number
    private _runnedCount:number
    private _callback:ProgressCallback

    get total(){
        return this._total;
    }
    get runnedCount(){
        return this._runnedCount;
    }
    get callback(){
        return this._callback;
    }
    
    start(message:string,data?:any){
        this._runnedCount=0;
        this._callback(ProgresState.started,this.progressPercent(),message,data);
    }
    run(message:string,data?:any){
        if(this._runnedCount==this._total){
            this.finish(message,data);
        }else{
            this._runnedCount++;
            this._callback(ProgresState.running,this.progressPercent(),message,data);
        }
        
    }
    finish(message:string,data?:any){
        this._runnedCount=this._total;
        this._callback(ProgresState.finished,this.progressPercent(),message,data);
    }

    progressPercent(){
        return (100*this._runnedCount)/this._total
    }

    
}

export enum ProgresState{
    started,running,finished
}


export interface ProgressCallback {
    (state:ProgresState,percent:number,info:string,data?:any): void;
}