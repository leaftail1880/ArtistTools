import fsExtra from "fs-extra";
import sharp from "sharp";

for (const file of fsExtra.readdirSync("Source Images")) {
	await sharp(`Source Images/${file}`)
		.grayscale()
		.toFile(`Gray Images/${file}`);
}
