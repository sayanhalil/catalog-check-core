(function(root){
'use strict';
function parse(text,delimiter){
 if(![',',';','\t'].includes(delimiter)) throw Error('Geçersiz ayırıcı / Invalid delimiter');
 text=text.replace(/^\uFEFF/,''); if(!text)return [];
 const rows=[];let row=[],field='',state='plain';
 function cell(){row.push(field);field='';state='plain';}
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(state==='quoted'){
   if(ch==='"'){if(text[i+1]==='"'){field+='"';i++;}else state='closed';}else field+=ch;
  }else if(ch===delimiter){cell();}
  else if(ch==='\r'||ch==='\n'){cell();rows.push(row);row=[];if(ch==='\r'&&text[i+1]==='\n')i++;}
  else if(state==='closed')throw Error('Kapanan tırnaktan sonra beklenmeyen karakter / Invalid quoted field');
  else if(ch==='"'){if(field)throw Error('Alan ortasında tırnak / Unexpected quote');state='quoted';}
  else field+=ch;
 }
 if(state==='quoted')throw Error('Kapanmamış tırnak / Unclosed quote');
 if(row.length||field||state==='closed'||!/[\r\n]$/.test(text)){cell();rows.push(row);}
 return rows;
}
function serialize(rows,delimiter,safe=false){return rows.map(row=>row.map(v=>{
 let s=String(v??'');if(safe&&/^[\s]*[=+@-]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}).join(delimiter)).join('\r\n');}
function validPrice(value,decimal){return (decimal===','?/^\d+(,\d+)?$/:/^\d+(\.\d+)?$/).test(value.trim());}
function analyze(rows,config){
 if(rows.length<2)throw Error('Başlık ve en az bir veri kaydı gerekli / Add a header and a data record');
 const selected=[config.sku,config.name,config.price];
 if(new Set(selected).size!==3||selected.some(i=>!Number.isInteger(i)||i<0||i>=rows[0].length))throw Error('Üç farklı sütun seçin / Select three different columns');
 const issues=[],codes=new Map();
 const add=(row,code,column,value,message)=>issues.push({row,code,column,value,message});
 rows.slice(1).forEach((r,index)=>{
  const n=index+2;
  if(r.length!==rows[0].length){add(n,'columns','',String(r.length),'Sütun sayısı başlıkla uyuşmuyor / Column count mismatch');return;}
  r.forEach((v,j)=>{if(v!==v.trim())add(n,'space',rows[0][j],v,'Başta/sonda boşluk / Surrounding whitespace');if(/^[\s]*[=+@]/.test(v))add(n,'formula',rows[0][j],v,'Elektronik tabloda formül olarak yorumlanabilir / Potential spreadsheet formula');});
  const sku=r[config.sku].trim();
  if(!sku)add(n,'sku',rows[0][config.sku],r[config.sku],'Ürün kodu boş / Missing SKU');
  else{if(!codes.has(sku))codes.set(sku,[]);codes.get(sku).push(n);}
  if(!r[config.name].trim())add(n,'name',rows[0][config.name],'','Ürün adı boş / Missing product name');
  if(!validPrice(r[config.price],config.decimal))add(n,'price',rows[0][config.price],r[config.price],'Fiyat boş/geçersiz; binlik ayırıcı kullanmayın / Invalid price; no thousands separators');
 });
 for(const [sku,indices] of codes)if(indices.length>1)for(const n of indices)add(n,'duplicate',rows[0][config.sku],sku,'Aynı kod: kayıtlar / Duplicate SKU: '+indices.join(', '));
 issues.sort((a,b)=>a.row-b.row);
 return {records:rows.length-1,issues,flagged:new Set(issues.map(i=>i.row)).size};
}
const api={parse,serialize,validPrice,analyze};
if(typeof module==='object'&&module.exports)module.exports=api;else root.CatalogCore=api;
})(typeof window!=='undefined'?window:globalThis);
