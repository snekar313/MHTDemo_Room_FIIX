"""Offline checks for the asset-only draft. Does not validate Fiix runtime behavior."""
from pathlib import Path
import csv,json,hashlib,sys
ROOT=Path(__file__).resolve().parents[1]
def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8'))
def validate(assets):
    errors=[]; codes=[a['asset_id'] for a in assets]; ids=set(codes); seen=set()
    if len(ids)!=len(codes): errors.append('duplicate asset code')
    if any(x in ids for x in ['A26','BHQ']): errors.append('existing facility included as update row')
    for a in assets:
        if not a['asset_id'].startswith('IAB-'): errors.append('unexpected code namespace: '+a['asset_id'])
        if a['parent_id'] not in seen|{'A26'}: errors.append('missing or out-of-order parent: '+a['asset_id'])
        if a['parent_id']==a['asset_id']: errors.append('self parent')
        parent=next((x for x in assets if x['asset_id']==a['parent_id']),None)
        if parent and parent['name']==a['name']: errors.append('child name equals parent name')
        if a['quantity_estimate']<=0: errors.append('invalid quantity')
        if not a['evidence']: errors.append('missing provenance')
        if a['catalog_number_verified'] is not None: errors.append('unreviewed verified catalog number')
        seen.add(a['asset_id'])
    return errors
def main():
    assets=read('data/assets.json'); errors=validate(assets)
    manifest=read('sources/manifest.json'); srcids={s['source_id'] for s in manifest}
    for a in assets:
        for e in a['evidence']:
            if e['source_id'] not in srcids: errors.append('unknown source')
    for s in manifest:
        if s.get('path') and hashlib.sha256((ROOT/s['path']).read_bytes()).hexdigest()!=s['sha256']: errors.append('source hash mismatch '+s['source_id'])
    profile=read('data/tenant-profile.json')['Assets.csv']
    hdr=profile['headers']; ci=hdr.index('Code'); ni=hdr.index('Name')
    supplied_codes={r['values'][ci] for r in profile['rows'] if len(r['values'])>ci and r['values'][ci]}
    supplied_pairs={(r['values'][ni],r['values'][ci]) for r in profile['rows'] if len(r['values'])>ci}
    for a in assets:
        if a['asset_id'] in supplied_codes or (a['name'],a['asset_id']) in supplied_pairs: errors.append('collision with supplied tenant export '+a['asset_id'])
    p=ROOT/'outputs/new-assets-only/Assets.csv'
    if not p.exists(): errors.append('asset CSV missing')
    else:
        with p.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.reader(f))
        expected=[h for h in read('schemas/fiix-assets-template-columns.json')['headers'] if h!='*Any Custom Fields*']
        if rows[0]!=expected: errors.append('template header mismatch')
        if len(rows)-1!=len(assets): errors.append('row count mismatch')
        code_idx=expected.index('Asset Code'); parent_idx=expected.index('Location Code')
        for row,a in zip(rows[1:],assets):
            if len(row)!=len(expected): errors.append('CSV column count mismatch')
            if row[code_idx]!=a['asset_id'] or row[parent_idx]!=a['parent_id']: errors.append('CSV hierarchy mismatch')
            if any('"' in v or '\r' in v or '\n' in v for v in row): errors.append('template-prohibited quote/newline in field')
    result=dict(status='PASS' if not errors else 'FAIL',scope='offline structure, source hashes, CSV roundtrip, and supplied-export collision checks only',errors=errors,asset_rows=len(assets),source_hashes_checked=sum(bool(s.get('path')) for s in manifest),existing_facility='A26',existing_facility_import_rows=0,supplied_asset_rows=profile['nonblank_data_rows'],full_tenant_collision_check='BLOCKED: supplied asset export is incomplete',fiix_import='NOT_EXECUTED',native_IAB='NOT_GENERATED')
    (ROOT/'validation/results.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8'); print(json.dumps(result)); return bool(errors)
if __name__=='__main__': sys.exit(main())
