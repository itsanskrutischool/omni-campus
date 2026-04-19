import React from 'react';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';

interface ReceiptProps {
  transaction: {
    receiptNumber: string | null;
    amount: number;
    paymentMethod: string;
    transactionDate: Date | string;
    remarks?: string | null;
  };
  student: {
    name: string;
    rollNumber: string | null;
    class?: string;
    section?: string;
  };
  feeHead: string;
  schoolInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
}

export const ReceiptTemplate: React.FC<ReceiptProps> = ({
  transaction,
  student,
  feeHead,
  schoolInfo,
}) => {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (!printContent) return;
    
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${transaction.receiptNumber}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
              .receipt-container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
              .school-name { font-size: 24px; font-weight: bold; color: #1e3a8a; margin: 0; }
              .school-info { font-size: 14px; color: #666; margin-top: 5px; }
              .receipt-title { font-size: 20px; font-weight: bold; margin: 20px 0; text-transform: uppercase; letter-spacing: 1px; }
              .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .detail-item { font-size: 14px; margin-bottom: 8px; }
              .detail-label { font-weight: 600; color: #666; width: 120px; display: inline-block; }
              .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
              .table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
              .amount-in-words { font-style: italic; font-size: 13px; color: #666; margin-top: 10px; }
              .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
              .signature-box { border-top: 1px solid #333; text-align: center; padding-top: 10px; font-size: 14px; }
              @media print {
                body { padding: 0; }
                .receipt-container { border: none; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div id="receipt-content" className="receipt-container bg-white hidden">
        <div className="header">
          <h1 className="school-name">{schoolInfo.name}</h1>
          <p className="school-info">{schoolInfo.address}</p>
          <p className="school-info">Phone: {schoolInfo.phone} | Email: {schoolInfo.email}</p>
        </div>

        <div className="text-center">
          <h2 className="receipt-title">Payment Receipt</h2>
        </div>

        <div className="details-grid">
          <div>
            <div className="detail-item">
              <span className="detail-label">Receipt No:</span>
              <span>{transaction.receiptNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date:</span>
              <span>{format(new Date(transaction.transactionDate), 'dd MMM yyyy')}</span>
            </div>
          </div>
          <div>
            <div className="detail-item">
              <span className="detail-label">Student Name:</span>
              <span>{student.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Roll No:</span>
              <span>{student.rollNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Payment Method</th>
              <th className="text-right">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{feeHead}</td>
              <td>{transaction.paymentMethod}</td>
              <td className="text-right font-bold">₹{transaction.amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {transaction.remarks && (
          <div className="mt-4 text-sm text-gray-600">
            <strong>Remarks:</strong> {transaction.remarks}
          </div>
        )}

        <div className="footer">
          <div className="signature-box">Student/Guardian Signature</div>
          <div className="signature-box">Authorized Signatory</div>
        </div>
      </div>

      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors no-print"
      >
        <Printer className="w-4 h-4" />
        Print Receipt
      </button>
    </div>
  );
};
