import cloudinary from "./cloudinary";


export const uploadToCloudinary = async (buffer, folder = "drawings") => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder,
				resource_type: "auto",
			},
			(err, result) => {
				if (err) {
					console.error("❌ Cloudinary Upload Error", err);
					return reject(err);
				}
				resolve(result.secure_url);
			}
		);

		uploadStream.end(buffer);
	});
};
