"use client";

import React, { useState } from "react";

export default function BookMeetingPage() {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		mobile: "",
		city: "",
		ownPlot: "",
		startTime: "",
		agree: false,
	});

	const cities = ["City A", "City B", "City C"];

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
		alert("Meeting request submitted!");
	};

	return (
		<div className="w-full min-h-screen bg-gray-50 flex items-center justify-center py-20 px-6">
			<div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-8">
				{/* Heading */}
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold mb-2">You Dream. We Deliver.</h1>
					<p className="text-gray-600 text-lg">
						Ready to build your dream home? Schedule a free consultation to start your journey today.
					</p>
				</div>

				{/* Form */}
				<form className="space-y-6" onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Full Name */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
							<input
								type="text"
								name="fullName"
								value={formData.fullName}
								onChange={handleChange}
								placeholder="Enter your full name"
								required
								className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
							/>
						</div>

						{/* Email */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="Enter your email"
								required
								className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
							/>
						</div>

						{/* Mobile */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
							<input
								type="tel"
								name="mobile"
								value={formData.mobile}
								onChange={handleChange}
								placeholder="Enter your mobile number"
								required
								className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
							/>
						</div>

						{/* Choose City */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Choose City</label>
							<select
								name="city"
								value={formData.city}
								onChange={handleChange}
								required
								className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
							>
								<option value="">Select a city</option>
								{cities.map((city) => (
									<option key={city} value={city}>{city}</option>
								))}
							</select>
						</div>

						{/* Own a Plot */}
						<div className="lg:col-span-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">Do you own a plot of land?</label>
							<div className="flex gap-6">
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="ownPlot"
										value="Yes"
										checked={formData.ownPlot === "Yes"}
										onChange={handleChange}
										required
										className="accent-lime-500"
									/>
									Yes
								</label>
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="ownPlot"
										value="No"
										checked={formData.ownPlot === "No"}
										onChange={handleChange}
										required
										className="accent-lime-500"
									/>
									No
								</label>
							</div>
						</div>

						{/* Start Construction Time */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">I want to start construction in</label>
							<select
								name="startTime"
								value={formData.startTime}
								onChange={handleChange}
								required
								className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
							>
								<option value="">Select timeline</option>
								<option value="0-3 months">0-3 months</option>
								<option value="3-6 months">3-6 months</option>
								<option value="6-12 months">6-12 months</option>
								<option value="12+ months">12+ months</option>
							</select>
						</div>

						{/* Privacy Policy */}
						<div className="flex items-center gap-2 lg:col-span-2">
							<input
								type="checkbox"
								name="agree"
								checked={formData.agree}
								onChange={handleChange}
								required
								className="accent-lime-500"
							/>
							<label className="text-sm text-gray-700">
								I agree to Privacy Policy and Terms & Conditions
							</label>
						</div>
					</div>

					{/* Submit Button */}
					<div className="text-center">
						<button
							type="submit"
							className="px-10 py-3 bg-lime-600 hover:bg-lime-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg"
						>
							Book a Meeting
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
