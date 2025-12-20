import { NextResponse } from "next/server";
import Drawing from "@/models/Drawing";
import "@/lib/db";

export async function GET(request, { params }) {
  try {
    const drawing = await Drawing.findByPk(params.id);
    
    if (!drawing) {
      return NextResponse.json({ error: "Drawing not found" }, { status: 404 });
    }

    // For PDFs and documents, redirect to Cloudinary with proper parameters
    if (drawing.fileUrl.includes('.pdf') || 
        drawing.fileUrl.includes('.doc') || 
        drawing.fileUrl.includes('.docx') || 
        drawing.fileUrl.includes('.xls') || 
        drawing.fileUrl.includes('.xlsx')) {
      
      // Add parameters to force inline display
      const separator = drawing.fileUrl.includes('?') ? '&' : '?';
      const modifiedUrl = `${drawing.fileUrl}${separator}dl=0`;
      
      return NextResponse.redirect(modifiedUrl);
    }

    // For images and videos, serve directly
    const response = await fetch(drawing.fileUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

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
