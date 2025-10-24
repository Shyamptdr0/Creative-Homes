"use client";

import React, {useState} from "react";
import Link from "next/link";
import Image from "next/image";
// Assuming these imports are correct for your file structure
import logo from "../../../../public/logo_1-removebg-preview.png";
import logoName from "../../../../public/logo_2-removebg-preview.png";
import {Button} from "@/components/ui/button";

export default function HeaderPage() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Toggle function for the mobile menu
	const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

	return (
		// Enhanced header styling: fixed position, light shadow, generous horizontal padding
		<header className="px-6 md:px-16 lg:px-20 py-4 bg-white border-b border-gray-200 sticky top-0 z-50 ">

			<div className="flex items-center justify-between">

				{/* Logo, Name, and Desktop Navigation Group */}
				<div className="flex items-center gap-2">

					{/* Logo and Name - Adjusted for cleaner alignment */}
					<div className="flex items-center">
						<Link href="/">
						<Image
							src={logo}
							alt="Logo"
							width={65} // Slightly larger logo
							height={45}
							className="object-contain"
						/>
						</Link>
						<Link href="/">
							<Image
								src={logoName}
								alt="Logo Name"
								width={130} // Consistent size
								height={55}
								className="object-contain pt-1"
							/>
						</Link>
					</div>

					{/* Desktop Navigation - Professional font and subtle link styling */}
					<nav className="hidden lg:flex items-center gap-10 text-base ml-12 font-sans font-medium">
						<Link
							href="/projects"
							className="text-gray-700 hover:text-blue-600 transition duration-150 tracking-wide"
						>
							Our Projects
						</Link>
						<Link
							href="/how-it-works"
							className="text-gray-700 hover:text-blue-600 transition duration-150 tracking-wide"
						>
							How it works
						</Link>

						<Link
							href="/services"
							className="text-gray-700 hover:text-blue-600 transition duration-150 tracking-wide"
						>
							Services
						</Link>
						<Link
							href="/about"
							className="text-gray-700 hover:text-blue-600 transition duration-150 tracking-wide"
						>
							About
						</Link>
						<Link
							href="/contact"
							className="text-gray-700 hover:text-blue-600 transition duration-150 tracking-wide"
						>
							Contact
						</Link>
					</nav>
				</div>


				{/* Actions Group (Button + Mobile Menu Toggle) */}
				<div className="flex items-center gap-4">

					{/* Contact Info (Desktop) - High-contrast professional button style */}
					<Button
						className="text-center items-center cursor-pointer hidden lg:block bg-lime-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg transition duration-200 uppercase text-sm tracking-wider">
						Book a meeting
					</Button>

					{/* Mobile Menu Button - Clean toggle design */}
					<button
						className="lg:hidden text-gray-800 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
						onClick={toggleMobileMenu}
						aria-label="Toggle Menu"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="2"
							stroke="currentColor"
							className="w-6 h-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Mobile Menu - Enhanced with soft hover and better separation */}
			{mobileMenuOpen && (
				<div
					className="absolute top-[100%] left-0 w-full bg-white shadow-xl flex flex-col items-center lg:hidden py-4 border-t border-gray-100">

					<Link
						href="/"
						className="text-gray-700 font-medium hover:bg-gray-100 w-full text-center py-3 px-4 transition-colors"
						onClick={toggleMobileMenu}
					>
						Home
					</Link>
					<Link
						href="/projects"
						className="text-gray-700 font-medium hover:bg-gray-100 w-full text-center py-3 px-4 transition-colors"
						onClick={toggleMobileMenu}
					>
						Our Projects
					</Link>
					<Link
						href="/about"
						className="text-gray-700 font-medium hover:bg-gray-100 w-full text-center py-3 px-4 transition-colors"
						onClick={toggleMobileMenu}
					>
						About
					</Link>
					<Link
						href="/services"
						className="text-gray-700 font-medium hover:bg-gray-100 w-full text-center py-3 px-4 transition-colors"
						onClick={toggleMobileMenu}
					>
						Services
					</Link>
					<Link
						href="/contact"
						className="text-gray-700 font-medium hover:bg-gray-100 w-full text-center py-3 px-4 transition-colors"
						onClick={toggleMobileMenu}
					>
						Contact
					</Link>

					{/* Contact text and Button for mobile */}
					<div className="mt-6 pt-4 border-t border-gray-100 w-full flex flex-col items-center px-4">
						<p className="text-gray-500 text-sm mb-3">Contact: +91-XXXXXXXXXX</p>
						<Button
							className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-200 w-full max-w-xs uppercase text-sm tracking-wider">
							Book a meeting
						</Button>
					</div>
				</div>
			)}
		</header>
	);
}