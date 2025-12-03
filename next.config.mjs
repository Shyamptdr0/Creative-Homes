/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: "20mb",  // This is valid
		},
	},
};

export default nextConfig;
