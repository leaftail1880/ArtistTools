// @ts-check

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const source = "./Source Images/";
const output = "./Compressed Images/";

await fs.rm(output, { force: true, recursive: true });
await fs.mkdir(output);

for (const filename of await fs.readdir(source)) {
	console.log("Compressing", filename);
	const file = path.join(source, filename);

	const resized = await resize(file, mb(2));

	fs.writeFile(path.join(output, filename), resized);
}

/** @param {number} mb */
function mb(mb) {
	//     mb    kb    bytes
	return mb * 1024 * 1024;
}

/** @param {Buffer | string} buffer */
async function resize(buffer, size = mb(2), quality = 98, drop = 2) {
	const done = await sharp(buffer)
		// .resize({
		// 	width: 1000,
		// 	height: 1000,
		// 	fit: sharp.fit.inside,
		// })
		.jpeg({ quality })
		.toBuffer();

	if (done.byteLength > size) return resize(buffer, size, quality - drop, drop);

	return done;
}
