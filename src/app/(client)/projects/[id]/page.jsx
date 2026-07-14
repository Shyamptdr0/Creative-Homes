"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
	MapPin,
	Layers,
	Maximize,
	Compass,
	IndianRupee,
	ArrowLeft,
	CalendarDays,
	Home,
	Info
} from "lucide-react";

export default function ProjectDetailsPage() {
	const params = useParams();
	const [project, setProject] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!loading) {
			window.scrollTo(0, 0);
		}
	}, [loading]);

	useEffect(() => {
		if (params?.id) {
			fetchProjectDetails(params.id);
		}
	}, [params?.id]);

	const fetchProjectDetails = async (id) => {
		try {
			const res = await fetch(`/api/portfolio/${id}`);
			const data = await res.json();
			if (!data.error) {
				setProject(data);
			}
		} catch (error) {
			console.error("Failed to fetch project details", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="w-full min-h-screen flex items-center justify-center bg-white">
				<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!project) {
		return (
			<div className="w-full min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
				<h1 className="text-3xl font-black uppercase tracking-tighter">Project Not Found</h1>
				<Link href="/projects" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-primary transition-colors flex items-center gap-2">
					<ArrowLeft className="w-4 h-4" /> Back to Projects
				</Link>
			</div>
		);
	}

	return (

		<div className="w-full min-h-screen bg-[#fcfbf9] text-[#0f172a] font-sans pb-32 pt-24 md:pt-32 lg:pt-40 px-6 md:px-12 lg:px-20">
			<div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
				{/* LEFT CONTENT */}
				<div className="w-full lg:w-5/12 flex flex-col">
					<Link href="/projects" className="text-sm font-bold text-primary hover:text-amber-600 transition-colors flex items-center gap-2 mb-8 w-fit">
						<span className="text-lg">{"<"}</span> Back to projects
					</Link>

					<h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black leading-[1.1] mb-12">
						{project.name}
					</h1>

					<div className="grid grid-cols-2 gap-y-10 gap-x-12">
						<div className="space-y-1.5">
							<div className="flex items-center gap-2.5 text-neutral-500">
								<MapPin className="w-4 h-4" />
								<span className="text-sm font-medium">Location</span>
							</div>
							<p className="text-lg font-medium text-black">{project.city || "Not Specified"}</p>
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center gap-2.5 text-neutral-500">
								<Maximize className="w-4 h-4" />
								<span className="text-sm font-medium">Plot Dimensions</span>
							</div>
							<p className="text-lg font-medium text-black">{project.dimensions || "Not Specified"}</p>
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center gap-2.5 text-neutral-500">
								<IndianRupee className="w-4 h-4" />
								<span className="text-sm font-medium">Budget <Info className="w-3 h-3 inline ml-1 text-neutral-400" /></span>
							</div>
							<p className="text-lg font-medium text-black">{project.budget || "Not Specified"}</p>
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center gap-2.5 text-neutral-500">
								<Home className="w-4 h-4" />
								<span className="text-sm font-medium">Floors</span>
							</div>
							<p className="text-lg font-medium text-black">{project.floors || "Not Specified"}</p>
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center gap-2.5 text-neutral-500">
								<Compass className="w-4 h-4" />
								<span className="text-sm font-medium">Road Facing</span>
							</div>
							<p className="text-lg font-medium text-black">{project.facing || "Not Specified"}</p>
						</div>
					</div>
				</div>

				{/* RIGHT IMAGE */}
				<div className="w-full lg:w-7/12 mt-12 lg:mt-0">
					<div className="relative w-full aspect-[4/3] md:aspect-[16/10] lg:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
						{project.image ? (
							<Image
								src={project.image}
								alt={project.name}
								fill
								className="object-cover"
								priority
							/>
						) : (
							<div className="w-full h-full bg-neutral-200 flex items-center justify-center">
								<span className="text-neutral-400">No Image Available</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{project.description && (
				<div className="max-w-7xl mx-auto w-full mt-20">
					<h2 className="text-2xl font-bold mb-6">Project Overview</h2>
					<p className="text-lg text-neutral-600 leading-relaxed max-w-4xl whitespace-pre-wrap">
						{project.description}
					</p>
				</div>
			)}
		</div>
	);
}
