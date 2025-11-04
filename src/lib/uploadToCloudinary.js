import cloudinary from "./cloudinary";

export const uploadToCloudinary = (buffer, folder = "materials") => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.upload_stream({ folder }, (err, result) => {
			if (err) reject(err);
			else resolve(result.secure_url);
		}).end(buffer);
	});
};
