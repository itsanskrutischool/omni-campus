import { NextResponse } from 'next/server';
import { AuditService } from '@/services/audit.service';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const moduleName = searchParams.get('module') || undefined;
    const action = searchParams.get('action') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    // Role check: Only ADMIN or SUPER_ADMIN should be able to view audit logs usually
    // Assuming role check would happen in middleware or here for the specific tenant
    // For MVP phase 1, we let the service return the logs scoped by tenant.

    const result = await AuditService.getLogs(tenantId, {
      module: moduleName,
      action,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Audit GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
