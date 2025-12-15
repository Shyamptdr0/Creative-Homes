"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Paperclip, X, CheckCircle, Clock, MessageCircle, ChevronLeft, Search, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ClientQueriesPage() {
	const [projects, setProjects] = useState([]);
	const [queries, setQueries] = useState([]);
	const [selectedIssue, setSelectedIssue] = useState(null);
	const [chatMessages, setChatMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [chatImage, setChatImage] = useState(null);
	const [issuesByProject, setIssuesByProject] = useState({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showNewIssue, setShowNewIssue] = useState(false);
	const [newIssueProject, setNewIssueProject] = useState("");
	const [newIssueMessage, setNewIssueMessage] = useState("");
	const [newIssueImage, setNewIssueImage] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	
	const chatEndRef = useRef(null);
	const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
	
	let clientId = null;
	if (token) {
		try {
			const decoded = JSON.parse(atob(token.split(".")[1]));
			clientId = decoded.id;
		} catch (err) {
			console.error("CLIENT QUERY - TOKEN DECODE ERROR:", err);
		}
	}

	const fetchProjects = async () => {
		try {
			const res = await fetch("/api/clients/projects", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (data.success && Array.isArray(data.projects)) {
				setProjects(data.projects);
			}
		} catch (error) {
			console.error("CLIENT QUERY - PROJECT FETCH ERROR:", error);
		}
	};

	const fetchQueries = async () => {
		try {
			const res = await fetch("/api/clients/queries", {
				headers: { Authorization: `Bearer ${token}` },
			});
			let data = await res.json();
			if (!data.success) return setQueries([]);
			
			const sorted = data.queries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setQueries(sorted);
			
			// Group queries by project and issue
			const grouped = {};
			sorted.forEach(query => {
				const projectTitle = query.Project?.title || "Unknown Project";
				if (!grouped[projectTitle]) {
					grouped[projectTitle] = [];
				}
				grouped[projectTitle].push(query);
			});
			setIssuesByProject(grouped);
		} catch (error) {
			console.error("CLIENT QUERY - QUERY FETCH ERROR:", error);
			setQueries([]);
		}
	};

	const createNewIssue = async () => {
		if (!newIssueProject) return toast.error("Please select a project");
		if (!newIssueMessage.trim()) return toast.error("Please enter your issue");

		setSaving(true);
		const formData = new FormData();
		formData.append("projectId", newIssueProject);
		formData.append("clientId", clientId);
		formData.append("message", newIssueMessage);
		if (newIssueImage) {
			formData.append("image", newIssueImage);
		}

		try {
			const res = await fetch("/api/queries", {
				method: "POST",
				body: formData
			});

			if (res.ok) {
				toast.success("Issue created successfully!");
				setNewIssueProject("");
				setNewIssueMessage("");
				setNewIssueImage(null);
				setShowNewIssue(false);
				fetchQueries();
			} else {
				toast.error("Failed to create issue");
			}
		} catch (error) {
			toast.error("Error creating issue");
		} finally {
			setSaving(false);
		}
	};

	const sendMessage = async () => {
		if (!newMessage.trim() && !chatImage) return;
		if (!selectedIssue) return toast.error("Please select an issue");

		setSaving(true);
		const formData = new FormData();
		formData.append("queryId", selectedIssue.id);
		formData.append("message", newMessage);
		formData.append("senderType", "client");
		formData.append("senderId", clientId);
		if (chatImage) {
			formData.append("image", chatImage);
		}

		try {
			const res = await fetch("/api/queries/reply", {
				method: "POST",
				body: formData
			});

			if (res.ok) {
				setNewMessage("");
				setChatImage(null);
				fetchQueries();
				loadIssueMessages(selectedIssue);
			} else {
				toast.error("Failed to send message");
			}
		} catch (error) {
			toast.error("Error sending message");
		} finally {
			setSaving(false);
		}
	};

	const loadIssueMessages = (issue) => {
		// Load messages for the selected issue
		const messages = [
			{
				id: 1,
				message: issue.message,
				image: issue.image,
				senderType: "client",
				senderName: "You",
				createdAt: issue.createdAt
			}
		];
		
		if (issue.reply) {
			messages.push({
				id: 2,
				message: issue.reply,
				senderType: "contractor",
				senderName: "Contractor",
				createdAt: issue.updatedAt
			});
		}
		
		setChatMessages(messages);
	};

	const selectIssue = (issue) => {
		setSelectedIssue(issue);
		loadIssueMessages(issue);
		setTimeout(() => {
			chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	};

	useEffect(() => {
		if (token && clientId) {
			Promise.all([fetchProjects(), fetchQueries()]).then(() =>
				setLoading(false)
			);
		}
	}, [token, clientId]);

	// Filter issues based on search
	const filteredIssues = Object.entries(issuesByProject).reduce((acc, [project, issues]) => {
		const filtered = issues.filter(issue => 
			issue.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
			project.toLowerCase().includes(searchTerm.toLowerCase())
		);
		if (filtered.length > 0) {
			acc[project] = filtered;
		}
		return acc;
	}, {});

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Issues Sidebar */}
			<div className="w-96 bg-white border-r flex flex-col">
				<div className="p-4 border-b">
					<h1 className="text-2xl font-bold mb-4">Issues & Queries</h1>
					
					{/* Search Bar */}
					<div className="relative mb-4">
						<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Search issues..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* New Issue Button */}
					<Button
						onClick={() => setShowNewIssue(true)}
						className="w-full bg-green-600 hover:bg-green-700"
					>
						<Plus className="h-4 w-4 mr-2" />
						Create New Issue
					</Button>
				</div>

				{/* Issues List */}
				<div className="flex-1 overflow-y-auto">
					{Object.entries(filteredIssues).map(([project, issues]) => (
						<div key={project} className="border-b">
							<div className="px-4 py-2 bg-gray-100 font-semibold text-sm">
								{project}
							</div>
							{issues.map((issue) => (
								<div
									key={issue.id}
									onClick={() => selectIssue(issue)}
									className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
										selectedIssue?.id === issue.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
									}`}
								>
									<div className="flex items-start justify-between mb-2">
										<div className="flex-1">
											<p className="font-medium text-sm line-clamp-2">{issue.message}</p>
											{issue.image && (
												<div className="mt-1">
													<Paperclip className="h-3 w-3 text-gray-400 inline" />
													<span className="text-xs text-gray-500 ml-1">Attachment</span>
												</div>
											)}
										</div>
										<Badge 
											variant={issue.status === 'resolved' ? 'default' : 'secondary'}
											className={`text-xs ${
												issue.status === 'resolved' 
													? 'bg-green-100 text-green-800' 
													: 'bg-yellow-100 text-yellow-800'
											}`}
										>
											{issue.status === 'resolved' ? (
												<>
													<CheckCircle className="h-3 w-3 mr-1" />
													Resolved
												</>
											) : (
												<>
													<Clock className="h-3 w-3 mr-1" />
													Open
												</>
											)}
										</Badge>
									</div>
									<p className="text-xs text-gray-500">
										{new Date(issue.createdAt).toLocaleDateString()}
									</p>
								</div>
							))}
						</div>
					))}
				</div>
			</div>

			{/* Chat Interface */}
			<div className="flex-1 flex flex-col">
				{selectedIssue ? (
					<>
						{/* Chat Header */}
						<div className="bg-white border-b p-4">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="font-semibold text-lg">
										{selectedIssue.Project?.title || "Unknown Project"}
									</h2>
									<p className="text-sm text-gray-500">
										Issue #{selectedIssue.id}
									</p>
								</div>
								<Badge 
									variant={selectedIssue.status === 'resolved' ? 'default' : 'secondary'}
									className={`${
										selectedIssue.status === 'resolved' 
											? 'bg-green-100 text-green-800' 
											: 'bg-yellow-100 text-yellow-800'
									}`}
								>
									{selectedIssue.status === 'resolved' ? 'Resolved' : 'Open'}
								</Badge>
							</div>
						</div>

						{/* Messages */}
						<div className="flex-1 overflow-y-auto p-4 bg-gray-50">
							{chatMessages.map((msg) => (
								<div
									key={msg.id}
									className={`mb-4 flex ${
										msg.senderType === "client" ? "justify-end" : "justify-start"
									}`}
								>
									<div className={`max-w-xs lg:max-w-md ${
										msg.senderType === "client" 
											? "bg-blue-500 text-white" 
											: "bg-white border"
									} rounded-lg p-3 shadow`}>
										<p className="text-xs font-semibold mb-1 opacity-75">
											{msg.senderName}
										</p>
										<p className="text-sm">{msg.message}</p>
										{msg.image && (
											<div className="mt-2">
												<img 
													src={msg.image} 
													alt="Attachment" 
													className="rounded max-h-40 w-full object-cover"
												/>
											</div>
										)}
										<p className={`text-xs mt-1 ${
											msg.senderType === "client" ? "text-blue-100" : "text-gray-500"
										}`}>
											{new Date(msg.createdAt).toLocaleTimeString()}
										</p>
									</div>
								</div>
							))}
							<div ref={chatEndRef} />
						</div>

						{/* Message Input */}
						<div className="bg-white border-t p-4">
							{chatImage && (
								<div className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between">
									<span className="text-sm text-gray-600">Image attached</span>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => setChatImage(null)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							)}
							<div className="flex items-center gap-2">
								<input
									type="file"
									accept="image/*"
									onChange={(e) => setChatImage(e.target.files[0])}
									className="hidden"
									id="chat-image-upload"
								/>
								<label htmlFor="chat-image-upload">
									<Button size="sm" variant="ghost" type="button">
										<Paperclip className="h-4 w-4" />
									</Button>
								</label>
								<Textarea
									placeholder="Type your message..."
									value={newMessage}
									onChange={(e) => setNewMessage(e.target.value)}
									className="flex-1 min-h-[40px] max-h-[120px]"
									onKeyPress={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											sendMessage();
										}
									}}
								/>
								<Button 
									onClick={sendMessage} 
									disabled={saving}
									className="bg-blue-500 hover:bg-blue-600"
								>
									{saving ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Send className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</>
				) : (
					<div className="flex-1 flex items-center justify-center bg-gray-50">
						<div className="text-center">
							<MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-gray-600 mb-2">
								Select an issue to start chatting
							</h3>
							<p className="text-gray-500">
								Choose an issue from the sidebar to view and send messages
							</p>
						</div>
					</div>
				)}
			</div>

			{/* New Issue Modal */}
			{showNewIssue && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<Card className="w-full max-w-md">
						<CardHeader>
							<CardTitle>Create New Issue</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">Project</label>
								<select
									className="w-full border rounded-lg px-3 py-2"
									value={newIssueProject}
									onChange={(e) => setNewIssueProject(e.target.value)}
								>
									<option value="">Select Project</option>
									{projects.map((p) => (
										<option key={p.id} value={p.id}>
											{p.title}
										</option>
									))}
								</select>
							</div>
							
							<div>
								<label className="block text-sm font-medium mb-2">Issue Description</label>
								<Textarea
									placeholder="Describe your issue..."
									value={newIssueMessage}
									onChange={(e) => setNewIssueMessage(e.target.value)}
									className="min-h-[100px]"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">Image (optional)</label>
								<input
									type="file"
									accept="image/*"
									onChange={(e) => setNewIssueImage(e.target.files[0])}
									className="w-full border rounded-lg px-3 py-2"
								/>
								{newIssueImage && (
									<div className="mt-2">
										<img 
											src={URL.createObjectURL(newIssueImage)} 
											alt="Preview" 
											className="rounded max-h-32 w-full object-cover"
										/>
									</div>
								)}
							</div>

							<div className="flex gap-2 pt-4">
								<Button
									variant="outline"
									onClick={() => {
										setShowNewIssue(false);
										setNewIssueProject("");
										setNewIssueMessage("");
										setNewIssueImage(null);
									}}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									onClick={createNewIssue}
									disabled={saving}
									className="flex-1 bg-green-600 hover:bg-green-700"
								>
									{saving ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : null}
									Create Issue
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
