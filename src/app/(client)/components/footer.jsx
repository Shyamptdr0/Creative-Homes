"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Linkedin, ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";

export default function FooterPage({ isGlobal = false }) {
	const pathname = usePathname();
	const currentYear = new Date().getFullYear();

	if (isGlobal && pathname === "/") return null;

	return (
		<footer className="w-full h-screen snap-start snap-always bg-[#0f172a] text-white flex flex-col justify-center items-center overflow-hidden relative font-sans px-6 md:px-20">

			{/* Subtle Background Mark */}
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
				<h1 className="text-[25vw] font-black uppercase tracking-tighter leading-none select-none">
					URBAN
				</h1>
			</div>

			<div className="w-full max-w-7xl flex flex-col justify-between h-[75vh] relative z-10">

				{/* Top: The Call to Action */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-16"
				>
					<div className="space-y-4">
						<span className="text-primary font-bold tracking-[0.4em] uppercase text-[10px]">Next Step</span>
						<h2 className="text-4xl md:text-6xl font-bold tracking-tight">Let's build your <br /> dream together.</h2>
					</div>
					<motion.a
						href="#contact"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="group flex items-center gap-4 px-10 py-5 bg-white text-black rounded-2xl font-bold uppercase text-xs tracking-widest mt-8 md:mt-0 transition-all hover:bg-primary"
					>
						<span>Get in Touch</span>
						<ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
					</motion.a>
				</motion.div>

				{/* Middle: The Info Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-12 py-16">

					<div className="space-y-8">
						<h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/20">Company</h3>
						<ul className="space-y-4 text-sm font-medium text-white/50">
							{["Home", "Portfolio", "Our Process", "About"].map((link, i) => (
								<li key={i}>
									<a href="#" className="hover:text-white transition-colors">{link}</a>
								</li>
							))}
						</ul>
					</div>

					<div className="space-y-8">
						<h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/20">Contact</h3>
						<div className="space-y-4 text-sm font-medium text-white/50">
							<a href="mailto:info@urbanlandscape.com" className="flex items-center gap-3 hover:text-white transition-colors">
								<Mail size={16} className="text-primary" />
								<span>info@urbanlandscape.com</span>
							</a>
							<a href="tel:+919876543210" className="flex items-center gap-3 hover:text-white transition-colors">
								<Phone size={16} className="text-primary" />
								<span>+91 98765 43210</span>
							</a>
						</div>
					</div>

					<div className="space-y-8">
						<h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/20">Office</h3>
						<div className="flex items-start gap-3 text-sm font-medium text-white/50">
							<MapPin size={16} className="text-primary shrink-0" />
							<span>240, Russell Street, <br /> QT Melbourne, Victoria</span>
						</div>
					</div>

					<div className="space-y-8">
						<h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/20">Follow</h3>
						<div className="flex gap-5">
							{[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
								<motion.a
									key={i}
									href="#"
									whileHover={{ y: -5, color: "#72ba00" }}
									className="text-white/20 hover:text-white transition-all"
								>
									<Icon size={22} strokeWidth={1.5} />
								</motion.a>
							))}
						</div>
					</div>

				</div>

				{/* Bottom: The Legal Bar */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-10">
					<p className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/20">
						&copy; {currentYear} Urban Landscape. All Rights Reserved.
					</p>
					<div className="flex gap-8 items-center text-[10px] uppercase font-bold tracking-[0.3em] text-white/20">
						<div className="flex gap-6">
							<a href="#" className="hover:text-white transition-colors">Privacy</a>
							<a href="#" className="hover:text-white transition-colors">Terms</a>
						</div>
						<div className="flex items-center gap-2 ml-6">
							<span>BY</span>
							<a
								href="https://shreemsoftwaresolutions.com/"
								target="_blank"
								className="text-white/40 hover:text-primary transition-all font-black"
							>
								Shreem Software Solutions
							</a>
						</div>
					</div>
				</div>

			</div>

		</footer>
	);
}
