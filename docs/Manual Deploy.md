Use the built artifact from cpanel. Do not zip the repo root. Zip the contents inside that folder so the archive root contains these items directly:

.next
node_modules
public
scripts
data
app.js
server.js
package.json
Skip .env and .env.production unless you explicitly want to overwrite the server env with your local one. I would not upload those manually.

In cPanel, clean the app root at /home/beatlesb/cms.mikadee.oo.gd like this before extracting:

Delete .next
Delete node_modules
Delete scripts
Delete app.js
Delete server.js
Delete package.json
Delete everything in public except public/uploads
Delete src, prisma, docs, .git, old deploy zips, old extractor files if they are still there
Keep these:

.env
.env.production if you use it on the server
public/uploads
data if it contains server-side data you want to preserve