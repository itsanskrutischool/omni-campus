import { Worker } from "bullmq"
import IORedis from "ioredis"
import { processJob } from "@/lib/queue"

// Redis connection configuration
const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
})

// Create worker for all queues
const worker = new Worker(
  "all-queues",
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`)
    return await processJob(job)
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs concurrently
  }
)

// Worker event handlers
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`)
})

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

worker.on("error", (err) => {
  console.error("Worker error:", err)
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker...")
  await worker.close()
  await connection.quit()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing worker...")
  await worker.close()
  await connection.quit()
  process.exit(0)
})

console.log("BullMQ worker started")
