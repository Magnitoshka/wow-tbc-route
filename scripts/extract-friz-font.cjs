const path = require("node:path");
const extract = require("extract-zip");

const zip = path.resolve(process.cwd(), "public", "fonts", "friz-quadrata-tt.zip");
const out = path.resolve(process.cwd(), "public", "fonts");

extract(zip, { dir: out })
  .then(() => {
    console.log(`Extracted to: ${out}`);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
