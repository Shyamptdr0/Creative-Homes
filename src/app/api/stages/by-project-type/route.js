import StageTemplate from "@/models/StageTemplate";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const projectTypeId = searchParams.get("projectTypeId");

		const stages = await StageTemplate.findAll({
			where: { projectTypeId }
		});

		return Response.json({ success: true, stages });
	} catch (err) {
		return Response.json({ success: false, error: err.message });
	}
}
