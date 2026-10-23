"""Validate the authored controls maintenance package offline; no Fiix writes."""
from pathlib import Path
from collections import Counter
import json,csv,hashlib,sys
ROOT=Path(__file__).resolve().parents[1]
def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8'))
def csvrows(p):
    with (ROOT/'outputs/controls-maintenance'/p).open(encoding='utf-8-sig',newline='') as f:
        reader=csv.DictReader(f); return reader.fieldnames,list(reader)
def main():
    plan=read('data/maintenance-plan.json'); assets=read('data/assets.json'); ids={a['asset_id'] for a in assets}
    skids={a['asset_id'] for a in assets if a['asset_class']=='process_skid'}; children={a['asset_id']:a['parent_id'] for a in assets if '-B' in a['asset_id']}
    errors=[]; jobs=plan['jobs'];tasks=plan['tasks']; jobcodes={j['code'] for j in jobs}; groups={j['group'] for j in jobs}
    if len(jobs)!=12 or len(jobcodes)!=12 or len(groups)!=12: errors.append('job/group identity count mismatch')
    if len(tasks)!=132 or len({t['task_id'] for t in tasks})!=132: errors.append('task identity count mismatch')
    for skid in skids:
        if sorted(j['cadence_months'] for j in jobs if j['skid_code']==skid)!=[1,3]: errors.append('missing skid cadence '+skid)
    for j in jobs:
        if j['skid_code'] not in skids: errors.append('job targets non-skid')
        own=[t for t in tasks if t['sm_code']==j['code']]
        if len(own)!=j['task_count'] or len(own)!=(10 if j['cadence_months']==1 else 12): errors.append('task count mismatch')
        if [t['sequence'] for t in own]!=list(range(1,len(own)+1)): errors.append('task sequence mismatch')
        if j['start_date'] is not None or j['assigned_user'] is not None or j['desired_state']!='Paused; no trigger': errors.append('unapproved activation/assignment')
        if set(j['target_component_codes'])!={k for k,v in children.items() if v==j['skid_code']}: errors.append('component scope mismatch')
    for t in tasks:
        if t['sm_code'] not in jobcodes or t['group'] not in groups or t['task_type']!='text' or t['observations'] is not None: errors.append('invalid task identity/type or fabricated observation')
        if any(k not in children or children[k]!=t['skid_code'] for k in t['target_codes']): errors.append('cross-skid task scope')
    h,tg=csvrows('01_TaskGroups_Import.csv')
    if h!=['Task group name','Task description','Task type']: errors.append('task group headers differ from documented subset')
    if len(tg)!=len(tasks): errors.append('task group CSV row count')
    expected_counts=Counter(t['group'] for t in tasks)
    if Counter(r['Task group name'] for r in tg)!=expected_counts: errors.append('task group CSV grouping mismatch')
    for row,task in zip(tg,tasks):
        if not row['Task description'].startswith(task['task_id']+'. ') or row['Task type']!='text': errors.append('task import sequence/type mismatch')
        if '\n' in row['Task description'] or '\r' in row['Task description'] or '"' in row['Task description']: errors.append('unsupported task content formatting')
    h,sm=csvrows('02_ScheduledMaintenance_DRAFT_NoTriggers.csv')
    expected=['SM Code','SM Description','Asset Code','Maintenance Type','Start As Work Order Status','Priority','Create Work Order Even If There Are Open Ones','Task Group','Task Type']
    if h!=expected or any('Trigger' in x or x=='SM Status' for x in h): errors.append('SM headers or trigger policy mismatch')
    if len(sm)!=12 or {r['SM Code'] for r in sm}!=jobcodes: errors.append('SM CSV code/count mismatch')
    for r,j in zip(sm,jobs):
        if r['Asset Code']!=j['skid_code'] or r['Task Group']!=j['group'] or r['Create Work Order Even If There Are Open Ones']!='false': errors.append('SM association/duplicate-WO policy mismatch')
        if r.get('Task Type')!='text' or j.get('task_type')!='text': errors.append('missing or incorrect required SM Task Type')
        if r.get('Maintenance Type')!='Preventative' or j.get('maintenance_type')!='Preventative': errors.append('Maintenance Type must be Preventative as requested')
    h,register=csvrows('Device_Inspection_Register.csv')
    if len(register)!=39 or {r['Asset Code'] for r in register}!=set(children): errors.append('device register scope mismatch')
    if any(v for r in register for k,v in r.items() if k not in h[:6]): errors.append('fabricated actual device reading')
    source_state='local-only source profile unavailable on runner'
    profile=ROOT/'data/maintenance-source-profile.json'
    if profile.exists():
        p=read('data/maintenance-source-profile.json')
        if jobcodes & set(p['existing_codes']): errors.append('collision with supplied scheduled-maintenance report')
        private=ROOT/p['private_copy']
        if private.exists():
            if hashlib.sha256(private.read_bytes()).hexdigest()!=p['sha256']: errors.append('raw SM source changed')
            source_state='PASS: local-only raw export hash matches; no proposed code matches supplied 11 rows'
    result={'status':'PASS' if not errors else 'FAIL','scope':'Offline identities, counts, sequences, asset scope and documented header subsets only','errors':errors,'jobs':12,'task_groups':12,'tasks':132,'device_groups':39,'source_check':source_state,'tenant_import_validation':'NOT_EXECUTED','observations_collected':False,'schedule_triggers_included':False,'activation':'NOT_PERFORMED'}
    (ROOT/'validation/maintenance-results.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8'); print(json.dumps(result)); return bool(errors)
if __name__=='__main__':sys.exit(main())
