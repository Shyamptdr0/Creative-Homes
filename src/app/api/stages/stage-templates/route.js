import StageTemplate from "@/models/StageTemplate";
import ProjectType from "@/models/ProjectType";


export async function GET() {
	try {
		const stages = await StageTemplate.findAll({
			include: [{ model: ProjectType }]
		});

		return Response.json({ success: true, stages });
	} catch (err) {
		return Response.json({ success: false, error: err.message });
	}
}

export async function POST(req) {
	try {
		const body = await req.json();

		const stage = await StageTemplate.create({
			name: body.name,
			projectTypeId: body.projectTypeId
		});

		return Response.json({ success: true, stage });
	} catch (err) {
		return Response.json({ success: false, error: err.message });
	}
}
