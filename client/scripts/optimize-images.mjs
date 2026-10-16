import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const assetsDir = path.resolve("src/assets/images/hero");
const outputDir = path.resolve("optimized-images");

const imageNames = [
  "hero-dubai.webp",
  "hero-bali.webp",
  "hero-singapore.webp",
  "hero-thailand.webp",
  "hero-japan.webp",
  "hero-bali-pic.webp",
];

await fs.mkdir(outputDir, { recursive: true });

for (const imageName of imageNames) {
  const inputPath = path.join(assetsDir, imageName);
  const outputPath = path.join(outputDir, imageName);

  try {
    const original = await fs.stat(inputPath);

    await sharp(inputPath)
      .rotate()
      .resize({
        width: 1920,
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
        effort: 5,
      })
      .toFile(outputPath);

    const optimized = await fs.stat(outputPath);

    const saved = ((1 - optimized.size / original.size) * 100).toFixed(1);

    console.log(
      `${imageName}: ${(original.size / 1024 / 1024).toFixed(2)} MB → ${(optimized.size / 1024 / 1024).toFixed(2)} MB (${saved}% smaller)`,
    );
  } catch (error) {
    console.error(`Failed to optimize ${imageName}: ${error.message}`);
  }
}
