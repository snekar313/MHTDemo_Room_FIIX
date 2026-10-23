# MHT Demo Room controls maintenance package

This package contains 12 skid-specific task groups with 132 tasks: 10 monthly condition checks and 12 quarterly configuration checks per skid. These support 12 proposed scheduled-maintenance definitions. Proposed intervals and labor estimates need controls-owner approval; no actual readings, completed inspections or live schedule creation are claimed.

All 12 job definitions use Maintenance Type Preventative per user request. Task Type remains text for recording inspection observations; it is a separate Fiix field. Verify the exact Preventative lookup exists in the destination tenant before importing.

## Deliverables and sequence

1. MHT_Controls_Maintenance_Plan.xlsx: Jobs, ordered Tasks, Device Register and Field Map for review.
2. 01_TaskGroups_Import.csv: documented Fiix task-group columns, one row per task. Import only after checking existing group names. The reference Task_Definitions.csv must not be imported a second time.
3. 02_ScheduledMaintenance_DRAFT_NoTriggers.csv: SM columns plus the user-reported required Task Type field, set to text on all 12 rows. The file references existing skid codes and groups. Task groups and assets must exist first. It contains no trigger fields or activation dates. Import acceptance/default state are untested.
4. Device_Inspection_Register.csv: 39 component-group seed rows with blank actual values. Add supporting rows for each physical device/position/interface within a group. Do not create new asset codes as a side effect.
5. prompts/FIIX_CONTROLS_MAINTENANCE_INTEGRATION_PROMPT.md: preflight, duplicate prevention, import mapping, paused-state verification and deferred activation.

The asset template supplied in sources is used for identity and parent fields. It does not define maintenance imports. Hardware revision, firmware, actual IP/mask/gateway/MAC, port, backup and baseline evidence are observation fields; they are not assumed to be configured Fiix custom fields.

The current official documentation says that an SM import can reference one task group that already exists and cannot update existing SMs. One complete group per planned SM avoids losing tasks to that limitation. Task response type text captures actual values and exception evidence without configuring automatic follow-on work orders or notifications. Global category and maintenance-type task-group links are omitted to avoid applying these jobs outside this wall.

The user's ScheduledMaintenanceList.csv was copied locally under ignored sources/private/maintenance and profiled by hash. Its eleven historical rows are only a duplicate-screening reference. The raw new tenant export is not authorized for public publication by the earlier source-set decision and is not included in Git. Only headers/codes needed for the local review are profiled; future integration must obtain a current complete tenant inventory.

No live Fiix writes are part of generating this package. The reusable prompt describes how a later authorized run can create new paused definitions. No schedule is to be activated without a separately approved date/time, interval, owner and timezone. Verify the actual tenant behavior before submitting any importer that defaults to running.

Sources: canonical IAB asset/BOM scope; prior maintenance context; user-supplied ScheduledMaintenanceList.csv; official asset import template; Fiix Import task groups and Import scheduled maintenance documentation reviewed 2026-10-23. Source links and field-specific rules are included in the workbook Field Map and integration prompt.
