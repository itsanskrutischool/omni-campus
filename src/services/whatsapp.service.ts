import { AuditService } from "./audit.service"

// ─── WhatsApp Business API Service ──────────────────────────────────────

interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  businessAccountId: string
  webhookVerifyToken?: string
}

interface WhatsAppMessage {
  to: string
  templateName?: string
  templateLanguage?: string
  templateComponents?: any[]
  text?: string
  mediaUrl?: string
  documentUrl?: string
  documentFilename?: string
}

interface WhatsAppTemplate {
  name: string
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION"
  language: string
  components: any[]
}

export class WhatsAppService {
  private static config: WhatsAppConfig | null = null

  /**
   * Initialize WhatsApp Business API configuration
   */
  static initialize(config?: WhatsAppConfig) {
    if (config) {
      this.config = config
      return
    }

    // Auto-initialize from environment variables
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

    if (phoneNumberId && accessToken && businessAccountId) {
      this.config = {
        phoneNumberId,
        accessToken,
        businessAccountId,
        webhookVerifyToken,
      }
    }
  }

  /**
   * Get current configuration
   */
  static getConfig() {
    if (!this.config) {
      this.initialize()
    }
    return this.config
  }

  /**
   * Send text message
   */
  static async sendTextMessage(tenantId: string, userId: string | undefined, message: WhatsAppMessage) {
    if (!this.config) {
      console.log(`[WhatsApp - LOG ONLY] To: ${message.to}, Text: ${message.text}`)
      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "whatsapp",
        entityType: "Message",
        entityId: message.to,
        summary: `WhatsApp message sent to ${message.to} (log mode - no config)`,
      })
      return { success: true, mode: "log" }
    }

    const payload = {
      messaging_product: "whatsapp",
      to: message.to,
      type: "text",
      text: {
        body: message.text || "",
      },
    }

    const response = await this.sendAPIRequest(payload)

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "whatsapp",
      entityType: "Message",
      entityId: response?.messages?.[0]?.id,
      summary: `Sent WhatsApp text message to ${message.to}`,
    })

    return response
  }

  /**
   * Send template message
   */
  static async sendTemplateMessage(tenantId: string, userId: string | undefined, message: WhatsAppMessage) {
    if (!this.config) {
      console.log(`[WhatsApp - LOG ONLY] Template: ${message.templateName}, To: ${message.to}`)
      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "whatsapp",
        entityType: "Message",
        entityId: message.to,
        summary: `WhatsApp template sent to ${message.to} (log mode - no config)`,
      })
      return { success: true, mode: "log" }
    }

    if (!message.templateName) {
      throw new Error("Template name is required for template messages")
    }

    const payload = {
      messaging_product: "whatsapp",
      to: message.to,
      type: "template",
      template: {
        name: message.templateName,
        language: {
          code: message.templateLanguage || "en",
        },
        components: message.templateComponents || [],
      },
    }

    const response = await this.sendAPIRequest(payload)

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "whatsapp",
      entityType: "Message",
      entityId: response?.messages?.[0]?.id,
      summary: `Sent WhatsApp template message (${message.templateName}) to ${message.to}`,
    })

    return response
  }

  /**
   * Send media message (image, video, document)
   */
  static async sendMediaMessage(tenantId: string, userId: string | undefined, message: WhatsAppMessage & { mediaType: "image" | "video" | "document" }) {
    if (!this.config) {
      console.log(`[WhatsApp - LOG ONLY] Media: ${message.mediaType}, To: ${message.to}`)
      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "whatsapp",
        entityType: "Message",
        entityId: message.to,
        summary: `WhatsApp media sent to ${message.to} (log mode - no config)`,
      })
      return { success: true, mode: "log" }
    }

    const payload: any = {
      messaging_product: "whatsapp",
      to: message.to,
      type: message.mediaType,
    }

    if (message.mediaType === "image" && message.mediaUrl) {
      payload.image = { link: message.mediaUrl }
    } else if (message.mediaType === "video" && message.mediaUrl) {
      payload.video = { link: message.mediaUrl }
    } else if (message.mediaType === "document" && message.documentUrl) {
      payload.document = {
        link: message.documentUrl,
        filename: message.documentFilename || "document.pdf",
      }
    }

    const response = await this.sendAPIRequest(payload)

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "whatsapp",
      entityType: "Message",
      entityId: response?.messages?.[0]?.id,
      summary: `Sent WhatsApp ${message.mediaType} message to ${message.to}`,
    })

    return response
  }

  /**
   * Send bulk messages
   */
  static async sendBulkMessages(tenantId: string, userId: string | undefined, recipients: string[], message: WhatsAppMessage) {
    const results = []
    const errors: { recipient: string; error: string }[] = []

    for (const recipient of recipients) {
      try {
        const response = await this.sendTextMessage(tenantId, userId, {
          ...message,
          to: recipient,
        })
        results.push({ recipient, success: true, messageId: response?.messages?.[0]?.id })
      } catch (error: any) {
        errors.push({ recipient, error: error.message })
        results.push({ recipient, success: false, error: error.message })
      }
    }

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "whatsapp",
      entityType: "BulkMessage",
      summary: `Sent bulk WhatsApp messages to ${recipients.length} recipients. Success: ${results.filter(r => r.success).length}`,
    })

    return {
      total: recipients.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
      errors,
    }
  }

  /**
   * Send fee reminder
   */
  static async sendFeeReminder(tenantId: string, userId: string | undefined, phoneNumber: string, studentName: string, amount: number, dueDate: string) {
    const message = `Dear Parent, This is a reminder that the fee payment of ₹${amount.toLocaleString()} for ${studentName} is due on ${dueDate}. Please pay at your earliest convenience. - Omni Campus`

    try {
      return await this.sendTextMessage(tenantId, userId, {
        to: phoneNumber,
        text: message,
      })
    } catch (error) {
      console.log(`[WhatsApp - LOG ONLY] Fee reminder to ${phoneNumber}: ${message}`)
      return { success: true, mode: "log" }
    }
  }

  /**
   * Send attendance alert
   */
  static async sendAttendanceAlert(tenantId: string, userId: string | undefined, phoneNumber: string, studentName: string, date: string, status: string) {
    const message = `Dear Parent, ${studentName} was marked ${status} on ${date}. Please contact the school for more details. - Omni Campus`

    try {
      return await this.sendTextMessage(tenantId, userId, {
        to: phoneNumber,
        text: message,
      })
    } catch (error) {
      console.log(`[WhatsApp - LOG ONLY] Attendance alert to ${phoneNumber}: ${message}`)
      return { success: true, mode: "log" }
    }
  }

  /**
   * Send exam result notification
   */
  static async sendExamResult(tenantId: string, userId: string | undefined, phoneNumber: string, studentName: string, examName: string, marks: number, total: number) {
    const percentage = ((marks / total) * 100).toFixed(1)
    const message = `Dear Parent, ${studentName} scored ${marks}/${total} (${percentage}%) in ${examName}. Please check the portal for detailed results. - Omni Campus`

    try {
      return await this.sendTextMessage(tenantId, userId, {
        to: phoneNumber,
        text: message,
      })
    } catch (error) {
      console.log(`[WhatsApp - LOG ONLY] Exam result to ${phoneNumber}: ${message}`)
      return { success: true, mode: "log" }
    }
  }

  /**
   * Verify webhook
   */
  static verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === "subscribe" && token === (this.config?.webhookVerifyToken || "")) {
      return challenge
    }
    return null
  }

  /**
   * Process incoming webhook
   */
  static async processWebhook(payload: any, tenantId: string) {
    // Handle incoming messages, status updates, etc.
    const entry = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (value?.messages) {
      // Handle incoming messages
      for (const message of value.messages) {
        await this.handleIncomingMessage(message, tenantId)
      }
    }

    if (value?.statuses) {
      // Handle message status updates (sent, delivered, read)
      for (const status of value.statuses) {
        await this.handleMessageStatus(status, tenantId)
      }
    }

    return { received: true }
  }

  /**
   * Handle incoming message
   */
  private static async handleIncomingMessage(message: any, tenantId: string) {
    // Extract message details
    const from = message.from
    const messageBody = message?.text?.body
    const messageId = message.id

    // In a real system, you would:
    // 1. Save the message to database
    // 2. Trigger appropriate actions based on content
    // 3. Send auto-reply if configured

    console.log(`Received WhatsApp message from ${from}: ${messageBody}`)
  }

  /**
   * Handle message status update
   */
  private static async handleMessageStatus(status: any, tenantId: string) {
    // Update message status in database
    const messageId = status.id
    const statusValue = status.status // sent, delivered, read
    const timestamp = status.timestamp

    console.log(`Message ${messageId} status: ${statusValue}`)
  }

  /**
   * Create message template
   */
  static async createTemplate(tenantId: string, userId: string | undefined, template: WhatsAppTemplate) {
    if (!this.config) {
      throw new Error("WhatsApp service not initialized. Call initialize() first.")
    }

    const payload = {
      name: template.name,
      category: template.category,
      language: template.language,
      components: template.components,
    }

    const response = await this.sendAPIRequest(payload, "message_templates", "POST")

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "whatsapp",
      entityType: "Template",
      summary: `Created WhatsApp template: ${template.name}`,
    })

    return response
  }

  /**
   * List message templates
   */
  static async listTemplates() {
    if (!this.config) {
      throw new Error("WhatsApp service not initialized. Call initialize() first.")
    }

    const response = await this.sendAPIRequest(null, "message_templates", "GET")
    return response
  }

  /**
   * Delete message template
   */
  static async deleteTemplate(tenantId: string, userId: string | undefined, templateName: string) {
    if (!this.config) {
      throw new Error("WhatsApp service not initialized. Call initialize() first.")
    }

    const response = await this.sendAPIRequest(null, `message_templates/${templateName}`, "DELETE")

    await AuditService.log({
      tenantId,
      userId,
      action: "DELETE",
      module: "whatsapp",
      entityType: "Template",
      summary: `Deleted WhatsApp template: ${templateName}`,
    })

    return response
  }

  /**
   * Get phone number info
   */
  static async getPhoneNumberInfo() {
    if (!this.config) {
      throw new Error("WhatsApp service not initialized. Call initialize() first.")
    }

    const response = await this.sendAPIRequest(null, `/${this.config.phoneNumberId}`, "GET")
    return response
  }

  /**
   * Send API request to WhatsApp
   */
  private static async sendAPIRequest(payload: any, endpoint?: string, method: "POST" | "GET" | "DELETE" = "POST") {
    if (!this.config) {
      throw new Error("WhatsApp service not initialized.")
    }

    const url = endpoint
      ? `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/${endpoint}`
      : `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`

    const headers = {
      "Authorization": `Bearer ${this.config.accessToken}`,
      "Content-Type": "application/json",
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (method !== "GET" && payload) {
      options.body = JSON.stringify(payload)
    }

    try {
      const response = await fetch(url, options)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${data.error?.message || response.statusText}`)
      }

      return data
    } catch (error: any) {
      console.error("WhatsApp API request failed:", error)
      throw error
    }
  }

  /**
   * Get message analytics
   */
  static async getAnalytics(tenantId: string, startDate?: Date, endDate?: Date) {
    // In a real implementation, this would query the database for WhatsApp message statistics
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      failed: 0,
      byType: {
        text: 0,
        template: 0,
        media: 0,
      },
      byPurpose: {
        feeReminder: 0,
        attendanceAlert: 0,
        examResult: 0,
        other: 0,
      },
    }
  }
}
