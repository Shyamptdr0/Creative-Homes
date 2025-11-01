"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function StageForm({ initialData, onSubmit }) {
	const [form, setForm] = useState(
		initialData || {
			stageName: "",
			progress: 0,
			status: "pending",
			notes: "",
			projectId: "",
			images: [],
		}
	);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		const imageUrls = files.map((f) => URL.createObjectURL(f));
		setForm({ ...form, images: [...form.images, ...imageUrls] });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(form);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label>Stage Name</Label>
				<Input
					name="stageName"
					value={form.stageName}
					onChange={handleChange}
					placeholder="e.g., Excavation, Plastering"
					required
				/>
			</div>

			<div>
				<Label>Progress (%)</Label>
				<Input
					type="number"
					name="progress"
					value={form.progress}
					onChange={handleChange}
					min={0}
					max={100}
				/>
			</div>

			<div>
				<Label>Status</Label>
				<select
					name="status"
					value={form.status}
					onChange={handleChange}
					className="border rounded-md p-2 w-full"
				>
					<option value="pending">Pending</option>
					<option value="in_progress">In Progress</option>
					<option value="done">Done</option>
				</select>
			</div>

			<div>
				<Label>Notes</Label>
				<Textarea
					name="notes"
					value={form.notes}
					onChange={handleChange}
					placeholder="Write stage-specific notes..."
				/>
			</div>

			<div>
				<Label>Upload Images</Label>
				<Input type="file" multiple onChange={handleImageUpload} />
				<div className="flex gap-2 mt-2 flex-wrap">
					{form.images.map((img, i) => (
						<img
							key={i}
							src={img}
							alt="preview"
							className="w-20 h-20 object-cover rounded"
						/>
					))}
				</div>
			</div>

			<Button type="submit" className="w-full">
				{initialData ? "Update Stage" : "Add Stage"}
			</Button>
		</form>
	);
}
