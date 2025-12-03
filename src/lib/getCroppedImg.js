import { createImage } from "./utils";

export default async function getCroppedImg(imageSrc, croppedAreaPixels) {
	const image = await createImage(imageSrc);

	const canvas = document.createElement("canvas");
	canvas.width = croppedAreaPixels.width;
	canvas.height = croppedAreaPixels.height;

	const ctx = canvas.getContext("2d");

	ctx.drawImage(
		image,
		croppedAreaPixels.x,
		croppedAreaPixels.y,
		croppedAreaPixels.width,
		croppedAreaPixels.height,
		0,
		0,
		croppedAreaPixels.width,
		croppedAreaPixels.height
	);

	return new Promise((resolve) => {
		canvas.toBlob(
			(blob) => {
				resolve(blob);
			},
			"image/jpeg",
			1
		);
	});
}
