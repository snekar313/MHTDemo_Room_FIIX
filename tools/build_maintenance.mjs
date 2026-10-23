import fs from 'node:fs/promises';
import path from 'node:path';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const root=process.cwd(),out=path.join(root,'outputs/controls-maintenance');
await fs.mkdir(out,{recursive:true});
const assets=JSON.parse(await fs.readFile(path.join(root,'data/assets.json'),'utf8'));
const skids=assets.filter(a=>a.asset_class==='process_skid');
const components=assets.filter(a=>a.asset_id.includes('-B'));
const jobs=[],tasks=[];
const commonM=[
 ['Confirm skid identity and maintenance scope','Record asset tag and date; confirm all component groups listed for this skid.','Correct skid and scope; report missing or duplicate tags.'],
 ['Review controller and device health indicators without changing operating mode','Record RUN/FAULT/COMM status and visible alarm references; do not force I/O or reset faults.','No unexplained faults; capture and escalate any fault rather than clearing it.'],
 ['Inspect accessible exterior wiring and connectors','Record damaged insulation; loose external connectors; strain relief and label condition.','No visible damage or missing labels; no energized enclosure access or terminal tightening.'],
 ['Inspect ventilation and cabinet condition','Record blocked vents; fan indications; dust; moisture; odor and visible discoloration.','No obstruction or deterioration; de-energized cleaning only under an approved procedure.'],
 ['Review network and operator-interface symptoms','Record link alarms; communication interruptions and reported operator issues.','No unexplained communication loss; do not disconnect cables to test.'],
 ['Inspect visible guarding and E-stop hardware condition','Record guard/interlock/E-stop/light-curtain condition where installed; use N/A with a reason otherwise.','No visible damage or bypass indication; functional safety testing is a separate approved procedure.'],
 ['Record findings and follow-up work','Record PASS/FAIL/N/A per task; photos; defect references and technician identity.','Every exception has a follow-up reference; do not claim safety certification.']
];
const commonQ=[
 ['Reconcile installed device identity against the asset register','For each actual device record manufacturer; exact catalog/model; serial; hardware series/revision; position and source.','Label evidence supports each value; candidate BOM families remain unverified until confirmed.'],
 ['Record controller and electronic hardware firmware versions','For every firmware-bearing device record exact revision including minor/build; read method; date and evidence; N/A reason for passive devices.','Current versions recorded per physical device; compare with approved baseline or mark baseline missing. No upgrade is authorized.'],
 ['Record per-interface network configuration','Record actual IPv4; subnet mask; gateway; MAC; DHCP/static mode and device interface. Do not copy proposed addresses.','Each address is observed with evidence; unknown stays unknown; dual ports sharing one IP are not separate devices.'],
 ['Compare observed network configuration with approved design','Compare subnet; gateway; VLAN/NAT role where available; note conflicts with provisional skid plan separately.','Only an approved as-built baseline establishes compliance; no routing/VLAN/IP changes or active scan.'],
 ['Review switch port diagnostics and interface health','Record connected device and port; link speed/duplex; error counters and capture time; map only traceable connections.','Unexpected errors or topology differences documented; a counter needs context and an approved threshold.'],
 ['Verify program and configuration backup evidence','Record approved backup location; timestamp; device identity and checksum/version where available for PLC/HMI/drive/switch/firewall.','Backup is traceable to installed hardware; an actual backup/export requires the approved procedure; no download or restore.'],
 ['Review firmware compatibility and vendor lifecycle findings','Compare exact verified hardware/firmware with approved compatibility and security guidance; record source/date and action owner.','Findings reviewed by controls owner; do not label latest firmware automatically compatible or safe.'],
 ['Review fault and event history','Read available diagnostic history and record recurring faults; timestamps and changes since last inspection.','Recurring issues have a follow-up; no fault clearing or configuration writes.'],
 ['Complete and approve the configuration record','Attach evidence; record PASS/FAIL/N/A; unresolved baseline gaps; change tickets and reviewer.','Unknown version/address or missing baseline remains an open item rather than a pass.']
];
const domain={
 '01':{
  m:[['Inspect operator stations and motor-control hardware','Record visible button/indicator damage and starter/protection condition.','Physical condition acceptable; no actuation or reset without approved demonstration procedure.'],['Inspect firewall and switch installation','Record power/link indicators; cabling and mounting condition.','No unexplained indication; do not change security policy.'],['Inspect terminal-bank identification','Record labels and visible terminal assembly condition from safe access.','Labels present; no live torque check.']],
  q:[['Audit PLC and local I/O identification','Record exact CPU; hardware series; firmware; adapter/module catalog numbers and channel inventory.','PLC family and module counts confirmed from evidence; no guessed catalog numbers.'],['Audit firewall and switch configuration baseline','Record model/firmware; interface IPs; management role and approved backup reference without credentials or rule secrets.','Authorized baseline comparison complete; policy/NAT unknowns remain open.'],['Reconcile protection and operator devices','Record actual ratings and device counts from accessible labels or drawings.','Group quantity estimates replaced only with verified count evidence.']]},
 '02':{
  m:[['Inspect VFD cooling and status','Record drive/HIM alarms; fan indication and external ventilation condition.','No obstruction or unexplained fault; no exposed-power inspection.'],['Inspect servo drive cabling condition','Record visible power/feedback cable damage; strain relief and labels.','No damage; do not unplug motor/feedback cables.'],['Inspect protection and starter condition','Record visible breaker/contactor deterioration or heat discoloration.','Any deterioration escalated; no reset or live terminal access.']],
  q:[['Audit VFD identity and parameter backup','Record exact drive catalog/rating; main and communication-option firmware; IP and parameter backup reference.','Identity and firmware observed separately; family label alone is insufficient.'],['Audit each servo module and axis mapping','Distinguish bus supply and inverter modules; record firmware/IP where supported; motor and feedback identities; axis mapping.','Each actual module has its own observation record; do not expand estimated quantities blindly.'],['Review safe-motion and drive interface baseline','Record available safety-option identity and approved configuration/checksum reference read-only.','Changes or missing safety evidence referred to responsible safety/controls engineer.']]},
 '03':{
  m:[['Inspect HMI and controller status','Record screen condition; alarms; controller indicators and cabinet-visible condition.','No unexplained alarms or display faults; no edits or downloads.'],['Inspect local and distributed I/O condition','Record module/channel indications; field-block connectors and label damage.','Unexpected channel/connection indicators recorded without forcing outputs.'],['Inspect selector and guarding hardware','Record visible operator/safety device condition without challenge testing.','No visible damage or bypass indication; testing requires approved procedure.']],
  q:[['Confirm HMI and industrial-computer platform','Record exact HMI/IPC model; firmware/runtime/OS versions as applicable and approved project backup.','Resolve PanelView/Optix/IPC source ambiguity from actual labels and configuration.'],['Audit safety controller and I/O revisions','Record exact CPU; firmware; local/field module revisions; safety project/signature reference where available.','Read-only evidence captured; no safety unlock/download or validation claim.'],['Audit field-network and switch addresses','Record switch and field I/O interface configuration; actual port links and cabinet labels.','Actual addresses evidenced; unsupported endpoints marked N/A with explanation.']]},
 '04':{
  m:[['Inspect guarded axis mechanical condition','Record visible guard; actuator; motor; cable and mounting deterioration from safe access.','No visible defect; do not command motion.'],['Inspect interlock and locking device condition','Record alignment indicators and visible actuator damage without defeating guards.','No bypass indication; functional challenge requires qualified approved test procedure.'],['Inspect servo and I/O diagnostics','Record visible drive and I/O status plus recent operator-reported axis issues.','Faults documented; no reset or forced I/O.']],
  q:[['Identify actual servo drive and motor combination','Record exact drive/module family; firmware; motor catalog/feedback identity and verified axis assignment.','Resolve prior Kinetix-family estimates using evidence; no motion or tuning changes.'],['Identify actual remote I/O platform','Record adapter/module models; hardware revisions; firmware if supported and IP configuration.','Resolve POINT/Compact/other I/O ambiguity; unsupported revision fields marked N/A.'],['Review guard and safe-motion documentation','Record approved interlock/lock identity and safety baseline references.','Missing signature/procedure evidence escalated; read-only review is not functional safety validation.']]},
 '05':{
  m:[['Inspect light-curtain optics and mount condition','Record visible contamination; damage; alignment indicators and mounting condition.','No visible defect; do not interrupt a protective field without approved test procedure.'],['Inspect zone E-stops and interlock hardware','Record zone labels; visible damage; reset-station condition and bypass indications.','All expected zone labels present; no actuation or bypass.'],['Inspect distributed safety block connections','Record visible M12/field connector condition and diagnostics.','No damaged or unexplained indications; do not disconnect safety channels.']],
  q:[['Identify safety I/O hardware and firmware','Record actual field-block models; revisions; firmware/IP where supported and approved network identifiers.','No assumed CIP Safety capability; observed identity supports each claim.'],['Reconcile zone device and channel register','Record light-curtain transmitter/receiver identities; E-stop/interlock counts; actual zone and approved channel-map references.','Pairs and device groups are distinguished; estimated quantities stay labeled until counted.'],['Review safety inspection and validation records','Record last approved functional test; responsible person; procedure/version and any outstanding defects.','This job checks evidence only; overdue/missing validation is referred to the safety owner.']]},
 '06':{
  m:[['Inspect actuator and motor exterior condition','Record visible mounting; cable and guard deterioration without commanding movement.','No visible defect; no live mechanical intervention.'],['Inspect HMI and networking hardware condition','Record HMI condition; switch indicators; cable labels and diagnostic symptoms.','No unexplained indication or connection damage.'],['Inspect drive and power hardware condition','Record visible drive/protection/power-supply condition and alarm indications.','No fault reset; live power measurements require a separate approved procedure.']],
  q:[['Confirm actual controller and drive platforms','Record controller and drive exact models; firmware; communication roles and approved backup references.','Resolve Micro800/CompactLogix and drive-family ambiguity from observed evidence.'],['Audit switch and any NAT/gateway device','Record actual device identity; firmware; inside/outside interface roles and address mapping reference if present.','Do not infer NAT from a cable or duplicate interface IP; no mapping edits.'],['Audit HMI and actuator configuration references','Record HMI/runtime versions; actuator/motor identity; feedback type and approved configuration reference.','Mechanical and electronic identities separated; no firmware/parameter or motion changes.']]}
};
for(const skid of skids){
 const n=skid.asset_id.slice(-2),children=components.filter(a=>a.parent_id===skid.asset_id);
 for(const cadence of ['M','Q']){
  const job={code:`IAB-SM-S${n}-${cadence}`,skid_code:skid.asset_id,skid_name:skid.name,description:`MHT Demo Room SKID-${n} - ${cadence==='M'?'monthly condition inspection':'quarterly firmware and network audit'}`,group:`MHT IAB S${n} ${cadence==='M'?'Monthly Controls Inspection':'Quarterly Configuration Audit'}`,cadence_months:cadence==='M'?1:3,proposed_labor_hours:cadence==='M'?0.5:1.5,priority:'Medium',maintenance_type:'Inspection',start_work_order_status:'Open',desired_state:'Paused; no trigger',start_date:null,assigned_user:null,interval_approval:'Proposed; controls owner approval required',live_asset_match:'User reports newly added; reverify in tenant before linking',target_component_codes:children.map(a=>a.asset_id)};
  const items=[...(cadence==='M'?commonM:commonQ),...domain[n][cadence.toLowerCase()]];
  items.forEach(([action,record,acceptance],i)=>tasks.push({task_id:`${job.code}-T${String(i+1).padStart(2,'0')}`,sm_code:job.code,group:job.group,sequence:i+1,skid_code:skid.asset_id,target_codes:children.map(a=>a.asset_id),action,record_required:record,acceptance,task_type:'text',observations:null,source:'Authored planning definition from canonical IAB scope and user request; not an executed inspection'}));
  job.task_count=items.length; job.task_type='text'; jobs.push(job);
 }
}
const deviceFields=['Asset Code','Parent Skid Code','Asset Name','Asset Class','Candidate Family (UNVERIFIED)','Quantity Estimate','Device Instance / Position','Make (observed)','Model (observed)','Catalog Number (observed)','Serial Number (observed)','Hardware Series / Revision (observed)','Firmware / Software Version (observed)','Interface ID','IPv4 Address (observed)','Subnet Mask (observed)','Gateway (observed)','MAC Address (observed)','DHCP / Static (observed)','Switch / Port (observed)','VLAN / NAT Role (observed)','Approved Baseline Reference','Backup Reference','Evidence / Read Method','Observation Date','Inspected By','Result / Exception Reference','Applicability / N-A Reason'];
const deviceRows=components.map(a=>[a.asset_id,a.parent_id,a.name,a.asset_class,a.candidate_catalog_family??'',a.quantity_estimate,...Array(deviceFields.length-6).fill('')]);
const defsHeaders=['SM Code','Task Group','Task Number','Task ID','Target Skid Code','Target Component Codes','Task Description','Record Required','Acceptance / Follow-up','Task Type'];
const defs=tasks.map(t=>[t.sm_code,t.group,t.sequence,t.task_id,t.skid_code,t.target_codes.join(' | '),t.action,t.record_required,t.acceptance,t.task_type]);
// Documented Fiix task-group format; text responses avoid unsupported inspection
// notification/automatic corrective-WO defaults and preserve actual readings.
const tgHeaders=['Task group name','Task description','Task type'];
const tgRows=tasks.map(t=>[t.group,`${t.task_id}. ${t.action}. RECORD: ${t.record_required} ACCEPTANCE: ${t.acceptance} Scope: ${t.skid_code} and applicable child devices.`,t.task_type]);
const smHeaders=['SM Code','SM Description','Asset Code','Maintenance Type','Start As Work Order Status','Priority','Create Work Order Even If There Are Open Ones','Task Group','Task Type'];
const smRows=jobs.map(j=>[j.code,j.description,j.skid_code,j.maintenance_type,j.start_work_order_status,j.priority,'false',j.group,j.task_type]);
const wb=Workbook.create();
function sheet(name,headers,rows,widths){
 const s=wb.worksheets.add(name); const r=s.getRangeByIndexes(0,0,rows.length+1,headers.length); r.values=[headers,...rows];
 s.showGridLines=false; r.format.font={name:'Arial',size:10}; r.format.verticalAlignment='top'; r.format.wrapText=true; r.format.columnWidth=24;
 for(let i=0;i<headers.length;i++) s.getRangeByIndexes(0,i,rows.length+1,1).format.columnWidth=widths?.[i]??26;
 s.getRangeByIndexes(0,0,1,headers.length).format={fill:'#243B53',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,rowHeight:42};
 s.getRangeByIndexes(1,0,rows.length,headers.length).format.autofitRows(); s.freezePanes.freezeRows(1); s.freezePanes.freezeColumns(Math.min(2,headers.length)); return s;
}
const jobHeaders=['SM Code','Skid Code','Job Definition','Proposed Cadence','Task Group','Task Count','Proposed Labor (h)','Planned Integration State','Start Date - needs approval','Owner - needs assignment'];
const jobRows=jobs.map(j=>[j.code,j.skid_code,j.description,j.cadence_months===1?'Monthly - proposed':'Quarterly - proposed',j.group,j.task_count,j.proposed_labor_hours,j.desired_state,'','']);
const jobSheet=sheet('Jobs',jobHeaders,jobRows,[24,22,58,24,54,14,18,26,24,26]);
jobSheet.getRange('I2:J13').format.fill='#FFF2CC';jobSheet.getRange('G2:G13').setNumberFormat('0.0');
sheet('Tasks',defsHeaders,defs,[24,45,12,32,22,65,56,74,74,16]);
const reg=sheet('Device Register',deviceFields,deviceRows,[25,24,55,28,55,16,...Array(deviceFields.length-6).fill(30)]);
reg.getRangeByIndexes(1,6,deviceRows.length,deviceFields.length-6).format.fill='#FFF2CC';
const mapRows=[
 ['Asset Name / Asset Code','Official asset template','Canonical names and codes','Verify live identity before linking; do not rename assets.'],
 ['Location Code','Official asset template','Parent asset code','Existing A26 -> wall -> skid -> component; no new asset import is part of this maintenance release.'],
 ['Make / Model / Serial Number','Official asset template','Blank observed fields in device register','Collect actual label evidence; candidate family is not a verified Model.'],
 ['Category','Official asset template','Existing tenant category only','Do not link task groups to global Equipment category.'],
 ['Firmware / hardware revision / IP','User request; device register','New inspection observations','Not standard asset-template fields; keep in task responses or approved custom fields.'],
 ['Task group name / description / type','Fiix task-group import documentation','01_TaskGroups_Import.csv','Import groups first; do not add category or maintenance-type auto-links.'],
 ['SM Code / Asset Code / Task Group','Fiix scheduled-maintenance import documentation','02_ScheduledMaintenance_DRAFT_NoTriggers.csv','Groups and exact assets must already exist. Codes must be new.'],
 ['Time trigger / start date / timezone','Fiix scheduled-maintenance import documentation','Omitted intentionally','Intervals are proposed in Jobs; approve date/time/owner before activation. Tenant timezone must be checked.'],
 ['SM Status 0/1 / When','User ScheduledMaintenanceList.csv export','Report-only columns','Do not infer status mapping or construct machine schedules from report text.'],
 ['Start As Work Order Status','Fiix scheduled-maintenance import documentation','Open - tenant example','Status of future generated work order; not activation state of SM.'],
 ['Estimated labor','Authored planning estimate','0.5 h monthly / 1.5 h quarterly','Not actual time; not imported into an unrelated elapsed completion-window field.'],
 ['Source limits','Local IAB builder; user SM export','Partial existing SM inventory','No executed inspection; current imported asset set must be verified.'],
 ['Task-group source','https://helpdesk.fiixsoftware.com/hc/en-us/articles/49872020418708-Import-task-groups','Reviewed 2026-10-23','One task per row; common group name groups tasks.'],
 ['Scheduled-maintenance source','https://helpdesk.fiixsoftware.com/hc/en-us/articles/52837198415380-Import-scheduled-maintenance','Reviewed 2026-10-23','One existing group per SM supported by this import; SM updates are not supported.'],
 ['Template source','sources/tenant/mmg/Fiix - Asset Import Template - 20230613.xlsx','Reference Page / Import Sheet','Used for asset identity fields only; not treated as a maintenance-import schema.'],
 ['Raw SM source','sources/private/maintenance/ScheduledMaintenanceList.csv','Local-only copy and SHA-256 profile','Not published under previous source-set permission.']
];
mapRows.push(['Task Type','User-reported tenant importer requirement','text on all 12 SM rows','Matches the data-recording task type in the task groups. Verify this field mapping in the tenant preview.']);
sheet('Field Map',['Field / Topic','Source','Use in package','Integration rule'],mapRows,[36,65,55,92]);
// CSV outputs share the same underlying task and job definitions as the workbook.
const csvCell=v=>{const s=String(v??'');return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};
const matrices=[
 ['01_TaskGroups_Import.csv',tgHeaders,tgRows],
 ['02_ScheduledMaintenance_DRAFT_NoTriggers.csv',smHeaders,smRows],
 ['Task_Definitions.csv',defsHeaders,defs],
 ['Device_Inspection_Register.csv',deviceFields,deviceRows]
];
await wb.recalculate();
for(const [name,h,r] of matrices) await fs.writeFile(path.join(out,name),'\uFEFF'+[h,...r].map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n','utf8');
await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(out,'MHT_Controls_Maintenance_Plan.xlsx'));
await fs.writeFile(path.join(root,'data/maintenance-plan.json'),JSON.stringify({facility:'A26',jobs,tasks,observed_values_populated:false,proposed_cadences:true,live_writes_authorized:false,source_docs:mapRows.slice(12,15)},null,2)+'\n');
const qa=path.join(root,'validation/previews/maintenance');await fs.mkdir(qa,{recursive:true});
for(const [name,range] of [['Jobs','A1:H5'],['Tasks','G1:J4'],['Device Register','A1:H5'],['Field Map','A16:D18']]){
 const img=await wb.render({sheetName:name,range,scale:1.25,format:'png'});await fs.writeFile(path.join(qa,name.replaceAll(' ','_')+'.png'),new Uint8Array(await img.arrayBuffer()));
}
console.log(JSON.stringify({jobs:jobs.length,groups:jobs.length,tasks:tasks.length,component_groups:components.length,files:matrices.map(x=>x[0]),workbook:'MHT_Controls_Maintenance_Plan.xlsx',live_changes:false}));
