import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root=process.cwd();
const assets=JSON.parse(await fs.readFile(path.join(root,'data/assets.json'),'utf8'));
const columns=JSON.parse(await fs.readFile(path.join(root,'schemas/fiix-assets-template-columns.json'),'utf8')).headers.filter(x=>x!=='*Any Custom Fields*');
const sourceId=assets[0].evidence[0].source_id;
const rows=assets.map(a=>{
  let notes=`PROPOSED IAB architecture; state=${a.record_status}; source=${sourceId}; ${a.evidence[0].locator}; quantity estimate=${a.quantity_estimate}`;
  if(a.candidate_catalog_family) notes+=`; candidate family (UNVERIFIED)=${a.candidate_catalog_family}`;
  notes+=`; verify=${a.verification_action}`;
  const v={'Asset Name':a.name,'Asset Code':a.asset_id,'Category':a.asset_class==='demo_wall'?'Locations And Facilities':'','Location Code':a.parent_id,'Asset Description':a.description,'Notes':notes};
  return columns.map(h=>v[h]??'');
});
const wb=Workbook.create(); const sh=wb.worksheets.add('Import Sheet');
sh.getRangeByIndexes(0,0,rows.length+1,columns.length).values=[columns,...rows];
sh.showGridLines=false;
const whole=sh.getRangeByIndexes(0,0,rows.length+1,columns.length);
whole.format.font={name:'Arial',size:10}; whole.format.verticalAlignment='top';
whole.format.columnWidth=24;
sh.getRange('A:A').format.columnWidth=48;
sh.getRange('B:B').format.columnWidth=34;
sh.getRange('D:D').format.columnWidth=34;
sh.getRange('E:E').format.columnWidth=70;
sh.getRange('M:M').format.columnWidth=105;
sh.getRangeByIndexes(0,0,1,columns.length).format={fill:'#243B53',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,rowHeight:32};
sh.getRangeByIndexes(1,0,rows.length,columns.length).format.wrapText=true;
sh.getRangeByIndexes(1,0,rows.length,columns.length).format.autofitRows();
sh.freezePanes.freezeRows(1); sh.freezePanes.freezeColumns(2);
await wb.recalculate();
const out=path.join(root,'outputs/new-assets-only'); await fs.mkdir(out,{recursive:true});
const csvCell=v=>{const s=String(v??''); return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};
// Serialize the authored range, preserving text IDs and field order.
const matrix=sh.getRangeByIndexes(0,0,rows.length+1,columns.length).values;
await fs.writeFile(path.join(out,'Assets.csv'),'\uFEFF'+matrix.map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n','utf8');
await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(out,'Fiix_IAB_New_Assets_A26.xlsx'));
const qa=path.join(root,'validation/previews'); await fs.mkdir(qa,{recursive:true});
for(const [name,range] of [['hierarchy','A1:D8'],['components','A9:D15'],['provenance','M9:M11']]){
  const img=await wb.render({sheetName:'Import Sheet',range,scale:1.5,format:'png'});
  await fs.writeFile(path.join(qa,name+'.png'),new Uint8Array(await img.arrayBuffer()));
}
console.log(JSON.stringify({rows:rows.length,columns:columns.length,csv:'Assets.csv',xlsx:'Fiix_IAB_New_Assets_A26.xlsx',existing_asset_rows:0}));
