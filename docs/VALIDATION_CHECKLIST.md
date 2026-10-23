# Validation and import checklist

## Offline checks

- [x] Original sources copied and hashed, with source-row provenance.
- [x] Asset-only release: 46 proposed new rows and no facility/update rows.
- [x] A26 facility/category/parent independently observed in the live browser.
- [x] Unique new codes and parent-before-child ordering; no imported A26 or BHQ row.
- [x] Column order follows supplied official template, excluding its custom-field placeholder.
- [x] Source quantity estimates and candidate families explicitly labeled; verified fields empty.
- [x] CSV parsed back and matched to canonical identities and hierarchy.
- [x] No field-value double quotes or multiline content prohibited by supplied reference.
- [x] No collisions against supplied two-row asset export. This is limited coverage.

Workbook saved-value comparison and visual QA are recorded in validation/results.json / workbook-qa.json when performed. A PASS means only the stated check passed in the stated environment.

## Before importing

- [ ] Obtain a complete current tenant asset export, including asset codes, names and parents. Recheck both codes and name/code pairs. Current coverage is insufficient to guarantee no overwrite.
- [ ] Reconcile any partial previous import in the IAB-20261023- namespace; never blindly reupload.
- [ ] Confirm root belongs under A26 and review the 39 proposed component groups and estimated quantities.
- [ ] Review equipment category defaults; blank Category is not a validated classification choice for this tenant.
- [ ] Verify the current import wizard maps Asset Name, Asset Code and Location Code as documented. Inspect blank-field behavior and any update options.
- [ ] Run a separately authorized small parent-first test and verify created records and hierarchy. If the tool cannot reject existing matches, require complete collision evidence before proceeding.
- [ ] Confirm no existing tenant records will be updated in the actual preview; stop on collisions, update counts, missing parents, unrecognized fields or unexplained warnings.
- [ ] For full release, verify imported counts, sample each skid's parent, compare exports after import and preserve logs/screenshots. Keep created-record IDs for reconciliation. Do not delete existing assets as rollback.

No Fiix import or live data mutation has been performed. Task-group/work-order exports remain outside current scope.

## Engineering and Cloud gates

- [ ] Both missing TXT guide copies reconciled.
- [ ] Exact product names, catalog numbers, ratings, firmware and quantity census supported by evidence.
- [ ] IAB/PST software version recorded and native project saved/reopened/validated if native delivery is requested.
- [ ] Actual network configuration/port evidence supports any as-built diagram.
- [ ] Repository publication independently verified.
- [ ] Cloud environment configured and a validation run executed remotely; local checks do not satisfy this gate.
