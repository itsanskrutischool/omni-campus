import { NextResponse } from 'next/server';
import { GatePassService } from '@/services/gatepass.service';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || session.user.tenantId;
    if (!tenantId) return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });

    const passes = await GatePassService.getGatePassesForToday(tenantId);
    return NextResponse.json({ data: passes });
  } catch (error) {
    console.error('GatePass GET Error', error);
    return NextResponse.json({ error: 'Failed to fetch gate passes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const tenantId = body.tenantId || session.user.tenantId;
    const { studentId, parentName, parentPhone, reason } = body;

    if (!tenantId || !studentId || !parentName || !parentPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gatePass = await GatePassService.requestGatePass({
      tenantId,
      studentId,
      parentName,
      parentPhone,
      reason,
      userId: session.user.id
    });

    return NextResponse.json({ data: gatePass });
  } catch (error: any) {
    console.error('GatePass POST Error', error);
    return NextResponse.json({ error: error.message || 'Failed to request gate pass' }, { status: 500 });
  }
}
