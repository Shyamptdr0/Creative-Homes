import Material from "@/models/Material";
import Project from "@/models/Project";

export async function updateProjectMaterialTotal(projectId) {
	const materials = await Material.findAll({
		where: { projectId },
		attributes: ["cost"]
	});

	const total = materials.reduce((sum, m) => sum + Number(m.cost || 0), 0);

	await Project.update(
		{ totalMaterialCost: total },
		{ where: { id: projectId } }
	);
}
