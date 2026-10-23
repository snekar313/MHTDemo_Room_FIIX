import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root=process.cwd();
const assets=JSON.parse(await fs.readFile(path.join(root,'data/assets.json'),'utf8'));
// Export only populated, documented fields. Fiix warns that blank mapped columns
// can write blank values rather than applying defaults.
const columns=['Asset Name','Asset Code','Category','Location Code','Asset Description','Notes'];
const sourceId=assets[0].evidence[0].source_id;
const rows=assets.map(a=>{
  let notes=`PROPOSED IAB architecture; state=${a.record_status}; source=${sourceId}; ${a.evidence[0].locator}; quantity estimate=${a.quantity_estimate}`;
  if(a.candidate_catalog_family) notes+=`; candidate family (UNVERIFIED)=${a.candidate_catalog_family}`;
  notes+=`; verify=${a.verification_action}`;
  const v={'Asset Name':a.name,'Asset Code':a.asset_id,'Category':a.category_tenant,'Location Code':a.parent_id,'Asset Description':a.description,'Notes':notes};
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
sh.getRange('F:F').format.columnWidth=105;
sh.getRangeByIndexes(0,0,1,columns.length).format={fill:'#243B53',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,rowHeight:32};
sh.getRangeByIndexes(1,0,rows.length,columns.length).format.wrapText=true;
sh.getRangeByIndexes(1,0,rows.length,columns.length).format.autofitRows();
sh.freezePanes.freezeRows(1); sh.freezePanes.freezeColumns(2);
await wb.recalculate();
const out=path.join(root,'outputs/new-assets-only'); await fs.mkdir(out,{recursive:true});
const csvCell=v=>{const s=String(v??''); return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};
// Serialize the authored range, preserving text IDs and field order.
const matrix=sh.getRangeByIndexes(0,0,rows.length+1,columns.length).values;
const saveCsv=async(filename,data)=>fs.writeFile(path.join(out,filename),'\uFEFF'+[columns,...data].map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n','utf8');
await saveCsv('REFERENCE_ONLY_All_Assets.csv',matrix.slice(1));
const stages=[
  {file:'01_Demo_Wall.csv',matches:a=>a.parent_id==='A26'},
  {file:'02_Process_Skids.csv',matches:a=>a.parent_id==='IAB-DEMO-ROOM'},
  {file:'03_Component_Groups.csv',matches:a=>a.parent_id!=='A26'&&a.parent_id!=='IAB-DEMO-ROOM'}
];
for(const stage of stages) await saveCsv(stage.file,rows.filter((r,i)=>stage.matches(assets[i])));
await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(out,'Fiix_IAB_New_Assets_A26.xlsx'));
const qa=path.join(root,'validation/previews'); await fs.mkdir(qa,{recursive:true});
for(const [name,range] of [['hierarchy','A1:D8'],['components','A9:D15'],['provenance','F9:F11']]){
  const img=await wb.render({sheetName:'Import Sheet',range,scale:1.5,format:'png'});
  await fs.writeFile(path.join(qa,name+'.png'),new Uint8Array(await img.arrayBuffer()));
}
console.log(JSON.stringify({rows:rows.length,columns:columns.length,stages:stages.map(s=>({file:s.file,rows:assets.filter(s.matches).length})),xlsx:'Fiix_IAB_New_Assets_A26.xlsx',existing_asset_rows:0}));
