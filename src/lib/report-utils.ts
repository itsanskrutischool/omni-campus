import { createHmac, createHash } from 'crypto';
import path from 'path';

const REPORT_SECRET = process.env.REPORT_SECRET || 'omni-campus-secret-key-2024';

/**
 * ReportUtils provides core functionality for report security and caching.
 */
export const ReportUtils = {
  /**
   * Generates a secure HMAC for report access verification.
   */
  generateReportHMAC(studentId: string, tenantId: string): string {
    const data = `${studentId}:${tenantId}`;
    return createHmac('sha256', REPORT_SECRET).update(data).digest('hex');
  },

  /**
   * Generates a consistent cache key for a report.
   */
  generateCacheKey(studentId: string, tenantId: string, version: string): string {
    const rawKey = `${tenantId}:${studentId}:${version}`;
    return createHash('md5').update(rawKey).digest('hex');
  },

  /**
   * Returns the absolute path for a cached PDF report.
   * Centralizes the path logic so reader (API) and writer (PDFService) stay in sync.
   */
  getCachePath(cacheKey: string): string {
    return path.join(process.cwd(), "storage", "pdf-cache", "cbse-card", `${cacheKey}.pdf`);
  }
};

/**
 * Generates a consistent hash for a student's report based on their data.
 * Used for cache invalidation when data changes.
 */
export function generateReportHash(studentId: string, examId: string, lastUpdatedAt: Date): string {
  const data = `${studentId}-${examId}-${lastUpdatedAt.getTime()}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Signs a verification URL with HMAC-SHA256 to prevent tampering.
 */
export function signVerificationUrl(url: string): string {
  const hmac = createHmac('sha256', REPORT_SECRET);
  hmac.update(url);
  const signature = hmac.digest('hex');
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}sig=${signature}`;
}

/**
 * Verifies the signature of a URL.
 */
export function verifyReportSignature(urlWithoutSig: string, signature: string): boolean {
  const hmac = createHmac('sha256', REPORT_SECRET);
  hmac.update(urlWithoutSig);
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}
