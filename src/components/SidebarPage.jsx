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
import {LogOut} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState, useEffect} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import HeaderPage from "@/components/HeaderPage";

export default function SidebarPage({
	                                        role = "admin", // admin | client | contractor
	                                        menuItems = [],
	                                        contentComponent: ContentComponent,
                                        }) {
	const router = useRouter();

	// ✅ Keep track of active page
	const [activePage, setActivePage] = useState(() => {
		if (typeof window !== "undefined") {
			return sessionStorage.getItem(`${role}-activePage`) || menuItems[0]?.title || "Dashboard";
		}
		// return "Dashboard";
	});

	const [openMenus, setOpenMenus] = useState({});

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
			<div className="flex h-screen w-full">
				{/* Sidebar */}
				<Sidebar collapsible="icon">
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel className="text-lg font-bold capitalize">
								<span className="group-data-[collapsible=icon]:hidden">
									{role} Panel
								</span>
							</SidebarGroupLabel>

							<SidebarGroupContent>
								<SidebarMenu className="mt-4">
									{menuItems.map((item) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton
												type="button"
												onClick={() => handleSetActivePage(item.title)}
												className={cn(
													"cursor-pointer flex items-center gap-2 mt-2 py-5",
													activePage === item.title
														? "bg-primary text-white font-bold rounded-md"
														: "bg-gray-200 hover:bg-gray-300 hover:text-black"
												)}
											>
												<item.icon className="h-5 w-5"/>
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
									className="flex items-center gap-2 bg-primary text-white rounded-md px-3 hover:bg-primary/90 hover:text-white/90 py-3 cursor-pointer"
								>
									<LogOut className="h-5 w-5"/> Logout
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
				</Sidebar>

				{/* Main Content */}
				<main className="flex-1 flex flex-col">
					<HeaderPage/>
					<div className="p-6 flex-1 overflow-auto">
						<div className="flex justify-between items-center mb-6">
							<h1 className="text-2xl font-bold">{activePage}</h1>
							<SidebarTrigger/>
						</div>

						{/* ✅ Dynamic content */}
						{ContentComponent && (
							<ContentComponent activePage={activePage} role={role}/>
						)}
					</div>
				</main>
			</div>
		</SidebarProvider>
	);
}
