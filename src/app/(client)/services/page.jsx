"use client";

import Image from "next/image";
import { Hammer, Home, Paintbrush, Ruler } from "lucide-react";

export default function ServicePage() {
	const services = [
		{
			id: 1,
			title: "Complete Construction",
			description:
				"From concept to completion, we handle residential and commercial construction with quality materials, skilled labor, and timely delivery.",
			icon: <Home className="w-10 h-10 text-lime-500" />,
			image: "/images/services/construction.jpg"
		},
		{
			id: 2,
			title: "Interior Design",
			description:
				"Our creative interior design team transforms spaces with modern, functional, and elegant designs that suit your personality and lifestyle.",
			icon: <Paintbrush className="w-10 h-10 text-lime-500" />,
			image: "/images/services/interior.jpg",
		},
		{
			id: 3,
			title: "Renovation",
			description:
				"Give your existing space a new life. We specialize in full home and office renovation with modern materials and design upgrades.",
			icon: <Hammer className="w-10 h-10 text-lime-500" />,
			image: "/images/services/renovation.jpg",
		},
		{
			id: 4,
			title: "Drawing & Consultancy",
			description:
				"Get expert architectural drawings, plans, and structural consultancy for your project — ensuring safety, compliance, and aesthetic value.",
			icon: <Ruler className="w-10 h-10 text-lime-500" />,
			image: "/images/services/drawingss.jpg",
		},
	];

	const whyChooseUs = [
		{
			title: "Expert Team",
			desc: "Experienced engineers, architects, and designers.",
		},
		{
			title: "High Quality",
			desc: "We use only premium materials and skilled workmanship.",
		},
		{
			title: "Timely Delivery",
			desc: "Projects completed on time without compromise.",
		},
		{
			title: "Customer Focused",
			desc: "Transparent communication and end-to-end support.",
		},
	];

	return (
		<div className="bg-gray-50">
			{/* Hero Section */}
			<section
				className="relative h-[80vh] flex items-center justify-center bg-cover bg-center "
				style={{ backgroundImage: "url('/Images/house.jpg')" }}
			>
				<div className="bg-black/50 absolute inset-0 rounded-2xl"></div>
				<div className="relative z-10 text-center text-white px-4">
					<h1 className="text-5xl font-bold mb-4 mt-15">Our Professional Services</h1>
					<p className="max-w-2xl mx-auto text-lg mb-6">
						Building dreams from design to delivery — with quality, care, and creativity.
					</p>
					<a
						href="/contact"
						className="bg-lime-500 px-6 py-3 rounded-full font-semibold hover:bg-lime-600 transition"
					>
						Get a Free Quote
					</a>
				</div>
			</section>

			{/* Services Grid */}
			<div className="min-h-screen py-16 px-6 lg:px-24">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">Services Offered</h1>
					<p className="text-gray-600 max-w-2xl mx-auto">
						We provide complete end-to-end construction and design services — ensuring your dream space becomes a reality with precision and creativity.
					</p>
				</div>

				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
					{services.map((service) => (
						<div
							key={service.id}
							className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
						>
							<div className="relative h-48 w-full">
								<Image
									src={service.image}
									alt={service.title}
									fill
									className="object-cover hover:scale-105 transition-transform duration-300"
								/>
							</div>

							<div className="p-6 flex-1 flex flex-col items-center text-center">
								<div className="mb-4">{service.icon}</div>
								<h2 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h2>
								<p className="text-gray-600 text-sm">{service.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Why Choose Us */}
			<section className="mt-10 mb-10 px-6 lg:px-24">
				<h2 className="text-3xl font-bold text-center mb-10">Why Choose Us</h2>
				<div className="grid md:grid-cols-4 gap-8">
					{whyChooseUs.map((item, i) => (
						<div
							key={i}
							className="bg-white p-6 rounded-xl shadow hover:shadow-lg text-center"
						>
							<h3 className="font-semibold text-xl mb-2 text-lime-600">{item.title}</h3>
							<p className="text-gray-600 text-sm">{item.desc}</p>
						</div>
					))}
				</div>
			</section>


		</div>
	);
}
