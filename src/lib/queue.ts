import { Queue, Worker, Job } from "bullmq"
import IORedis from "ioredis"

// Redis connection configuration
const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
})

// Queue definitions
export const emailQueue = new Queue("emails", { connection })
export const pdfQueue = new Queue("pdf-generation", { connection })
export const reportQueue = new Queue("reports", { connection })
export const notificationQueue = new Queue("notifications", { connection })
export const feeQueue = new Queue("fees", { connection })

// Job types
export enum JobType {
  SEND_EMAIL = "SEND_EMAIL",
  GENERATE_PDF = "GENERATE_PDF",
  GENERATE_REPORT = "GENERATE_REPORT",
  SEND_NOTIFICATION = "SEND_NOTIFICATION",
  PROCESS_FEE = "PROCESS_FEE",
  SEND_SMS = "SEND_SMS",
  SEND_WHATSAPP = "SEND_WHATSAPP",
}

// Job data interfaces
export interface EmailJobData {
  to: string
  subject: string
  html: string
  tenantId: string
}

export interface PdfJobData {
  html: string
  filename: string
  tenantId: string
}

export interface ReportJobData {
  type: string
  filters: any
  tenantId: string
  userId?: string
}

export interface NotificationJobData {
  userId: string
  title: string
  message: string
  type: string
  tenantId: string
}

export interface FeeJobData {
  feeRecordId: string
  tenantId: string
}

export interface SmsJobData {
  phone: string
  message: string
  tenantId: string
}

export interface WhatsAppJobData {
  phone: string
  message: string
  tenantId: string
}

// Queue helper functions
export async function addEmailJob(data: EmailJobData) {
  return await emailQueue.add(JobType.SEND_EMAIL, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  })
}

export async function addPdfJob(data: PdfJobData) {
  return await pdfQueue.add(JobType.GENERATE_PDF, data, {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
  })
}

export async function addReportJob(data: ReportJobData) {
  return await reportQueue.add(JobType.GENERATE_REPORT, data, {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
  })
}

export async function addNotificationJob(data: NotificationJobData) {
  return await notificationQueue.add(JobType.SEND_NOTIFICATION, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  })
}

export async function addFeeJob(data: FeeJobData) {
  return await feeQueue.add(JobType.PROCESS_FEE, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  })
}

export async function addSmsJob(data: SmsJobData) {
  return await notificationQueue.add(JobType.SEND_SMS, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  })
}

export async function addWhatsAppJob(data: WhatsAppJobData) {
  return await notificationQueue.add(JobType.SEND_WHATSAPP, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  })
}

// Job processor (to be run in a separate worker process)
export async function processJob(job: Job, token?: string) {
  switch (job.name) {
    case JobType.SEND_EMAIL:
      return processEmailJob(job.data as EmailJobData)
    case JobType.GENERATE_PDF:
      return processPdfJob(job.data as PdfJobData)
    case JobType.GENERATE_REPORT:
      return processReportJob(job.data as ReportJobData)
    case JobType.SEND_NOTIFICATION:
      return processNotificationJob(job.data as NotificationJobData)
    case JobType.PROCESS_FEE:
      return processFeeJob(job.data as FeeJobData)
    case JobType.SEND_SMS:
      return processSmsJob(job.data as SmsJobData)
    case JobType.SEND_WHATSAPP:
      return processWhatsAppJob(job.data as WhatsAppJobData)
    default:
      throw new Error(`Unknown job type: ${job.name}`)
  }
}

// Job processors (placeholder implementations)
async function processEmailJob(data: EmailJobData) {
  // TODO: Implement email sending logic
  console.log(`Sending email to ${data.to}: ${data.subject}`)
  return { success: true }
}

async function processPdfJob(data: PdfJobData) {
  // TODO: Implement PDF generation logic
  console.log(`Generating PDF: ${data.filename}`)
  return { success: true }
}

async function processReportJob(data: ReportJobData) {
  // TODO: Implement report generation logic
  console.log(`Generating report: ${data.type}`)
  return { success: true }
}

async function processNotificationJob(data: NotificationJobData) {
  // TODO: Implement notification sending logic
  console.log(`Sending notification to user ${data.userId}: ${data.title}`)
  return { success: true }
}

async function processFeeJob(data: FeeJobData) {
  // TODO: Implement fee processing logic
  console.log(`Processing fee record ${data.feeRecordId}`)
  return { success: true }
}

async function processSmsJob(data: SmsJobData) {
  // TODO: Implement SMS sending logic
  console.log(`Sending SMS to ${data.phone}`)
  return { success: true }
}

async function processWhatsAppJob(data: WhatsAppJobData) {
  // TODO: Implement WhatsApp sending logic
  console.log(`Sending WhatsApp to ${data.phone}`)
  return { success: true }
}

// Close all queues
export async function closeQueues() {
  await Promise.all([
    emailQueue.close(),
    pdfQueue.close(),
    reportQueue.close(),
    notificationQueue.close(),
    feeQueue.close(),
  ])
  await connection.quit()
}
