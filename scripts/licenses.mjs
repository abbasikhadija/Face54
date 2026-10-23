import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const packages=['cubejs','react','react-dom','scheduler','three'];
const notices=packages.map(name=>{
 const root=new URL(`../node_modules/${name}/`,import.meta.url);
 const data=JSON.parse(readFileSync(new URL('package.json',root),'utf8'));
 if(data.license!=='MIT')throw Error(`Review changed license for ${name}: ${data.license}`);
 return `${name} ${data.version} — ${data.license}\n${readFileSync(new URL('LICENSE',root),'utf8')}`;
}).join('\n\n------------------------------------------------------------\n\n');
mkdirSync(new URL('../public/',import.meta.url),{recursive:true});
writeFileSync(new URL('../public/THIRD_PARTY_NOTICES.txt',import.meta.url),`Face54 third-party runtime notices\n\n${notices}\n`);
console.log('Generated runtime license notices for 5 MIT packages.');
