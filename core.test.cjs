const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const p=path.resolve(__dirname,'./core.js');
const core=fs.existsSync(p)?require(p):{};
test('CSV roundtrip preserves quoted multiline fields and leading zero codes',()=>{
 assert.equal(typeof core.parse,'function');
 const rows=[['sku','name','price'],['001','A, "B"\nC','12.50'],['002','','0']];
 assert.deepEqual(core.parse(core.serialize(rows,','),','),rows);
});
test('BOM semicolon CSV and CRLF are parsed without extra final row',()=>{
 assert.equal(typeof core.parse,'function');
 assert.deepEqual(core.parse('\ufeffsku;price\r\n001;12,50\r\n',';'),[['sku','price'],['001','12,50']]);
});
test('malformed quoted CSV is rejected rather than silently repaired',()=>{
 assert.equal(typeof core.parse,'function');
 for(const s of ['a,b\n"x,y','a,b\nx"y,z','a,b\n"x"z,3']) assert.throws(()=>core.parse(s,','));
});
test('findings cover duplicates, missing names, invalid amounts and ragged records',()=>{
 assert.equal(typeof core.analyze,'function');
 const rows=[['sku','name','price'],['001','First','12,50'],['001','','-2'],['003','Third','1.200,00'],['004']];
 const r=core.analyze(rows,{sku:0,name:1,price:2,decimal:','});
 assert.equal(r.records,4);
 assert.equal(r.issues.filter(i=>i.code==='duplicate').length,2);
 assert.equal(r.issues.filter(i=>i.code==='price').length,2);
 assert.equal(r.issues.filter(i=>i.code==='columns').length,1);
 assert.equal(r.issues.filter(i=>i.code==='name').length,1);
});
test('decimal mode does not guess thousands separators or accept exponent/negative prices',()=>{
 assert.equal(typeof core.validPrice,'function');
 assert.equal(core.validPrice('12,50',','),true);
 assert.equal(core.validPrice('12,50','.'),false);
 for(const p of ['1,234.56','1.234,56','-1','1e3','Infinity','']) assert.equal(core.validPrice(p,'.'),false);
 assert.equal(core.validPrice('0','.'),true);
});
test('formula safety prefixes spreadsheet expressions only when requested',()=>{
 assert.equal(typeof core.serialize,'function');
 const rows=[['=1+1','+2','@SUM(1)','001','-2']];
 assert.deepEqual(core.parse(core.serialize(rows,',',true),','),[["'=1+1","'+2","'@SUM(1)",'001',"'-2"]]);
 assert.deepEqual(core.parse(core.serialize(rows,',',false),','),rows);
});

