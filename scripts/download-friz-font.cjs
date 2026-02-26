const fs = require("node:fs");
const https = require("node:https");
const path = require("node:path");

const url = "https://static.wfonts.com/download/data/2015/06/23/friz-quadrata-tt/friz-quadrata-tt.zip";
const outDir = path.resolve(process.cwd(), "public", "fonts");
const outZip = path.join(outDir, "friz-quadrata-tt.zip");

fs.mkdirSync(outDir, { recursive: true });

const file = fs.createWriteStream(outZip);
https
  .get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Download failed with status ${res.statusCode}`);
      process.exit(1);
    }
    res.pipe(file);
    file.on("finish", () => {
      file.close(() => {
        console.log(`Saved: ${outZip}`);
      });
    });
  })
  .on("error", (err) => {
    console.error(err.message);
    process.exit(1);
  });
