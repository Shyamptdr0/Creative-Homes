"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SidebarPage({
	                                    role = "admin",
	                                    menuItems = [],
	                                    contentComponent: ContentComponent,
                                    }) {
	const router = useRouter();

	const [activePage, setActivePage] = useState(() => {
		if (typeof window !== "undefined") {
			return sessionStorage.getItem(`${role}-activePage`) || menuItems[0]?.title;
		}
	});

	const handleSetActivePage = (page) => {
		setActivePage(page);
		sessionStorage.setItem(`${role}-activePage`, page);
	};

	const logout = () => {
		sessionStorage.clear();
		router.push(`/${role}/login`);
	};

	return (
		<SidebarProvider>
			<div className="flex h-screen w-full bg-gray-50">
				{/* Sidebar */}
				<Sidebar collapsible="icon" className="border-r border-gray-200">
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel className="text-lg font-semibold capitalize mb-3 text-gray-700">
                <span className="group-data-[collapsible=icon]:hidden">
                  {role} Panel
                </span>
							</SidebarGroupLabel>

							<SidebarGroupContent>
								<SidebarMenu className="mt-2 space-y-1">
									{menuItems.map((item) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton
												type="button"
												onClick={() => handleSetActivePage(item.title)}
												className={cn(
													"cursor-pointer flex items-center gap-3 py-3 px-3 rounded-lg transition-all text-[16px] font-medium",
													activePage === item.title
														? "bg-primary text-white shadow-sm hover:bg-gray-200"
														: "text-gray-700 hover:bg-gray-200 hover:text-black"
												)}
											>
												<item.icon className="h-6 w-6" />
												<span>{item.title}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>

					{/* Logout */}
					<SidebarFooter>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={logout}
									className="flex items-center gap-3 py-3 px-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-medium shadow-sm text-sm cursor-pointer"
								>
									<LogOut className="h-5 w-5" /> Logout
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
				</Sidebar>

				{/* Main Content */}
				<main className="flex-1 flex flex-col">
					<div className="p-6 flex-1 overflow-auto">
						<div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg border shadow-sm">
							<h1 className="text-xl font-bold text-gray-800">{activePage}</h1>
							<SidebarTrigger />
						</div>

						{/* ✅ FIX: pass setActivePage down */}
						{ContentComponent && (
							<ContentComponent
								activePage={activePage}
								setActivePage={handleSetActivePage}
								role={role}
							/>
						)}
					</div>
				</main>
			</div>
		</SidebarProvider>
	);
}
