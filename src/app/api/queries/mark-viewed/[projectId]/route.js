import { NextResponse } from 'next/server';
import Query from '@/models/Query';
import '@/lib/db';
import jwt from 'jsonwebtoken';

export async function PATCH(request, { params }) {
    try {
        // Handle Next.js 15 params properly
        const resolvedParams = await params;
        const projectId = resolvedParams.projectId;
        
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
        }

        // Verify admin token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        if (decoded.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        // Mark all open queries for this project as viewed (change status from 'open' to 'in-progress')
        const [updatedCount] = await Query.update(
            { status: 'in-progress' },
            {
                where: {
                    projectId: projectId,
                    status: 'open'
                }
            }
        );

        return NextResponse.json({ 
            success: true, 
            message: 'Issues marked as viewed',
            updatedCount: updatedCount
        });

    } catch (error) {
        console.error('Error marking queries as viewed:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
