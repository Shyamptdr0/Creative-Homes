import Query from '@/models/Query';
import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';
import '@/lib/db';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const queryId = formData.get('queryId');
    const message = formData.get('message');
    const senderType = formData.get('senderType');
    const senderId = formData.get('senderId');
    const image = formData.get('image');

    const query = await Query.findByPk(queryId);
    if (!query) {
      return NextResponse.json({ success: false, message: 'Query not found' }, { status: 404 });
    }

    let imageUrl = null;
    if (image && image.name) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await uploadToCloudinary(buffer, 'queries');
    }

    // Update query with reply (for now, append to reply field)
    const updatedReply = query.reply ? query.reply + '\n\n' + message : message;
    await query.update({ 
      reply: updatedReply,
      imageUrl: imageUrl || query.imageUrl 
    });

    return NextResponse.json({ success: true, query });
  } catch (error) {
    console.error('REPLY ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
