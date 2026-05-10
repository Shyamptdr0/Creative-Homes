"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Logo = () => (
	<div className="flex items-center gap-3">
		<svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
			<path d="M10 70V90H90V70" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M50 10L10 50H25V80H75V50H90L50 10Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M20 40L40 20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
			<path d="M30 50L50 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
		</svg>
		<span className="text-2xl font-black tracking-tighter text-white uppercase">
			Urban <span className="text-white/80 font-bold">Landscape</span>
		</span>
	</div>
);

export default function HeaderPage({ isGlobal = false }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	const [scrolled, setScrolled] = useState(false);
	const [mounted, setMounted] = useState(false);
	const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
	const isActive = (path) => pathname === path;

	useEffect(() => {
		setMounted(true);
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Form data for Book a Meeting
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		mobile: "",
		city: "",
		ownPlot: "",
		startTime: "",
		agree: false,
	});

	const cities = ["Indore", "Khargone", "Bhopal", "Mumbai"];

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		alert("✅ Meeting request submitted successfully!");
		setFormData({
			fullName: "",
			email: "",
			mobile: "",
			city: "",
			ownPlot: "",
			startTime: "",
			agree: false,
		});
	};



	if (isGlobal && pathname === "/") return null;

	return (
		<header
			className={`px-6 md:px-16 lg:px-20 py-4 left-0 w-full z-50 transition-all duration-700 transform ${mounted ? "translate-y-0" : "-translate-y-full"
				} ${pathname === "/"
					? "absolute top-0 bg-transparent border-none shadow-none"
					: "fixed top-0 bg-black shadow-2xl border-b border-white/10"
				}`}
		>
			<div className="flex items-center justify-between">
				{/* LOGO + NAVIGATION */}
				<div className="flex items-center gap-2">
					<div className="flex items-center">
						<Link href="/" className="flex items-center">
							<Logo />
						</Link>
					</div>

					{/* DESKTOP NAVIGATION */}
					<nav className="hidden lg:flex items-center gap-10 text-base ml-12 font-sans font-medium">
						{[
							{ name: "Our Projects", path: "/projects" },
							{ name: "How it works", path: "/how-it-works" },
							{ name: "Services", path: "/services" },
							{ name: "Cost Estimator", path: "/cost-estimator" },
						].map((link) => (
							<Link
								key={link.path}
								href={link.path}
								className={`group relative transition-all duration-300 tracking-wide pb-1 ${isActive(link.path)
										? "text-white font-bold"
										: "text-white/70 hover:text-white"
									}`}
							>
								{link.name}
								<span
									className={`absolute left-0 -bottom-[2px] h-[2px] rounded-full transition-all duration-300 ease-in-out ${isActive(link.path)
											? "w-full bg-white"
											: "w-0 bg-white group-hover:w-full"
										}`}
								></span>
							</Link>
						))}

						<NavigationMenu>
							<NavigationMenuList>
								<NavigationMenuItem>
									<NavigationMenuTrigger className="text-white/70 font-medium hover:text-white focus:text-white text-base cursor-pointer py-0 px-2 bg-transparent hover:bg-white/10 transition-colors">
										More
									</NavigationMenuTrigger>
									<NavigationMenuContent className="p-3 min-w-[200px] bg-white rounded-lg shadow-md border border-gray-100">
										<div className="flex flex-col space-y-2">
											<Link
												href="/client"
												className="block px-3 py-2 text-base text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600"
											>
												Login as Client
											</Link>
											<Link
												href="/contractor"
												className="block px-3 py-2 text-base text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600"
											>
												Login as Contractor
											</Link>
											<Link
												href="/about-us"
												className="block px-3 py-2 text-base text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600"
											>
												About Us
											</Link>
											<Link
												href="/contact-us"
												className="block px-3 py-2 text-base text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600"
											>
												Contact Us
											</Link>
										</div>
									</NavigationMenuContent>
								</NavigationMenuItem>
							</NavigationMenuList>
						</NavigationMenu>
					</nav>
				</div>

				{/* BOOK A MEETING BUTTON + MOBILE MENU */}
				<div className="flex items-center gap-4">
					{/* BOOK A MEETING MODAL */}
					<Dialog>
						<div className={`transition-all duration-500 transform ${scrolled ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-10 pointer-events-none"}`}>
							<DialogTrigger asChild>
								<Button className="cursor-pointer hidden lg:block bg-white hover:bg-white/90 text-primary font-bold py-2.5 px-6 rounded-lg shadow-lg transition duration-200 uppercase text-sm tracking-wider">
									Book a meeting
								</Button>
							</DialogTrigger>
						</div>

						<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-8 rounded-2xl">
							<DialogHeader>
								<DialogTitle className="text-2xl font-bold text-center mb-6">
									Book a Meeting
								</DialogTitle>
							</DialogHeader>

							<form className="space-y-6" onSubmit={handleSubmit}>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Full Name */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Full Name
										</label>
										<input
											type="text"
											name="fullName"
											value={formData.fullName}
											onChange={handleChange}
											placeholder="Enter your full name"
											required
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>

									{/* Email */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Email
										</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											placeholder="Enter your email"
											required
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>

									{/* Mobile */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Mobile Number
										</label>
										<input
											type="tel"
											name="mobile"
											value={formData.mobile}
											onChange={handleChange}
											placeholder="Enter your mobile number"
											required
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>

									{/* Choose City */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Choose City
										</label>
										<select
											name="city"
											value={formData.city}
											onChange={handleChange}
											required
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
										>
											<option value="">Select a city</option>
											{cities.map((city) => (
												<option key={city} value={city}>
													{city}
												</option>
											))}
										</select>
									</div>

									{/* Own a Plot */}
									<div className="lg:col-span-1">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Do you own a plot of land?
										</label>
										<div className="flex gap-6">
											<label className="flex items-center gap-2">
												<input
													type="radio"
													name="ownPlot"
													value="Yes"
													checked={formData.ownPlot === "Yes"}
													onChange={handleChange}
													required
													className="accent-primary"
												/>
												Yes
											</label>
											<label className="flex items-center gap-2">
												<input
													type="radio"
													name="ownPlot"
													value="No"
													checked={formData.ownPlot === "No"}
													onChange={handleChange}
													required
													className="accent-primary"
												/>
												No
											</label>
										</div>
									</div>

									{/* Start Time */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											I want to start construction in
										</label>
										<select
											name="startTime"
											value={formData.startTime}
											onChange={handleChange}
											required
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
										>
											<option value="">Select timeline</option>
											<option value="0-3 months">0-3 months</option>
											<option value="3-6 months">3-6 months</option>
											<option value="6-12 months">6-12 months</option>
											<option value="12+ months">12+ months</option>
										</select>
									</div>

									{/* Agreement */}
									<div className="flex items-center gap-2 lg:col-span-2">
										<input
											type="checkbox"
											name="agree"
											checked={formData.agree}
											onChange={handleChange}
											required
											className="accent-primary"
										/>
										<label className="text-sm text-gray-700">
											I agree to the Privacy Policy and Terms & Conditions.
										</label>
									</div>
								</div>

								{/* Submit */}
								<div className="text-center">
									<Button
										type="submit"
										className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-300"
									>
										Book a Meeting
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

					{/* MOBILE MENU TOGGLE */}
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
								d={
									mobileMenuOpen
										? "M6 18L18 6M6 6l12 12"
										: "M4 6h16M4 12h16M4 18h16"
								}
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* MOBILE MENU */}
			{mobileMenuOpen && (
				<div className="absolute top-[100%] left-0 w-full bg-white shadow-xl flex flex-col items-center lg:hidden py-4 border-t border-gray-100 animate-slideDown">
					{[
						{ name: "Home", path: "/" },
						{ name: "Our Projects", path: "/projects" },
						{ name: "How it works", path: "/how-it-works" },
						{ name: "Services", path: "/services" },
						{ name: "Cost Estimator", path: "/cost-estimator" },
						{ name: "Join as Client", path: "/join/client" },
						{ name: "Join as Contractor", path: "/join/contractor" },
						{ name: "About us", path: "/about-us" },
						{ name: "Contact us", path: "/contact-us" },
					].map((link) => (
						<Link
							key={link.path}
							href={link.path}
							className={`text-gray-700 font-medium hover:bg-gray-100 w-full text-center py-3 px-4 transition-colors ${isActive(link.path) ? "text-blue-600 font-semibold" : ""
								}`}
							onClick={toggleMobileMenu}
						>
							{link.name}
						</Link>
					))}
				</div>
			)}
		</header>
	);
}
