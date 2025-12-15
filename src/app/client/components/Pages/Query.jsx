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
	const [selectedProject, setSelectedProject] = useState(null);
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
	
	// WhatsApp-style time formatting
	const formatMessageTime = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		
		const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		
		if (messageDate.getTime() === today.getTime()) {
			// Today - show time only
			return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
		} else if (messageDate.getTime() === yesterday.getTime()) {
			// Yesterday
			return 'Yesterday';
		} else if (messageDate.getFullYear() === now.getFullYear()) {
			// This year - show month and day
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		} else {
			// Other years - show full date
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		}
	};
	
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
				// Immediately refresh queries to show new issue on left side
				await fetchQueries();
				// If the issue was created for the currently selected project, refresh messages
				const projectName = projects.find(p => p.id === newIssueProject)?.title;
				if (projectName === selectedProject) {
					loadProjectMessages(selectedProject);
				}
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
		if (!selectedProject) return toast.error("Please select a project");

		setSaving(true);
		const formData = new FormData();
		formData.append("projectId", projects.find(p => p.title === selectedProject)?.id);
		formData.append("clientId", clientId);
		formData.append("message", newMessage);
		formData.append("senderType", "client");
		formData.append("senderId", clientId);
		if (chatImage) {
			formData.append("image", chatImage);
		}

		try {
			const res = await fetch("/api/queries", {
				method: "POST",
				body: formData
			});

			if (res.ok) {
				setNewMessage("");
				setChatImage(null);
				// Immediately refresh queries to show new issue on left side
				await fetchQueries();
				// Also refresh messages to show in chat
				loadProjectMessages(selectedProject);
			} else {
				toast.error("Failed to send message");
			}
		} catch (error) {
			toast.error("Error sending message");
		} finally {
			setSaving(false);
		}
	};

	const loadProjectMessages = (project) => {
		// Load all messages for the selected project
		const projectQueries = queries.filter(query => query.Project?.title === project);
		const messages = [];
		
		projectQueries.forEach(query => {
			// Original message - check who sent it
			if (query.clientId) {
				// Client sent the original message
				messages.push({
					id: query.id,
					message: query.message,
					image: query.image,
					senderType: "client",
					senderName: "You",
					createdAt: query.createdAt,
					status: query.status
				});
			} else if (query.contractorId) {
				// Contractor sent the original message
				messages.push({
					id: query.id,
					message: query.message,
					image: query.image,
					senderType: "contractor",
					senderName: `Contractor: ${query.Contractor?.name || "Unknown"}`,
					createdAt: query.createdAt,
					status: query.status
				});
			} else if (query.adminId || (!query.clientId && !query.contractorId)) {
				// Admin sent the original message (either has adminId or has no clientId/contractorId)
				messages.push({
					id: query.id,
					message: query.message,
					image: query.image,
					senderType: "admin",
					senderName: "Admin",
					createdAt: query.createdAt,
					status: query.status
				});
			}
			
			// Reply from admin
			if (query.reply) {
				messages.push({
					id: query.id + '_reply',
					message: query.reply,
					senderType: "admin",
					senderName: "Admin",
					createdAt: query.updatedAt
				});
			}
		});
		
		// Sort messages by date
		messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
		setChatMessages(messages);
	};

	const selectProject = (project) => {
		setSelectedProject(project);
		loadProjectMessages(project);
		setTimeout(() => {
			chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	};

	useEffect(() => {
		if (token && clientId) {
			setLoading(true);
			Promise.all([fetchProjects(), fetchQueries()]).then(() => {
				if (projects.length > 0 && !selectedProject) {
					const firstProject = projects[0].title;
					setSelectedProject(firstProject);
					loadProjectMessages(firstProject);
				}
				setLoading(false);
			}).catch(() => {
				setLoading(false);
			});
		}
	}, [token, clientId]);

	// Real-time polling for messages and queries
	useEffect(() => {
		if (!selectedProject) return;

		const interval = setInterval(() => {
			loadProjectMessages(selectedProject);
			fetchQueries(); // Also refresh queries to update badges
		}, 3000); // Poll every 3 seconds

		return () => clearInterval(interval);
	}, [selectedProject, token, clientId]);

	const filteredIssues = Object.entries(issuesByProject).reduce((acc, [project, issues]) => {
		const filtered = issues.filter(issue => 
			issue.message.toLowerCase().includes(searchTerm.toLowerCase())
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

				{/* Projects List - WhatsApp Style */}
				<div className="flex-1 overflow-y-auto">
					{Object.entries(filteredIssues).map(([project, issues]) => (
						<div key={project} className="border-b">
							<div
								onClick={() => selectProject(project)}
								className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
									selectedProject === project ? 'border-blue-500 bg-blue-50' : 'border-transparent'
								}`}
							>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-3">
										<div>
											<h3 className="font-semibold text-lg">{project}</h3>
											<p className="text-sm text-gray-500">
												{issues.length} {issues.length === 1 ? 'issue' : 'issues'}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{/* WhatsApp-style notification badge for unread messages */}
										{(() => {
											const unreadCount = issues.filter(q => q.status === 'open').length;
											if (unreadCount > 0) {
												return (
													<span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
														{unreadCount > 99 ? "99+" : unreadCount}
													</span>
												);
											}
											return null;
										})()}
										<Badge 
											variant="default"
											className={`text-xs ${
												issues.some(q => q.status === 'open') 
													? 'bg-yellow-100 text-yellow-800' 
													: issues.some(q => q.status === 'in-progress')
														? 'bg-green-100 text-green-800'
														: 'bg-gray-100 text-gray-800'
											}`}
										>
											{issues.some(q => q.status === 'open') ? (
												<>
													<Clock className="h-3 w-3 mr-1" />
													Open
												</>
											) : issues.some(q => q.status === 'in-progress') ? (
												<>
													<CheckCircle className="h-3 w-3 mr-1" />
													In Progress
												</>
											) : (
												<>
													<CheckCircle className="h-3 w-3 mr-1" />
													Resolved
												</>
											)}
										</Badge>
									</div>
								</div>
								{/* Show only the most recent issue */}
								{issues.length > 0 && (
									<div className="text-sm text-gray-600 mt-1 line-clamp-2">
										{issues[0].message}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Chat Interface */}
			<div className="flex-1 flex flex-col">
				{selectedProject ? (
					<>
						{/* Chat Header */}
						<div className="bg-white border-b p-4">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="font-semibold text-lg">
										{selectedProject}
									</h2>
									<p className="text-sm text-gray-500">
										{issuesByProject[selectedProject]?.length || 0} issues
									</p>
								</div>
								<Badge 
									variant="default"
									className={`text-xs ${
										issuesByProject[selectedProject]?.some(q => q.status === 'open') 
											? 'bg-yellow-100 text-yellow-800' 
											: issuesByProject[selectedProject]?.some(q => q.status === 'in-progress')
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-800'
									}`}
								>
									{issuesByProject[selectedProject]?.some(q => q.status === 'open') ? 'Open Issues' : 
									 issuesByProject[selectedProject]?.some(q => q.status === 'in-progress') ? 'In Progress' : 'All Resolved'}
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
											{formatMessageTime(msg.createdAt)}
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
								Select a project to start chatting
							</h3>
							<p className="text-gray-500">
								Choose a project from the sidebar to view and send messages
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
