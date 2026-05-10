import {Geist, Geist_Mono} from "next/font/google";
import "../globals.css";
import HeaderPage from "@/app/(client)/components/header";
import FooterPage from "@/app/(client)/components/footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "Urban Landscape | Modern Living Spaces",
	description: "Designing and building the future of urban living.",
};

import SmoothScroll from "@/app/(client)/components/SmoothScroll";

export default function ClientLayout({children}) {
	return (
		<html lang="en">
		<body
			className={`${geistSans.variable} ${geistMono.variable} antialiased`}
		>
		<SmoothScroll>
			<HeaderPage isGlobal={true}/>
			{children}
			<FooterPage isGlobal={true}/>
		</SmoothScroll>
		</body>
		</html>
	);
}
