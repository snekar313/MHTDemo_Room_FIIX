# Corrected asset import: three separate batches

The user reported Unknown location code errors for rows 3-47 of the combined file. All reported failures reference a parent also defined in that same file. The parent graph is internally valid, but that import attempt did not resolve new parents within the upload. The precise tenant/importer cause is unconfirmed.

Fiix documentation describes single-file parent/child hierarchy imports. Therefore this incident does not establish a universal restriction in Fiix. Separate batches are the conservative workaround for the observed failure: each batch refers only to parents that must already be saved before its upload.

## Import sequence

1. **01_Demo_Wall.csv**: 1 new root, IAB-DEMO-ROOM, under existing A26. Complete the import and confirm the saved code and parent before continuing. If IAB-DEMO-ROOM already exists from a partial attempt, verify its identity and parent and skip this file. Do not run it as an update.
2. **02_Process_Skids.csv**: 6 skids under IAB-DEMO-ROOM. Import only after step 1 is verified. Confirm all six saved codes before continuing.
3. **03_Component_Groups.csv**: 39 component groups under the six saved skid codes. Import only after step 2 is verified.

Do not upload all three files together. Complete and verify one import before uploading the next file. Stop if any expected new code already exists; reconcile partial imports and prepare a reduced create-only batch rather than blindly rerunning. Existing A26/BHQ records are never included as rows.

Use explicit mapping: Asset Name -> Asset Name; Asset Code -> Asset Code; Category -> Category; Location Code -> parent location code; Asset Description -> description; Notes -> notes. No code indentation or date segment is present. Root category is Locations And Facilities. Skids and component groups use the observed Equipment category. These are maintainable equipment groups, not additional facility rows.

The new CSVs contain six populated template fields. Unused blank columns were removed because Fiix documents blank-field behavior as a data-loss risk. Verified device catalog/model/serial fields remain unpopulated in canonical data; candidate families and estimated quantities remain labeled in Notes.

REFERENCE_ONLY_All_Assets.csv and the review workbook show the full 46-row set for comparison. Do not use the combined reference CSV as the next import attempt. The previous Assets.csv is superseded and removed from the current output directory.

## Evidence and limits

On 2026-10-23 a read-only browser search for IAB- in All Assets, Category: Assets, returned No records. This is a scoped search observation, not a complete tenant export or a guarantee against concurrent changes. The Equipment category was observed in the Equipment list filter. The agent did not upload, import, update or delete tenant records.

Offline checks cover 1/6/39 stage counts, exact coverage of 46 canonical codes, unchanged parent links, explicit categories, and parents appearing only in earlier stages or the existing A26 allowlist. Actual tenant acceptance remains untested until each stage is executed and read back.

Official references reviewed 2026-10-23:

- https://helpdesk.fiixsoftware.com/hc/en-us/articles/211460246-Import-asset-child-and-grandchild-assets (parent-code mapping, removal of unused blank columns and small test imports).
- The user-supplied Fiix - Asset Import Template - 20230613.xlsx (Reference Page and Import Sheet).
