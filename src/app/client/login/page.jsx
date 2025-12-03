"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import Cropper from "react-easy-crop";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import getCroppedImg from "@/lib/getCroppedImg";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ClientAuth() {
	const router = useRouter();

	/* ========================= LOGIN ========================= */
	const [loginData, setLoginData] = useState({
		clientId: "",
		password: "",
	});
	const [loginLoading, setLoginLoading] = useState(false);

	/* ========================= SIGNUP ========================= */
	const [signupData, setSignupData] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		aadhaar: "",
		pan: "",
	});

	const [photoSrc, setPhotoSrc] = useState(null);
	const [croppedBlob, setCroppedBlob] = useState(null);

	const [openCropper, setOpenCropper] = useState(false);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedArea, setCroppedArea] = useState(null);

	const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
	const [signupLoading, setSignupLoading] = useState(false);

	/* ========================= VALIDATIONS ========================= */

	const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email);
	const isValidPhone = /^\d{10}$/.test(signupData.phone);
	const isValidAadhaar = /^\d{4}-\d{4}-\d{4}$/.test(signupData.aadhaar);
	const isValidPAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(signupData.pan);

	const ValidIcon = ({ valid }) =>
		valid ? (
			<CheckCircle className="text-green-600 w-5 h-5" />
		) : (
			<XCircle className="text-red-600 w-5 h-5" />
		);

	/* ========================= CROP HANDLERS ========================= */

	const onCropComplete = useCallback((_, area) => {
		setCroppedArea(area);
	}, []);

	const handleCropDone = async () => {
		const blob = await getCroppedImg(photoSrc, croppedArea);
		setCroppedBlob(blob);
		setOpenCropper(false);
		toast.success("Photo cropped successfully");
	};

	const handlePhotoChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setPhotoSrc(URL.createObjectURL(file));
		setOpenCropper(true);
	};

	/* ========================= LOGIN FUNCTION ========================= */

	const login = async () => {
		setLoginLoading(true);

		const res = await fetch("/api/auth/client-login", {
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

		router.push("/client/dashboard");
	};

	/* ========================= SIGNUP FUNCTION ========================= */

	const signup = async () => {
		if (!isValidEmail) return toast.error("Enter valid Email");
		if (!isValidPhone) return toast.error("Phone must be 10 digits");
		if (!isValidAadhaar) return toast.error("Aadhaar must be XXXX-XXXX-XXXX");
		if (!isValidPAN) return toast.error("Invalid PAN Number");
		if (!croppedBlob) return toast.error("Please upload your profile photo");

		setSignupLoading(true);

		const fd = new FormData();
		Object.keys(signupData).forEach((key) => fd.append(key, signupData[key]));
		fd.append("photo", croppedBlob);

		const res = await fetch("/api/auth/client-signup", {
			method: "POST",
			body: fd,
		});

		const data = await res.json();
		setSignupLoading(false);

		if (!data.success) return toast.error("Signup failed");

		setOpenSuccessDialog(true);

		setSignupData({
			name: "",
			email: "",
			phone: "",
			address: "",
			aadhaar: "",
			pan: "",
		});
		setCroppedBlob(null);

		document.getElementById("client-login-tab").click();
	};

	/* ========================= UI ========================= */

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
			<div className="w-full max-w-lg bg-white shadow-md p-6 rounded-xl">

				<h2 className="text-xl font-bold text-center mb-4">
					Client Login / Signup
				</h2>

				<Tabs defaultValue="login">
					<TabsList className="grid grid-cols-2">
						<TabsTrigger id="client-login-tab" value="login">
							Login
						</TabsTrigger>
						<TabsTrigger value="signup">Signup</TabsTrigger>
					</TabsList>

					{/* ================= LOGIN ================= */}

					<TabsContent value="login">
						<div className="space-y-3 mt-5">

							<Input
								placeholder="Client ID"
								onChange={(e) =>
									setLoginData({ ...loginData, clientId: e.target.value })
								}
							/>

							<Input
								type="password"
								placeholder="Password"
								onChange={(e) =>
									setLoginData({ ...loginData, password: e.target.value })
								}
							/>

							<Button
								className="w-full"
								onClick={login}
								disabled={loginLoading}
							>
								{loginLoading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									"Login"
								)}
							</Button>

						</div>
					</TabsContent>

					{/* ================= SIGNUP ================= */}

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
									maxLength={10}
									value={signupData.phone}
									onChange={(e) =>
										setSignupData({
											...signupData,
											phone: e.target.value.replace(/\D/g, ""),
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
									maxLength={14}
									value={signupData.aadhaar}
									onChange={(e) => {
										let v = e.target.value.replace(/\D/g, "");
										if (v.length > 4) v = v.replace(/(\d{4})(\d+)/, "$1-$2");
										if (v.length > 8) v = v.replace(/(\d{4}-\d{4})(\d+)/, "$1-$2");
										setSignupData({ ...signupData, aadhaar: v });
									}}
								/>
								{signupData.aadhaar && <ValidIcon valid={isValidAadhaar} />}
							</div>

							<div className="flex items-center gap-2">
								<Input
									placeholder="PAN (ABCDE1234F)"
									maxLength={10}
									value={signupData.pan}
									onChange={(e) =>
										setSignupData({
											...signupData,
											pan: e.target.value.toUpperCase(),
										})
									}
								/>
								{signupData.pan && <ValidIcon valid={isValidPAN} />}
							</div>

							{/* PHOTO UPLOAD */}
							<label className="text-sm font-medium">Profile Photo</label>
							<input type="file" accept="image/*" onChange={handlePhotoChange} />

							{croppedBlob && (
								<img
									src={URL.createObjectURL(croppedBlob)}
									className="w-24 h-24 rounded-full object-cover mx-auto mt-3 border"
								/>
							)}

							<Button
								className="w-full"
								onClick={signup}
								disabled={signupLoading}
							>
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

			{/* ================= CROP POPUP ================= */}

			<Dialog open={openCropper} onOpenChange={setOpenCropper}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Adjust Profile Photo</DialogTitle>
					</DialogHeader>

					<div className="relative w-full h-72 bg-black">
						<Cropper
							image={photoSrc}
							crop={crop}
							zoom={zoom}
							aspect={1}
							cropShape="round"
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropComplete}
						/>
					</div>

					<Button className="w-full mt-4" onClick={handleCropDone}>
						Save Photo
					</Button>
				</DialogContent>
			</Dialog>

			{/* ================= SUCCESS POPUP ================= */}

			<Dialog open={openSuccessDialog} onOpenChange={setOpenSuccessDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Signup Successful 🎉</DialogTitle>
					</DialogHeader>
					<p>Your Client account has been created successfully.<br />Admin will contact you soon.</p>
					<Button className="mt-3" onClick={() => setOpenSuccessDialog(false)}>
						OK
					</Button>
				</DialogContent>
			</Dialog>
		</div>
	);
}
