# Fiix-Demo-Room-Integrated-Architecture

Repository: `snekar313/MHTDemo_Room_FIIX`. This project consolidates the IAB project builder, proposed topology, seven original photos, prior Fiix asset/task workbooks, destination tenant exports, and the supplied Fiix asset import template.

## Current deliverable: new assets only

Use `outputs/new-assets-only/Assets.csv` for the proposed asset import. `Fiix_IAB_New_Assets_A26.xlsx` is the matching review workbook with one Import Sheet. It is a fresh workbook based on the supplied template's columns, not a modified original template.

The draft contains 46 records: one demo-wall parent, six skids, and 39 component groups from `Rockwell_Demo_Room_IAB_Project_Builder.xlsx`. Component groups retain estimated quantities. A group of 12 pushbuttons is one proposed maintainable group, not 12 individually verified devices.

The existing facility **Mc-Mc Madison Heights Demo Room (A26)** was confirmed in the live MMG DIGITAL tenant on 2026-10-23. Its category is **Locations And Facilities**, and its parent is **Michigan (BHQ)**. Neither existing facility is included as an import row.

Hierarchy: `A26 -> IAB-20261023-DEMO-ROOM -> IAB-20261023-SKID-01..06 -> component groups`. The official template's **Location Code** holds the parent asset code. Parents precede children in the output.

New codes use `IAB-20261023-`. Do not regenerate a different namespace on every rerun: once any rows are imported, reconcile their tenant identities before rebuilding or repeating an import. Otherwise repeated uploads can create duplicates.

## What has and has not been validated

Offline checks cover unique codes, parent order, source hashes, CSV roundtrip, template headers, no A26/BHQ update rows, and collisions against the supplied two-row asset export. The workbook has been rendered and its saved values checked against the CSV. **A full-tenant collision check and a Fiix import have not been performed.** No native `.IAB` file has been generated or opened in IAB/PST.

The 2023-06-13 template is a user-supplied official reference, not evidence that every field is supported by this tenant today. Its literal `*Any Custom Fields*` placeholder is omitted; the other 27 columns retain their order. No custom field is invented. The new demo-wall root uses the observed tenant category `Locations And Facilities`. Equipment categories are blank, allowing the template's documented default; review category placement in the import preview before importing. Verified Model, serial, supplier links, accounting fields, and catalog numbers are left blank. Candidate families appear only as explicitly unverified Notes and canonical data.

Task groups, task definitions, assignments, and commissioning work orders are retained as **future planning context** under `data/`; they are not exported or imported in this asset-only release.

## Start here

- [Reusable Cloud project prompt](prompts/CODEX_CLOUD_PROJECT_PROMPT.md)
- [Validation and import checklist](docs/VALIDATION_CHECKLIST.md)
- [Source and conflict register](docs/PROVENANCE_AND_CONFLICTS.md)
- [Canonical data contract](docs/ASSET_SCHEMA.md)
- [Network plan](docs/NETWORK_PLAN.md)
- [Staged deliverables](docs/STAGED_DELIVERABLES.md)
- [Cloud collaboration](docs/CLOUD_COLLABORATION.md)

## Folder layout

```text
AGENTS.md                      Repository-wide working instructions
prompts/                       Reusable project execution prompt
docs/                          Decisions, mapping, validation and delivery stages
schemas/                       Internal asset contract and supplied template columns
sources/manifest.json          Original paths, SHA-256 hashes and missing sources
sources/originals/             Preserved original IAB, network and Fiix workbooks
sources/photos/                Original wall/panel images and local labeled variants
sources/tenant/mmg/            Unchanged destination exports and official template
sources/browser/               Recorded live facility observation
data/assets.json               Canonical proposed asset hierarchy
data/bom.json                  Candidate IAB/PST BOM; no software validation claim
data/source-extracts.json       Source worksheet values, formulas and row locators
data/task*.json                Future maintenance context; no import in current scope
data/network-plan.json         Provisional network zones
outputs/new-assets-only/       Current asset CSV and matching review workbook only
tools/                         Repeatable build and offline validation
validation/                    Results and readiness limitations
diagrams/                      Proposed logical topology and asset hierarchy
```

## Rebuild and validate

The offline validator uses Python 3 standard library: `python tools/validate.py`.
The asset builder uses Node.js and `@oai/artifact-tool`: `node tools/build_assets.mjs`. The authoring environment supplies this package; on another environment, provision an approved package version before rebuilding. Do not assume the desktop's runtime path exists in Cloud. No Fiix credentials are required for local generation or validation.

Two user-referenced TXT guide copies are missing. Their contents have not been reconstructed or silently substituted. The prior chat is summarized with attribution in the source register; ChatGPT-generated claims remain unverified until supported by source evidence.
