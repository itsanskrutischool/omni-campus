import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * Creates Tally ERP9 XML structure for the fee records
 */
function buildTallyXML(records: any[], companyName: string) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

  for (const record of records) {
    const amount = record.amountPaid;
    const dateFormatted = record.paidDate ? new Date(record.paidDate).toISOString().split('T')[0].replace(/-/g, '') : '';
    const voucherRef = record.receiptNumber || `RCPT-${record.id}`;
    const studentName = record.student?.name || 'Student';

    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Receipt" ACTION="Create">
            <DATE>${dateFormatted}</DATE>
            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucherRef}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${studentName}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${studentName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${amount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Cash/Bank Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${amount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <NARRATION>Fee collection for ${record.feeStructure?.name || 'Fees'}</NARRATION>
          </VOUCHER>
        </TALLYMESSAGE>
`;
  }

  xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return xml;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || '123'; // typically from session or explicit
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Default to last 30 days if not set
    const dateFrom = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = to ? new Date(to) : new Date();

    const records = await prisma.feeRecord.findMany({
      where: {
        student: {
          tenantId
        },
        amountPaid: { gt: 0 },
        paidDate: {
          gte: dateFrom,
          lte: dateTo,
        }
      },
      include: {
        student: true,
        feeStructure: true
      }
    });

    const xmlData = buildTallyXML(records, "Omni Campus Enterprise");

    const response = new NextResponse(xmlData);
    response.headers.set('Content-Type', 'text/xml');
    response.headers.set('Content-Disposition', `attachment; filename=tally_export_${Date.now()}.xml`);

    return response;
  } catch (error) {
    console.error('Tally Export Error', error);
    return NextResponse.json({ error: 'Failed to export Tally XML' }, { status: 500 });
  }
}
