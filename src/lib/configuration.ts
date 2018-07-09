import {SqlFile} from  './Model';

var cachedConfig:any={
    "encoding":"UTF-8",
    "defaultCommandDelimiter":"^\\s*\/\\s*$"
};

export function get(){
    return cachedConfig;
}