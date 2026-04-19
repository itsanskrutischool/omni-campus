import puppeteer, { Browser, Page } from "puppeteer-core"
import QRCode from "qrcode"
import { existsSync, mkdirSync, writeFileSync, renameSync, unlinkSync } from "fs"
import { join, dirname } from "path"
import { ReportUtils } from "@/lib/report-utils"

/**
 * Hardened PDF Service
 * ────────────────────
 * Features:
 * 1. Singleton Browser: Keeps one instance alive to save RAM.
 * 2. Semaphore: Limits concurrent PDF renders to prevent CPU spikes.
 * 3. Atomic Cache: Writes to .tmp then renames to .pdf.
 * 4. Path Discovery: Auto-finds Chrome on Windows/Linux.
 */

export class PDFService {
  private static browser: Browser | null = null;
  private static activeJobs: number = 0;
  private static MAX_CONCURRENT = 5;

  /**
   * Initializes the browser if not already running.
   */
  private static async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    const executablePath = 
      process.env.CHROME_PATH || 
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" ||
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

    this.browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      executablePath,
      headless: true,
    });

    return this.browser;
  }

  /**
   * Generates a QR Code as a Data URL
   */
  static async generateQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        margin: 1,
        width: 128,
        color: { dark: "#1e293b", light: "#ffffff" },
      });
    } catch (err) {
      console.error("QR Generation Error:", err);
      return "";
    }
  }

  /**
   * Generates an A4 PDF from HTML content with concurrency control.
   */
  static async generateA4PDF(html: string): Promise<Buffer> {
    // Basic Semaphore Implementation
    while (this.activeJobs >= this.MAX_CONCURRENT) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.activeJobs++;
    let page: Page | null = null;

    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();
      
      await page.setContent(html, { 
        waitUntil: "networkidle0",
        timeout: 30000 
      });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error("PDF Generation Failed:", error);
      throw error;
    } finally {
      this.activeJobs--;
      if (page) await page.close();
    }
  }

  /**
   * Atomic Cache Write Utility
   */
  static async writeToCache(cacheKey: string, buffer: Buffer): Promise<string> {
    const finalPath = ReportUtils.getCachePath(cacheKey);
    const dir = dirname(finalPath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const tempPath = `${finalPath}.tmp`;

    // Atomic operation: write to temp, then rename
    writeFileSync(tempPath, buffer);
    renameSync(tempPath, finalPath);

    return finalPath;
  }

  /**
   * Invalidates the cache for a specific report.
   */
  static invalidateCache(cacheKey: string): void {
    const path = ReportUtils.getCachePath(cacheKey);
    try {
      if (existsSync(path)) {
        unlinkSync(path);
      }
    } catch (error) {
      console.error(`[PDFService] Cache invalidation failed for ${cacheKey}:`, error);
    }
  }

  /**
   * Standard Wrap Template
   */
  static wrapInTemplate(content: string, schoolName: string = "OMNI CAMPUS"): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
          @page { size: A4; margin: 0; }
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #1e293b; background: white; }
          .page { position: relative; width: 210mm; height: 297mm; padding: 15mm; margin: auto; box-sizing: border-box; }
          .watermark {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80pt; font-weight: bold; color: rgba(0,0,0,0.02); white-space: nowrap; z-index: -1;
            pointer-events: none;
          }
          .header { text-align: center; border-bottom: 3px double #334155; margin-bottom: 20px; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 26pt; color: #0f172a; letter-spacing: -0.5px; }
          .header p { margin: 5px 0 0; color: #64748b; font-size: 10pt; text-transform: uppercase; }
          .footer { position: absolute; bottom: 10mm; left: 15mm; right: 15mm; border-top: 1px solid #e2e8f0; padding-top: 5px; font-size: 8pt; color: #94a3b8; display: flex; justify-content: space-between; }
          .qr-box { position: absolute; bottom: 15mm; right: 15mm; width: 30mm; height: 30mm; text-align: center; }
          .qr-box img { width: 100%; height: auto; }
          .qr-box small { font-size: 6pt; color: #cbd5e1; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="watermark">${schoolName}</div>
          <div class="header">
            <h1>${schoolName}</h1>
            <p>Academic Assessment & Performance Report</p>
          </div>
          ${content}
          <div class="footer">
            <span>Verified Digital Document: ${new Date().toLocaleString()}</span>
            <span>Omni Campus Secure Engine v2.0</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
