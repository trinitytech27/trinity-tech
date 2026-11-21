import sharp from "sharp";
import fs from "node:fs/promises";
for (const f of await fs.readdir("public/media"))
  if (f.endsWith(".png") && f !== "favicon.png")
    await sharp("public/media/" + f)
      .resize(1440, null, {
        withoutEnlargement: true,
      })
      .webp({ quality: 86 })
      .toFile("public/media/" + f.replace(".png", ".webp"));
// Logo + favicons are generated from public/assets/trinity-logo.svg
