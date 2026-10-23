# GitHub and Cloud collaboration

Project title: Fiix-Demo-Room-Integrated-Architecture. User-created repository: https://github.com/snekar313/MHTDemo_Room_FIIX . The repository was verified public in the browser. On 2026-10-23 the user explicitly authorized keeping it public and including the current source set. No collaborator invitation or access-policy change is implied.

Use branches and reviewed changes; retain source files, manifest hashes and reproducible validation. Do not force-push over another contributor's work. Before publishing future tenant exports, check the current user's authorization rather than extending this source-set decision automatically. Keep credentials outside the repository.

Official OpenAI documentation checked on 2026-10-23 describes selecting GitHub repositories for a Cloud environment, reviewing setup/test results, publishing the environment, and then starting work: https://learn.chatgpt.com/docs/cloud . Account access and available setup controls must be confirmed in the actual user session.

For this project, first provision Python 3. The offline check is `python tools/validate.py`; no vendor application or tenant credentials are needed. For workbook regeneration, provide Node.js and the approved @oai/artifact-tool authoring dependency or equivalent authorized artifact runtime. Desktop runtime paths and junctions are local conveniences and must not be copied as Cloud paths.

Cloud smoke test: open the authorized repository/environment; verify source hashes; run the offline validator; report the exact commit, environment, command and result; read back an output and its validation report. A GitHub push is not evidence of this smoke test. Cloud cannot be assumed to provide Windows Rockwell IAB/PST or authenticated Fiix access.

Current scope does not authorize launching a new sidebar chat, inviting people, importing into Fiix, or configuring live devices. The prompt is reusable when the user starts the desired Cloud execution.
