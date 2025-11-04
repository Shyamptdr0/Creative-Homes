"use client";

import HomePage from "@/app/admin/components/Pages/Home";
import UserPage from "@/app/admin/components/Pages/User";
import ProjectsPage from "@/app/admin/components/Pages/Project";
import AdminStagesPage from "@/app/admin/components/Pages/Stage";
import ProfilePage from "@/app/admin/components/Pages/Profile";
import MaterialPage from "@/app/admin/components/Pages/Material";

export default function AllPages({activePage}) {
	switch (activePage) {
		case "Home":
			return <HomePage/>;
		case "Users":
			return <UserPage/>;
		case "Project":
			return <ProjectsPage/>;
		case "Stage":
			return <AdminStagesPage/>;
		case "Material":
			return <MaterialPage/>
		case "Profile":
			return <ProfilePage/>
		default:
			return (<div className="p-4">
					<h2 className="text-xl font-semibold">Page Not Found</h2>
				</div>);
	}
}
