"use client";

import React from "react";
import Image from "next/image";

// Background & Hero images
import bgHome from "../../../../public/Images/img4.jpg";
import bgHero from "../../../../public/Images/img6.jpg";
import modernProject from "../../../../public/Images/home img2.jpg";
import projectThumb from "../../../../public/Images/home img1.jpg";

import projectsideimg from "../../../../public/Images/img8.jpg"

// Project gallery images
import project1 from "../../../../public/Images/img2.jpg";
import project2 from "../../../../public/Images/img3.jpg";
import project3 from "../../../../public/Images/img4.jpg";
import project4 from "../../../../public/Images/img5.jpg";
import project5 from "../../../../public/Images/img6.jpg";
import project6 from "../../../../public/Images/img7.jpg";


import {
	ArrowRight, ShieldUser, House, BrickWall, Wand2, Gem, ReceiptIndianRupee, CalendarCheck,
} from "lucide-react";
import { Handshake, Home, Speaker, Key } from "lucide-react";
import {
	Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

import {BlurFade} from "@/components/ui/blur-fade";
import {Button} from "@/components/ui/button";
import BookMeetingPage from "@/app/(client)/components/BookaMeeting"; // Make sure this path is correct

export default function HeroPage() {
	const projects = [project1, project2, project3, project4, project5, project6];
	const steps = [
		{
			icon: <Handshake className="w-10 h-10 text-blue-500" />,
			title: "Meet our experts",
			description:
				"Discuss your ideas and goals. We’ll help plan your budget and design preferences.",
		},
		{
			icon: <Home className="w-10 h-10 text-blue-500" />,
			title: "Design your custom home",
			description:
				"See detailed 3D renderings that let you visualize your home before construction begins.",
		},
		{
			icon: <Speaker className="w-10 h-10 text-blue-500" />,
			title: "Track the construction",
			description:
				"Stay informed with regular updates on progress and quality checks at every stages.",
		},
		{
			icon: <Key className="w-10 h-10 text-blue-500" />,
			title: "Move in to your home",
			description:
				"A pre-delivery inspection ensures everything is in place before handover.",
		},
	]

	return (<div className="w-full bg-white font-sans text-gray-900">

		{/* FINAL CTA SECTION */}
		<section className="relative w-full h-[80vh] flex items-center justify-center">
			<Image src={bgHome} alt="Home Background" fill className="object-cover brightness-50" priority/>
			<div className="relative z-10 text-center text-white px-6">
				<h2 className="text-4xl md:text-6xl font-bold mb-6">
					Let’s Build Your Dream Home Together
				</h2>
				<p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-200">
					From design to delivery — your vision, our expertise. Connect with our team today and start
					building your legacy.
				</p>
				<button
					className="px-10 py-3 bg-lime-600 hover:bg-lime-700 text-white text-lg font-medium rounded-lg transition-all duration-300 shadow-lg">
					Get in Touch
				</button>
			</div>
		</section>

		{/* MODERN LIFE SECTION */}
		<section
			className="w-full px-6 md:px-20 py-20 flex flex-col lg:flex-row items-start lg:items-start space-y-12 lg:space-y-0 lg:space-x-16 bg-neutral-100 border-2 border-b-gray-400"> {/* Left Text */}
			<div className="lg:w-1/3 flex flex-col justify-between text-left h-full min-h-[450px]"><h2
				className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-gray-900"> MODERN
				LIFE <br/> <span className="text-blue-500 underline">LIVES HERE</span></h2> <h3
				className="text-gray-600 text-base border-2 border-gray-300 p-2 rounded-lg"> Your new home awaits.
				We specialize in building high-quality, custom homes designed to fit your unique lifestyle. Our team
				of experienced professionals guides you through every step of the construction process, from initial
				design to final walkthrough, ensuring exceptional craftsmanship and transparent communication. </h3>
			</div>
			{/* Right Content */}
			<div
				className="lg:w-2/3 flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8"> {/* Project Illustration */}
				<div className="w-full lg:w-2/3 rounded-xl overflow-hidden shadow-xl border border-gray-200"><Image
					src={modernProject} alt="Modern Project Illustration" className="object-cover w-full h-full"/>
				</div>
				{/* Accordion Section */}
				<div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
					<Accordion
						type="single" collapsible className="w-full space-y-4" defaultValue="item-1">
						<AccordionItem
							value="item-1" className="border-b border-gray-100">
							<AccordionTrigger
								className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-lime-600 transition-colors cursor-pointer">
					<span className="flex items-center gap-2">
						<Wand2 className="w-8 h-8 text-gray-600"/> Designs matching vision </span>
							</AccordionTrigger>
							<AccordionContent className="text-gray-600 text-sm leading-relaxed">
								Functional layouts that are unique to your lifestyle.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem
							value="item-2" className="border-b border-gray-100">
							<AccordionTrigger
								className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-lime-600 transition-colors cursor-pointer">
								<span className="flex items-center gap-2"> <Gem className="w-8 h-8 text-gray-600"/> High-quality materials </span>
							</AccordionTrigger>
							<AccordionContent className="text-gray-600 text-sm leading-relaxed">
								No
								compromises. Only certified-grade materials.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem
							value="item-3">
							<AccordionTrigger
								className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-lime-600 transition-colors cursor-pointer">
						<span className="flex items-center gap-2">
							<ReceiptIndianRupee
								className="w-8 h-8 text-gray-600"/> Price transparency </span>
							</AccordionTrigger>
							<AccordionContent className="text-gray-600 text-sm leading-relaxed">
								Clear pricing with no
								surprises — just peace of mind.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-4">
							<AccordionTrigger
								className="text-lg font-semibold text-gray-900 hover:text-lime-600 transition-colors cursor-pointer">
						<span className="flex items-center gap-2">
							<CalendarCheck className="w-8 h-8 text-gray-600"/> On-time delivery </span>
							</AccordionTrigger>
							<AccordionContent className="text-gray-600 text-sm leading-relaxed">
								From planning to handover, our turnkey model stays on schedule.
							</AccordionContent>
						</AccordionItem>
					</Accordion></div>
			</div>
		</section>

		{/* HERO METRICS SECTION */}
		<section
			className="relative w-full min-h-screen flex flex-col lg:flex-row items-start justify-between overflow-hidden">
			<div className="absolute inset-0">
				<Image src={bgHero} alt="Background Image" fill
				       className="object-cover object-center brightness-[0.5]" priority/>
				<div className="absolute inset-0 bg-black/30"/>
			</div>

			<div
				className="relative z-10 w-full h-full flex flex-col lg:flex-row items-start justify-between px-6 md:px-14 py-16 text-white">
				{/* LEFT COLUMN */}
				<div
					className="flex flex-col items-start space-y-12 w-full lg:w-[35%] xl:w-1/4 pr-8 pb-10 lg:pb-0 border-r border-white/20 pt-10">
					<h3 className="text-3xl font-bold leading-snug">You Dream. <br/> We Deliver.</h3>
					<p className="text-sm text-gray-200 mt-1 max-w-[280px]">Build your dream home hassle-free.</p>

					<div className="grid grid-cols-3 gap-4 border-t border-b border-white/20 py-4">
						<div className="flex flex-col items-start text-left">
							<div className="flex items-center space-x-2">
								<ShieldUser className="w-8 h-8 text-lime-400"/><p
								className="text-2xl font-extrabold">+85</p>
							</div>
							<p className="text-xs text-gray-300 uppercase tracking-widest mt-0.5">NPS Score</p>
						</div>
						<div className="flex flex-col items-start text-left">
							<div className="flex items-center space-x-2">
								<House className="w-8 h-8 text-lime-400"/><p
								className="text-2xl font-extrabold">180+</p>
							</div>
							<p className="text-xs text-gray-300 uppercase tracking-widest mt-0.5">Homes
								Delivered</p>
						</div>
						<div className="flex flex-col items-start text-left">
							<div className="flex items-center space-x-2">
								<BrickWall className="w-8 h-8 text-lime-400"/><p
								className="text-2xl font-extrabold">227+</p>
							</div>
							<p className="text-xs text-gray-300 uppercase tracking-widest mt-0.5">Under
								Construction</p>
						</div>
					</div>

					<div className="text-left space-y-4 pt-4">
						<p className="text-sm text-gray-300 uppercase tracking-widest font-semibold">Our Latest
							Project</p>
						<div
							className="w-[250px] h-[160px] rounded-lg overflow-hidden shadow-md border border-white/10">
							<Image src={projectThumb} alt="Project Thumbnail"
							       className="object-cover w-full h-full"/>
						</div>

						<div
							className="flex items-center justify-between border border-white/20 p-2 rounded-lg pr-1 bg-white/10 hover:bg-white/20 transition-all cursor-pointer w-[250px] backdrop-blur-md">
							<p className="text-lg font-medium text-white">Explore more projects</p>
							<a href="#"
							   className="p-1 rounded-full text-lime-400 hover:text-white transition-colors">
								<ArrowRight className="w-6 h-6"/>
							</a>
						</div>
					</div>
				</div>

				{/* RIGHT COLUMN */}
				<div
					className="flex flex-col items-start w-full lg:w-2/3 h-full space-y-10 pl-6 xl:pl-10 mt-10 lg:mt-0">
					<h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
						Build Your Legacy. <br/> We Bring It to Life.
					</h1>
					<button
						className="px-10 py-3 bg-lime-600 text-white text-lg font-medium rounded-lg hover:bg-lime-700 transition-colors duration-300 shadow-lg">
						Let’s Talk
					</button>
				</div>
			</div>
		</section>

		{/* PROJECTS SECTION WITH LOCAL IMAGES & BLURFADE */}
		<section className="w-full px-6 md:px-20 py-20 bg-gray-50" id="photos">
			<h2 className="text-4xl font-bold text-center mb-12">Our Projects</h2>

			<div className="flex flex-col lg:flex-row gap-8">
				{/* LEFT FEATURED PROJECT */}
				<div className="lg:w-1/5 flex flex-col gap-4 ">
					<div className=" overflow-hidden  rounded-lg ">
						<Image
							src={projectsideimg}
							alt="Featured Project"
							className="w-[300px] object-cover h-[200px] rounded-lg "
						/>
					</div>
					<div className="border border-gray-300 p-2 rounded-lg">
						<p className="text-gray-400 pb-10">
							Discover the synergy of design and purpose with Innovating Spaces, Inspiring Lives. Our
							visionary approach reshapes environments, fostering creativity, growth and a renewed zest
							for life. Join us in crafting transformative spaces where every corner reflects the essence
							of inspiration.
						</p>
						<Button className="cursor-pointer">Learn more</Button>
					</div>
				</div>

				{/* RIGHT PROJECTS GRID (Masonry/Columns with BlurFade) */}
				<div className="lg:w-2/3 pl-20 border-l border-black/50 ">
					<div className="columns-1 sm:columns-2 md:columns-3 gap-6">
						{projects.map((image, idx) => (
							<BlurFade
								key={idx}
								delay={0.25 + idx * 0.05}
								inView
								className="mb-6 break-inside-avoid rounded-lg overflow-hidden shadow-lg border border-gray-200"
							>
								<img
									src={image.src}
									alt={`Project ${idx + 1}`}
									className="w-full h-auto object-cover rounded-lg"
								/>
							</BlurFade>
						))}
					</div>

					{/* BUTTON CENTERED */}
					<div className="flex justify-center mt-8">
						<button
							className="px-8 py-3 bg-lime-600 hover:bg-lime-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg cursor-pointer">
							See More Projects
						</button>
					</div>
				</div>
			</div>
		</section>

		<section className="w-full bg-gray-50 py-20 px-6 md:px-20 border-t border-b border-gray-300">
			{/* Section Heading */}
			<div className="text-center mb-12">
				<h2 className="text-4xl font-bold mb-2">A glimpse into our building process</h2>
				<p className="text-gray-600 text-lg">
					Explore our step-by-step process of building your dream home.
				</p>
			</div>

			{/* Steps Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
				{steps.map((step, idx) => (
					<div key={idx} className="bg-white p-6 rounded-xl shadow-lg text-center flex flex-col items-center">
						<div className="mb-4">{step.icon}</div>
						<h3 className="text-xl font-semibold mb-2">{step.title}</h3>
						<p className="text-gray-600 text-sm">{step.description}</p>
					</div>
				))}
			</div>

			{/* View Details Button */}
			<div className="flex justify-center mt-12">
				<button className="px-10 py-3 bg-lime-600 hover:bg-lime-700 text-white text-lg font-medium rounded-lg transition-all duration-300 shadow-lg cursor-pointer" >
					View details
				</button>
			</div>
		</section>

		<BookMeetingPage/>
	</div>);
}
