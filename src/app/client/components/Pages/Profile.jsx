"use client";

import { useEffect, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
	User,
	Phone,
	MapPin,
	Mail,
	Badge,
	Camera,
	CreditCard,
	FileBadge
} from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import getCroppedImg from "@/lib/getCroppedImg";

export default function ClientProfile() {
	const [client, setClient] = useState(null);
	const [editMode, setEditMode] = useState(false);

	const [previewImage, setPreviewImage] = useState(null);
	const [updatedData, setUpdatedData] = useState({});

	// Crop States
	const [cropOpen, setCropOpen] = useState(false);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);

	// Full Image Viewer
	const [viewFullOpen, setViewFullOpen] = useState(false);

	useEffect(() => {
		const fetchClient = async () => {
			const token = sessionStorage.getItem("token");
			if (!token) return;

			const res = await fetch("/api/clients/profile", {
				headers: { Authorization: `Bearer ${token}` },
			});

			const data = await res.json();
			if (data.success && data.role === "client") {
				setClient(data.user);
				setUpdatedData(data.user);
			}
		};

		fetchClient();
	}, []);

	// Select Image
	const handleImageSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setSelectedImage(url);
			setCropOpen(true);
		}
	};

	// Crop Complete
	const onCropComplete = useCallback((_, croppedPixels) => {
		setCroppedAreaPixels(croppedPixels);
	}, []);

	const cropImageNow = async () => {
		const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);
		const croppedFile = new File([croppedBlob], "client-photo.jpg", { type: "image/jpeg" });

		setPreviewImage(URL.createObjectURL(croppedFile));
		setUpdatedData((prev) => ({ ...prev, photo: croppedFile }));
		setCropOpen(false);
	};

	// Save Profile
	const updateProfile = async () => {
		const token = sessionStorage.getItem("token");
		const formData = new FormData();

		Object.keys(updatedData).forEach((key) => formData.append(key, updatedData[key]));

		const res = await fetch("/api/clients/profile", {
			method: "PUT",
			headers: { Authorization: `Bearer ${token}` },
			body: formData,
		});

		const data = await res.json();
		if (data.success) {
			alert("Profile updated successfully!");
			setEditMode(false);
			setClient(data.user);
		}
	};

	if (!client)
		return <p className="text-center mt-20">Loading Profile...</p>;

	return (
		<div className="p-6 flex justify-center bg-gray-100 min-h-screen">

			<Card className="max-w-xl w-full shadow-xl border rounded-2xl bg-white">

				{/* Header */}
				<CardHeader className="text-center pb-1">
					<CardTitle className="text-2xl font-bold flex justify-center items-center gap-2">
						<User /> Client Profile
					</CardTitle>

					<div className="text-lg font-semibold text-gray-800">
						{client.name}
					</div>
				</CardHeader>

				<CardContent className="space-y-6 mt-2">

					{/* Image */}
					<div className="flex justify-center">
						<div className="relative group cursor-pointer">
							<img
								onClick={() => setViewFullOpen(true)}
								src={previewImage || client.photo || "/avatar.png"}
								className="w-32 h-32 rounded-full object-cover border shadow"
							/>

							{editMode && (
								<label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full cursor-pointer text-white">
									<Camera size={16} />
									<input type="file" className="hidden" onChange={handleImageSelect} />
								</label>
							)}
						</div>
					</div>

					{/* Editable Fields */}
					<div className="space-y-4">

						{/* ID */}
						<div className="flex items-center gap-3">
							<Badge size={18} className="text-blue-600" />
							<span className="font-medium w-28">Client ID:</span>
							<span className="flex-1 p-2 bg-gray-100 rounded">{client.clientId}</span>
						</div>

						{/* Name */}
						<div className="flex items-center gap-3">
							<User size={18} className="text-blue-600" />
							<span className="font-medium w-28">Name:</span>
							{editMode ? (
								<Input
									value={updatedData.name}
									onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
									className="flex-1"
								/>
							) : (
								<span className="flex-1 p-2 bg-gray-100 rounded">{client.name}</span>
							)}
						</div>

						{/* Email (Locked) */}
						<div className="flex items-center gap-3">
							<Mail size={18} className="text-blue-600" />
							<span className="font-medium w-28">Email:</span>
							<span className="flex-1 p-2 bg-gray-100 rounded">{client.email}</span>
						</div>

						{/* Phone */}
						<div className="flex items-center gap-3">
							<Phone size={18} className="text-blue-600" />
							<span className="font-medium w-28">Phone:</span>
							{editMode ? (
								<Input
									value={updatedData.phone}
									onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })}
									className="flex-1"
								/>
							) : (
								<span className="flex-1 p-2 bg-gray-100 rounded">{client.phone}</span>
							)}
						</div>

						{/* Address */}
						<div className="flex items-center gap-3">
							<MapPin size={18} className="text-blue-600" />
							<span className="font-medium w-28">Address:</span>
							{editMode ? (
								<Input
									value={updatedData.address}
									onChange={(e) => setUpdatedData({ ...updatedData, address: e.target.value })}
									className="flex-1"
								/>
							) : (
								<span className="flex-1 p-2 bg-gray-100 rounded">{client.address}</span>
							)}
						</div>

						{/* Aadhaar (Locked) */}
						<div className="flex items-center gap-3">
							<CreditCard size={18} className="text-blue-600" />
							<span className="font-medium w-28">Aadhaar:</span>
							<span className="flex-1 p-2 bg-gray-100 rounded">{client.aadhaar}</span>
						</div>

						{/* PAN (Locked) */}
						<div className="flex items-center gap-3">
							<FileBadge size={18} className="text-blue-600" />
							<span className="font-medium w-28">PAN:</span>
							<span className="flex-1 p-2 bg-gray-100 rounded">{client.pan}</span>
						</div>

					</div>

					{/* Buttons */}
					<div className="flex justify-between mt-6">
						{editMode ? (
							<>
								<Button variant="outline" onClick={() => setEditMode(false)}>
									Cancel
								</Button>
								<Button onClick={updateProfile}>Save Changes</Button>
							</>
						) : (
							<Button className="w-full" onClick={() => setEditMode(true)}>
								Edit Profile
							</Button>
						)}
					</div>

				</CardContent>
			</Card>

			{/* Full Image View */}
			<Dialog open={viewFullOpen} onOpenChange={setViewFullOpen}>
				<DialogContent className="max-w-lg p-0 bg-black/80">
					<img src={previewImage || client.photo} className="w-full rounded-lg" />
				</DialogContent>
			</Dialog>

			{/* Crop Photo */}
			<Dialog open={cropOpen} onOpenChange={setCropOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Crop Profile Photo</DialogTitle>
					</DialogHeader>

					<div className="relative w-full h-64 bg-gray-200">
						<Cropper
							image={selectedImage}
							crop={crop}
							zoom={zoom}
							aspect={1}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropComplete}
						/>
					</div>

					<div className="flex justify-end gap-3 mt-4">
						<Button variant="outline" onClick={() => setCropOpen(false)}>
							Cancel
						</Button>
						<Button onClick={cropImageNow}>Save Crop</Button>
					</div>
				</DialogContent>
			</Dialog>

		</div>
	);
}
