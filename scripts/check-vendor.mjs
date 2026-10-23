import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const root=new URL('../vendor/cubejs/',import.meta.url);
const hashes=JSON.parse(readFileSync(new URL('SHA256.json',root),'utf8'));
for(const [file,expected] of Object.entries(hashes)){
 const actual=createHash('sha256').update(readFileSync(new URL(file,root))).digest('hex');
 if(actual!==expected)throw Error(`Vendored cubejs integrity mismatch: ${file}`);
}
console.log('Verified 4 unchanged cubejs runtime/license files.');
