"use client";

import React from "react";
import {
	Handshake,
	Search,
	PencilRuler,
	Hammer,
	Building2,
	Home,
} from "lucide-react";
import Image from "next/image";
import BookMeetingPage from "@/app/(client)/components/BookaMeeting";
import workimg from "../../../../public/Images/work.jpg";

export default function HowToWorkPage() {
	const steps = [
		{
			icon: <Handshake className="w-8 h-8 text-lime-500" />,
			title: "Book a meeting",
			description:
				"Schedule a session to learn about us and our process.",
		},
		{
			icon: <Search className="w-8 h-8 text-lime-500" />,
			title: "Do your research",
			description:
				"Explore reference sites, get a preliminary quote, and review our contracts.",
		},
		{
			icon: <PencilRuler className="w-8 h-8 text-lime-500" />,
			title: "Begin design",
			description:
				"Make the design phase payment to begin crafting your dream home designed by our empanelled architects.",
		},
		{
			icon: <Hammer className="w-8 h-8 text-lime-500" />,
			title: "Pre-Construction",
			description:
				"Make the pre-construction payment and leave the rest to us — while we finalise designs, conduct soil tests, provide final quotations and project plans, arrange contractor meetings, and complete legal formalities.",
		},
		{
			icon: <Building2 className="w-8 h-8 text-lime-500" />,
			title: "Construction",
			description:
				"Track progress through weekly updates, scheduled meetings, and detailed reports.",
		},
		{
			icon: <Home className="w-8 h-8 text-lime-500" />,
			title: "Handover and Housewarming",
			description:
				"From dream to reality — enjoy a seamless handover with one-year defect liability support, a structural stability certificate, and a five-year structural warranty for worry-free ownership.",
		},
	];

	return (
		<div className="w-full bg-gray-50 py-20 px-6 md:px-20">
			{/* Header Section */}
			<div className="text-center mb-12">
				<h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
					How It Works
				</h1>
				<p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
					Expertly built homes, from concept to completion in approximately 14 months.
				</p>
			</div>

			{/* Image Section */}
			<div className="w-full mb-16 flex items-center justify-center">
				<div className="relative w-full max-w-6xl h-[400px]">
					<Image
						src={workimg}
						alt="Our process overview"
						fill
						className="rounded-2xl object-cover shadow-md"
						priority
					/>
				</div>
			</div>

			{/* Subheading */}
			<div className="text-center mb-16 pt-10">
				<h2 className="text-3xl font-semibold mb-4 text-gray-900">
					Our Building Process at a Glance
				</h2>
				<p className="text-gray-600 max-w-2xl mx-auto">
					Follow our streamlined process from concept to handover.
				</p>
			</div>

			{/* Steps in Chain Form */}
			<div className="relative max-w-4xl mx-auto">
				{/* Vertical Line */}
				<div className="absolute left-8 top-0 bottom-0 w-1 bg-lime-200 rounded-full md:left-1/2 md:-translate-x-1/2" />

				{/* Steps */}
				<div className="flex flex-col gap-12">
					{steps.map((step, idx) => (
						<div
							key={idx}
							className={`relative flex items-start gap-6 ${
								idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
							}`}
						>
							{/* Icon Circle */}
							<div
								className={`flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md z-10 md:absolute md:left-1/2 md:-translate-x-1/2`}
							>
								{step.icon}
							</div>

							{/* Content Card */}
							<div
								className={`bg-white p-6 rounded-xl shadow-lg w-full md:w-[45%] ${
									idx % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
								}`}
							>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									{step.title}
								</h3>
								<p className="text-gray-600">{step.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Book Meeting Section */}
			<div className="mt-20">
				<BookMeetingPage />
			</div>
		</div>
	);
}
