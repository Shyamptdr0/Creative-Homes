"use client";
import React, { useEffect, useState } from "react";
import StageProgress from "@/components/StageProgress";

export default function ClientStagesPage() {
	const [stages, setStages] = useState([]);
	const [project, setProject] = useState(null);

	useEffect(() => {
		async function fetchData() {
			const projectId = sessionStorage.getItem("currentProjectId"); // or from user session
			const [stagesRes, projectRes] = await Promise.all([
				fetch(`/api/admin/stages?projectId=${projectId}`),
				fetch(`/api/admin/projects/${projectId}`),
			]);
			setStages(await stagesRes.json());
			setProject(await projectRes.json());
		}
		fetchData();
	}, []);

	if (!project) return <p>Loading...</p>;

	const paid = project.paidAmount || 0;
	const total = project.totalCost || 0;

	return (
		<div className="p-6 space-y-8">
			<h1 className="text-2xl font-semibold">Project Progress - {project.name}</h1>
			<StageProgress stages={stages} />

			<div className="mt-8 border rounded-lg p-4 bg-gray-50">
				<h2 className="font-semibold text-lg mb-2">Contract & Payment Info</h2>
				<p>Total Amount: ₹{total.toLocaleString()}</p>
				<p>Paid: ₹{paid.toLocaleString()}</p>
				<p>Remaining: ₹{(total - paid).toLocaleString()}</p>
			</div>

			<div className="mt-6 border rounded-lg p-4 bg-white">
				<h2 className="font-semibold text-lg mb-2">Queries / Issues</h2>
				<p className="text-gray-500 text-sm">
					Client can raise project-related questions (feature can be added later)
				</p>
			</div>
		</div>
	);
}
