"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
	return (
		<section className="w-full bg-white py-20 px-6 md:px-16">
			<div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start gap-16">
				{/* LEFT SECTION */}
				<div className="w-full lg:w-1/2 space-y-8">
					<h2 className="text-4xl md:text-5xl font-bold text-black">
						Get in Touch
					</h2>
					<p className="text-gray-700 leading-relaxed">
						We’d love to hear from you. Whether you have a question, want to
						discuss a project, or simply want to say hello — reach out using the
						form or the details below.
					</p>

					<div className="space-y-6 text-gray-800">
						<div className="flex items-center gap-4">
							<Mail className="w-6 h-6 text-lime-600" />
							<div>
								<h4 className="font-semibold text-black">Email</h4>
								<p>info@creativehomes.com</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<Phone className="w-6 h-6 text-lime-600" />
							<div>
								<h4 className="font-semibold text-black">Phone</h4>
								<p>+91 12345 67890</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<MapPin className="w-6 h-6 text-lime-600" />
							<div>
								<h4 className="font-semibold text-black">Office</h4>
								<p>
									240, Russell Street, QT Melbourne
                                    <br/>
									Victoria,Melbourne
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* RIGHT SECTION - CONTACT FORM */}
				<div className="w-full lg:w-1/2 bg-gray-50 rounded-2xl shadow-md p-8 md:p-10 space-y-6">
					<h3 className="text-2xl font-semibold text-black mb-2">
						Send us a message
					</h3>

					<form className="space-y-5">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label className="text-sm font-medium text-gray-700">
									Full Name
								</label>
								<Input
									type="text"
									placeholder="Your Name"
									className="mt-1 bg-white"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">
									Email Address
								</label>
								<Input
									type="email"
									placeholder="you@example.com"
									className="mt-1 bg-white"
								/>
							</div>
						</div>

						<div>
							<label className="text-sm font-medium text-gray-700">
								Subject
							</label>
							<Input
								type="text"
								placeholder="Project Inquiry, Feedback, etc."
								className="mt-1 bg-white"
							/>
						</div>

						<div>
							<label className="text-sm font-medium text-gray-700">
								Message
							</label>
							<Textarea
								placeholder="Write your message here..."
								className="mt-1 bg-white min-h-[150px]"
							/>
						</div>

						<Button className="w-full md:w-fit px-8 py-2 text-lg bg-black text-white rounded-lg hover:bg-neutral-800 transition">
							Send Message
						</Button>
					</form>
				</div>
			</div>
		</section>
	);
}
