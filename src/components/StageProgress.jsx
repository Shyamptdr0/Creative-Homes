"use client";
import React from "react";

export default function StageProgress({ stages }) {
	if (!stages?.length) return <p>No stage data available.</p>;

	return (
		<div className="space-y-6">
			{stages.map((stage) => (
				<div key={stage.id} className="border rounded-lg p-4 shadow-sm bg-white">
					<div className="flex justify-between items-center">
						<h3 className="font-semibold">{stage.stageName}</h3>
						<span className="text-sm capitalize text-gray-500">{stage.status}</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-3 my-2">
						<div
							className={`h-3 rounded-full ${
								stage.status === "done"
									? "bg-green-500"
									: stage.status === "in_progress"
										? "bg-yellow-500"
										: "bg-gray-400"
							}`}
							style={{ width: `${stage.progress}%` }}
						/>
					</div>
					<p className="text-sm text-gray-600">{stage.notes}</p>
					{stage.images?.length > 0 && (
						<div className="flex gap-2 mt-3 flex-wrap">
							{stage.images.map((img, i) => (
								<img
									key={i}
									src={img}
									alt="stage"
									className="w-28 h-28 object-cover rounded-lg border"
								/>
							))}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
