"use client";

import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function FooterPage() {
	return (
		<footer className="bg-gray-900 text-gray-200 py-12">
			<div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10">

				{/* Company Info */}
				<div>
					<h2 className="text-2xl font-bold mb-4 text-white">Creative Homes</h2>
					<p className="text-gray-400">
						Building modern and sustainable homes. Connect with us to bring your dream home to life.
					</p>
				</div>

				{/* Quick Links */}
				<div>
					<h3 className="text-xl font-semibold mb-4">Quick Links</h3>
					<ul className="space-y-2 text-gray-400">
						<li><a href="#home" className="hover:text-lime-500 transition-colors">Home</a></li>
						<li><a href="#projects" className="hover:text-lime-500 transition-colors">Projects</a></li>
						<li><a href="#services" className="hover:text-lime-500 transition-colors">Services</a></li>
						<li><a href="#about" className="hover:text-lime-500 transition-colors">About Us</a></li>
						<li><a href="#contact" className="hover:text-lime-500 transition-colors">Contact</a></li>
					</ul>
				</div>

				{/* Contact Info */}
				<div>
					<h3 className="text-xl font-semibold mb-4">Contact Us</h3>
					<p className="text-gray-400">240, Russell Street, QT Melbourne</p>
					<p className="text-gray-400">Victoria, Melbourne</p>
					<p className="text-gray-400">Email: info@creativehomes.com</p>
					<p className="text-gray-400">Phone: +91 12345 67890</p>
				</div>

				{/* Social Media */}
				<div>
					<h3 className="text-xl font-semibold mb-4">Follow Us</h3>
					<div className="flex gap-4">
						<a href="#" className="hover:text-lime-500 transition-colors"><Facebook size={24} /></a>
						<a href="#" className="hover:text-lime-500 transition-colors"><Twitter size={24} /></a>
						<a href="#" className="hover:text-lime-500 transition-colors"><Instagram size={24} /></a>
						<a href="#" className="hover:text-lime-500 transition-colors"><Linkedin size={24} /></a>
					</div>
				</div>

			</div>

			<div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-500 text-sm">
				&copy; {new Date().getFullYear()} Creative Homes. All rights reserved. |{" "}
				Designed and Developed by{" "}
				<a
					href="https://shreemsoftwaresolutions.com/"
					target="_blank"
					rel="noopener noreferrer"
					className="text-lime-500 hover:text-lime-400 transition-colors font-semibold"
				>
					Shreem Software Solutions
				</a>
			</div>
		</footer>
	);
}
