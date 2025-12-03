import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function createImage(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.setAttribute("crossOrigin", "anonymous");
		image.onload = () => resolve(image);
		image.onerror = (err) => reject(err);
		image.src = url;
	});
}

