"use client";

import React, { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/getCroppedImg";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ContractorAuth() {
	const router = useRouter();

	/* ----------------------
	    LOGIN STATES
	---------------------- */
	const [loginData, setLoginData] = useState({
		contractorId: "",
		password: "",
	});
	const [loginLoading, setLoginLoading] = useState(false);

	/* ----------------------
	    SIGNUP STATES
	---------------------- */
	const [signupData, setSignupData] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		aadhaar: "",
		pan: "",
	});

	const [photo, setPhoto] = useState(null);
	const [signupLoading, setSignupLoading] = useState(false);

	/* ----------------------
	    PHOTO CROPPER STATES
	---------------------- */
	const [openCropper, setOpenCropper] = useState(false);
	const [imageSrc, setImageSrc] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

	/* SUCCESS POPUP */
	const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

	/* ----------------------
	    VALIDATIONS + TICKS
	---------------------- */

	const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email);
	const isValidPhone = /^\d{10}$/.test(signupData.phone);
	const isValidAadhaar = /^\d{4}-\d{4}-\d{4}$/.test(signupData.aadhaar);
	const isValidPAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(signupData.pan);

	const ValidIcon = ({ valid }) =>
		valid ? (
			<CheckCircle className="w-5 h-5 text-green-600" />
		) : (
			<XCircle className="w-5 h-5 text-red-600" />
		);

	/* ----------------------
	    LOGIN FUNCTION
	---------------------- */
	const login = async () => {
		setLoginLoading(true);

		const res = await fetch("/api/auth/contractor-login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(loginData),
		});
		const data = await res.json();

		setLoginLoading(false);

		if (!data.success) return toast.error(data.msg);

		toast.success("Login Successful");

		sessionStorage.setItem("token", data.token);
		sessionStorage.setItem("user", JSON.stringify(data.user));

		router.push("/contractor/dashboard");
	};

	/* ----------------------
	    FILE SELECT → OPEN CROPPER
	---------------------- */
	const onSelectFile = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			setImageSrc(reader.result);
			setOpenCropper(true);
		};
		reader.readAsDataURL(file);
	};

	/* ----------------------
	    CROP HANDLER
	---------------------- */
	const onCropComplete = useCallback((_, croppedPixels) => {
		setCroppedAreaPixels(croppedPixels);
	}, []);

	const cropImageNow = async () => {
		try {
			const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

			const file = new File([croppedBlob], "photo.jpg", { type: "image/jpeg" });

			setPhoto(file);
			setOpenCropper(false);

			toast.success("Photo cropped successfully");
		} catch (error) {
			toast.error("Crop failed");
		}
	};

	/* ----------------------
	    FORMATTING INPUTS
	---------------------- */
	const formatAadhaar = (value) => {
		const digits = value.replace(/\D/g, "").slice(0, 12);
		return digits.replace(/(\d{4})(?=\d)/g, "$1-");
	};

	const formatPAN = (value) =>
		value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);

	const formatPhone = (v) => v.replace(/\D/g, "").slice(0, 10);

	/* ----------------------
	    SIGNUP FUNCTION
	---------------------- */
	const signup = async () => {
		if (!isValidEmail) return toast.error("Invalid Email");
		if (!isValidPhone) return toast.error("Phone must be 10 digits");
		if (!isValidAadhaar) return toast.error("Aadhaar must be XXXX-XXXX-XXXX");
		if (!isValidPAN) return toast.error("Invalid PAN number");
		if (!photo) return toast.error("Please upload & crop your photo");

		setSignupLoading(true);

		const fd = new FormData();
		Object.keys(signupData).forEach((k) => fd.append(k, signupData[k]));
		fd.append("photo", photo);

		const res = await fetch("/api/auth/contractor-signup", {
			method: "POST",
			body: fd,
		});

		const data = await res.json();

		setSignupLoading(false);

		if (!data.success) return toast.error(data.msg);

		setOpenSuccessDialog(true);

		setSignupData({
			name: "",
			email: "",
			phone: "",
			address: "",
			aadhaar: "",
			pan: "",
		});
		setPhoto(null);

		document.getElementById("contractor-login-tab").click();
	};

	/* ----------------------
	    UI RETURN
	---------------------- */
	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
			<div className="w-full max-w-lg bg-white shadow-md p-6 rounded-xl">
				<h2 className="text-xl font-bold text-center mb-4">
					Contractor Login / Signup
				</h2>

				<Tabs defaultValue="login">
					<TabsList className="grid grid-cols-2">
						<TabsTrigger id="contractor-login-tab" value="login">
							Login
						</TabsTrigger>
						<TabsTrigger value="signup">Signup</TabsTrigger>
					</TabsList>

					{/* ---------------- LOGIN ---------------- */}
					<TabsContent value="login">
						<div className="space-y-3 mt-5">
							<Input
								placeholder="Contractor ID"
								value={loginData.contractorId}
								onChange={(e) =>
									setLoginData({ ...loginData, contractorId: e.target.value })
								}
							/>

							<Input
								type="password"
								placeholder="Password"
								value={loginData.password}
								onChange={(e) =>
									setLoginData({ ...loginData, password: e.target.value })
								}
							/>

							<Button className="w-full" onClick={login} disabled={loginLoading}>
								{loginLoading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									"Login"
								)}
							</Button>
						</div>
					</TabsContent>

					{/* ---------------- SIGNUP ---------------- */}
					<TabsContent value="signup">
						<div className="space-y-3 mt-5">

							<Input
								placeholder="Name"
								value={signupData.name}
								onChange={(e) =>
									setSignupData({ ...signupData, name: e.target.value })
								}
							/>

							<div className="flex items-center gap-2">
								<Input
									placeholder="Email"
									value={signupData.email}
									onChange={(e) =>
										setSignupData({ ...signupData, email: e.target.value })
									}
								/>
								{signupData.email && <ValidIcon valid={isValidEmail} />}
							</div>

							<div className="flex items-center gap-2">
								<Input
									placeholder="Phone"
									value={signupData.phone}
									onChange={(e) =>
										setSignupData({
											...signupData,
											phone: formatPhone(e.target.value),
										})
									}
								/>
								{signupData.phone && <ValidIcon valid={isValidPhone} />}
							</div>

							<Input
								placeholder="Address"
								value={signupData.address}
								onChange={(e) =>
									setSignupData({ ...signupData, address: e.target.value })
								}
							/>

							<div className="flex items-center gap-2">
								<Input
									placeholder="Aadhaar (XXXX-XXXX-XXXX)"
									value={signupData.aadhaar}
									onChange={(e) =>
										setSignupData({
											...signupData,
											aadhaar: formatAadhaar(e.target.value),
										})
									}
								/>
								{signupData.aadhaar && <ValidIcon valid={isValidAadhaar} />}
							</div>

							<div className="flex items-center gap-2">
								<Input
									placeholder="PAN (ABCDE1234F)"
									value={signupData.pan}
									onChange={(e) =>
										setSignupData({
											...signupData,
											pan: formatPAN(e.target.value),
										})
									}
								/>
								{signupData.pan && <ValidIcon valid={isValidPAN} />}
							</div>

							{/* -------- PHOTO INPUT -------- */}
							<label className="text-sm font-medium">Profile Photo</label>
							<input type="file" accept="image/*" onChange={onSelectFile} />

							{photo && (
								<img
									src={URL.createObjectURL(photo)}
									className="w-24 h-24 rounded-full object-cover mx-auto mt-2 border"
								/>
							)}

							<Button className="w-full" onClick={signup} disabled={signupLoading}>
								{signupLoading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									"Signup"
								)}
							</Button>
						</div>
					</TabsContent>
				</Tabs>
			</div>

			{/* ---------------- CROP POPUP ---------------- */}
			<Dialog open={openCropper} onOpenChange={setOpenCropper}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Crop Your Photo</DialogTitle>
					</DialogHeader>

					<div className="relative w-full h-64 bg-black/40">
						<Cropper
							image={imageSrc}
							crop={crop}
							zoom={zoom}
							aspect={1}
							cropShape="round"
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropComplete}
						/>
					</div>

					<Button className="w-full mt-4" onClick={cropImageNow}>
						Save Cropped Image
					</Button>
				</DialogContent>
			</Dialog>

			{/* ---------------- SUCCESS ---------------- */}
			<Dialog open={openSuccessDialog} onOpenChange={setOpenSuccessDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Signup Successful 🎉</DialogTitle>
					</DialogHeader>

					<p className="text-gray-700">
						Your Contractor account has been created successfully.<br />
						<b>Admin will contact you soon.</b>
					</p>

					<div className="mt-4 flex justify-end">
						<Button onClick={() => setOpenSuccessDialog(false)}>OK</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
