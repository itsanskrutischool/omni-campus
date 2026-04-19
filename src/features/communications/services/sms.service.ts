/**
 * SMS Service for OmniCampus ERP
 * Placeholder for specialized Indian gateways like Msg91, Exotel, or Twilio.
 */

export interface SMSMessage {
  to: string;
  body: string;
  templateId?: string; // Critical for DLT compliance in India
}

export const smsService = {
  /**
   * Sends an SMS message using the configured Indian gateway.
   * Handles DLT (Distributed Ledger Technology) requirements for India.
   */
  async send(msg: SMSMessage) {
    // TODO: Implement Msg91/Twilio integration
    // Example: const res = await fetch('https://api.msg91.com/...', { ... })
    
    return { success: true, messageId: "msg_" + Math.random().toString(36).substr(2, 9) };
  },

  /**
   * Bulk SMS for broadcasts (e.g., Parent-Teacher Meeting alerts)
   */
  async sendBulk(messages: SMSMessage[]) {
    return { count: messages.length, status: "pending" };
  }
};
