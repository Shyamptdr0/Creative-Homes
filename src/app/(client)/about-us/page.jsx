"use client";

import React from "react";
import Image from "next/image";
import architect from "../../../../public/Images/services/Drawing.jpg"; // left image
import sketch from "../../../../public/Images/workimg.jpg"; // right image
import { Button } from "@/components/ui/button";
import BookMeetingPage from "@/app/(client)/components/BookaMeeting";

export default function AboutPage() {
	return (
		<>
			<section className="relative w-full bg-white py-16 px-6 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-12">
				{/* LEFT SECTION */}
				<div className="flex flex-col space-y-8 w-full lg:w-1/2">
					{/* Heading and Button */}
					<div>
						<h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
							ABOUT US
						</h2>
						{/*<Button className="w-fit px-6 py-2 text-lg bg-black text-white rounded-lg hover:bg-neutral-800 transition">*/}
						{/*	Learn More*/}
						{/*</Button>*/}
					</div>

					{/* Image + Stats */}
					<div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
						{/* Architect Image */}
						<Image
							src={architect}
							alt="Architect working"
							className="rounded-xl object-cover w-60 h-80 shadow-md"
						/>

						{/* Stats Grid */}
						<div className="grid grid-cols-2 gap-x-10 gap-y-6 text-center sm:text-left text-gray-800 pl-5 pt-8">
							<div>
								<h3 className="text-3xl font-bold text-black">32</h3>
								<p className="text-sm">Years of experience</p>
							</div>
							<div>
								<h3 className="text-3xl font-bold text-black">598</h3>
								<p className="text-sm">Project Completed</p>
							</div>
							<div>
								<h3 className="text-3xl font-bold text-black">45</h3>
								<p className="text-sm">Award gain</p>
							</div>
							<div>
								<h3 className="text-3xl font-bold text-black">100+</h3>
								<p className="text-sm">Architectural engineer</p>
							</div>
						</div>
					</div>

					{/* Description */}
					<p className="text-gray-700 text-sm leading-relaxed max-w-xl">
						Our architecture transcends the confines of mere construction; it’s an
						invitation to experience space in its purest form. With an unwavering
						focus on clarity, we refine every line and contour to manifest a
						design that isn’t just visually captivating, but also intellectually
						stimulating. Each structure we conceive is a narrative waiting to be
						explored, a canvas where functionality and artistry converge.
					</p>
				</div>

				{/* RIGHT SECTION */}
				<div className="w-full lg:w-1/2 flex justify-center">
					<Image
						src={sketch}
						alt="Architectural sketch"
						className="rounded-2xl object-cover w-full max-w-xl shadow-md"
					/>
				</div>
			</section>

			<BookMeetingPage/>
		</>
	);
}
