import { NextResponse } from "next/server";
import Drawing from "@/models/Drawing";
import "@/lib/db";

export async function GET(req, { params }) {
  try {
    // Extract ID from params - it might be nested differently
    const id = params.id || (params && params.id);
    
    console.log('Request params:', params);
    console.log('Extracted ID:', id);
    
    if (!id) {
      console.log('No ID provided in params');
      return NextResponse.json({ error: "No ID provided" }, { status: 400 });
    }
    
    const drawing = await Drawing.findByPk(id);
    
    if (!drawing) {
      console.log('Drawing not found for ID:', id);
      return NextResponse.json({ error: "Drawing not found" }, { status: 404 });
    }

    console.log('Found drawing:', drawing.id, drawing.title, drawing.fileUrl);

    // Fetch the file from Cloudinary
    const response = await fetch(drawing.fileUrl);
    
    if (!response.ok) {
      console.log('Failed to fetch file from Cloudinary:', response.status);
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    console.log('File fetched successfully, content-type:', contentType);

    // Return the file with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${drawing.title}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
