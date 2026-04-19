import { NextResponse } from 'next/server';
import { GatePassService } from '@/services/gatepass.service';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const tenantId = body.tenantId || session.user.tenantId;
    const { otp } = body;

    if (!tenantId || !otp) {
      return NextResponse.json({ error: 'Tenant ID and OTP are required' }, { status: 400 });
    }

    const verification = await GatePassService.verifyOTP(tenantId, otp, session.user.id);

    return NextResponse.json({ data: verification, message: 'OTP Verified Successfully. Gates Opened.' });
  } catch (error: any) {
    console.error('GatePass Verify Error', error);
    return NextResponse.json({ error: error.message || 'Verification Failed' }, { status: 400 });
  }
}
