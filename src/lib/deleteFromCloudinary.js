import cloudinary from "./cloudinary";

export const deleteFromCloudinary = async (fileUrl) => {
	try {
		if (!fileUrl) return;

		const afterUpload = fileUrl.split("/upload/")[1];
		if (!afterUpload) return;

		// Remove version like v12345/
		const noVersion = afterUpload.replace(/^v[0-9]+\//, "");

		// Remove extension
		const withoutExt = noVersion.substring(0, noVersion.lastIndexOf(".")) || noVersion;

		const publicId = withoutExt.split("?")[0];
		console.log("🆔 Cloudinary publicId:", publicId);

		// ✅ Detect file type
		let resourceType = "image";
		if (/\.(mp4|mov|avi|mkv)$/i.test(fileUrl)) resourceType = "video";

		const result = await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
			invalidate: true,
		});

		console.log("✅ Cloudinary delete result:", result);
		return result;

	} catch (err) {
		console.error("❌ Cloudinary delete error:", err);
	}
};
