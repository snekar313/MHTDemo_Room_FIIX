# Canonical asset contract and Fiix mapping

The machine-readable internal schema is schemas/asset.schema.json. This is a project contract, not a vendor schema.

- `asset_id`: stable proposed Fiix Asset Code. The current namespace is IAB-.
- `parent_id`: proposed parent Asset Code. A26 is an explicit external existing parent. Every other parent must be an earlier canonical row.
- `name`: proposed Asset Name; distinct from parent name.
- `asset_class`: internal engineering classification, not a tenant category lookup.
- `record_status`: proposed / estimated / verified / conflicting. Current component rows are estimated.
- `quantity_estimate`: estimated contents of a maintainable group; not a count of separately created Fiix rows.
- `catalog_number_verified`, `model_verified`: exact verified fields only; currently null.
- `candidate_catalog_family`, `manufacturer_candidate`: inherited source claims; never procurement confirmation.
- `description`, `photo`: source description and photo/region reference.
- `evidence`: source_id, locator, claim_status. Verification of one field does not verify all fields.
- `verification_action`: concrete next evidence required.
- `category_tenant`: exact observed tenant category name. The wall uses Locations And Facilities; skids and component groups use Equipment.

Asset Name maps to name; Asset Code to asset_id; Location Code to parent_id; Asset Description to description. Notes carry source row, estimated quantity and labeled candidate family. Only these five fields and Category are included in the staged CSVs. Unused optional fields are omitted. There is no Quantity column in the supplied asset import template, so quantity estimates remain Notes and canonical data.

Use data/aliases.json for explicit source IDs. Prior Fiix asset rows are retained in source-extracts.json, not automatically matched to BOM groups. A class similarity is insufficient evidence to merge physical devices.

Related entities: bom.json references asset_id; task-assignments.json joins canonical assets and task-groups.json; tasks.json references group_id. Network zones remain independent planning entities until device-level assignments are approved. Tenant profile data retains exact headers, rows, export scope and blank trailing columns. Formula text and cached values remain separate in source extracts; no formula recalculation is claimed.
