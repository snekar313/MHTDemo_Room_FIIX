# Fiix-Demo-Room-Integrated-Architecture

Repository: `snekar313/MHTDemo_Room_FIIX`. This project consolidates the IAB project builder, proposed topology, seven original photos, prior Fiix asset/task workbooks, destination tenant exports, and the supplied Fiix asset import template.

## Current deliverable: new assets only

Use the three CSVs in `outputs/new-assets-only/` in order: **01_Demo_Wall.csv** (1 row), **02_Process_Skids.csv** (6 rows), then **03_Component_Groups.csv** (39 rows). Complete and verify each import before uploading the next. See [staged import instructions](docs/STAGED_ASSET_IMPORT.md). The combined CSV and matching review workbook are reference-only after the reported unknown-parent errors. The previous Assets.csv is superseded.

The draft contains 46 records: one demo-wall parent, six skids, and 39 component groups from `Rockwell_Demo_Room_IAB_Project_Builder.xlsx`. Component groups retain estimated quantities. A group of 12 pushbuttons is one proposed maintainable group, not 12 individually verified devices.

The existing facility **Mc-Mc Madison Heights Demo Room (A26)** was confirmed in the live MMG DIGITAL tenant on 2026-10-23. Its category is **Locations And Facilities**, and its parent is **Michigan (BHQ)**. Neither existing facility is included as an import row.

Hierarchy: `A26 -> IAB-DEMO-ROOM -> IAB-SKID-01..06 -> component groups`. The official template's **Location Code** holds the parent asset code. Parents precede children in the output.

New codes use `IAB-`. Do not regenerate a different namespace on every rerun: once any rows are imported, reconcile their tenant identities before rebuilding or repeating an import. Otherwise repeated uploads can create duplicates.

## What has and has not been validated

Offline checks cover unique codes, source hashes, CSV integrity, stage dependencies, no A26/BHQ update rows, and collisions against the supplied two-row asset export. The workbook has been rendered and its saved values checked against the reference CSV. **A full-tenant collision check has not been performed. The user reported a failed single-file import; the corrected staged imports have not been executed by the agent.** No native `.IAB` file has been generated or opened in IAB/PST.

The staged files use six populated official fields: Asset Name, Asset Code, Category, Location Code, Asset Description and Notes. Unused blank fields and the custom-field placeholder are omitted. The wall uses the observed tenant category Locations And Facilities. Skids and components explicitly use Equipment, also observed in the tenant. Candidate catalog families remain labeled UNVERIFIED in Notes; no verified model/serial/procurement data is invented. The 2023-06-13 template remains a reference, not proof of tenant acceptance.

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
outputs/new-assets-only/       Three import batches, combined reference and review workbook
tools/                         Repeatable build and offline validation
validation/                    Results and readiness limitations
diagrams/                      Proposed logical topology and asset hierarchy
```

## Rebuild and validate

The offline validator uses Python 3 standard library: `python tools/validate.py`.
GitHub Actions runs this validator and the hierarchy guardrail tests on Linux. This remote check is separate from a Codex Cloud environment and from a Fiix import.
The asset builder uses Node.js and `@oai/artifact-tool`: `node tools/build_assets.mjs`. The authoring environment supplies this package; on another environment, provision an approved package version before rebuilding. Do not assume the desktop's runtime path exists in Cloud. No Fiix credentials are required for local generation or validation.

Two user-referenced TXT guide copies are missing. Their contents have not been reconstructed or silently substituted. The prior chat is summarized with attribution in the source register; ChatGPT-generated claims remain unverified until supported by source evidence.
