/**
 * WhatsApp Service for OmniCampus ERP
 * Placeholder for WABA (WhatsApp Business API) or Meta Cloud API.
 */

export interface WhatsAppMessage {
  to: string;
  templateName: string; // WhatsApp Cloud API works with pre-approved templates
  languageCode: string;
  parameters: string[]; // Dynamic fields for templates (e.g., student name, fee amount)
}

export const whatsappService = {
  /**
   * Sends a WhatsApp message using the Meta Cloud API.
   * Handles pre-approved templates and media attachments.
   */
  async sendTemplate(msg: WhatsAppMessage) {
    /**
     * @TODO Implement WhatsApp Cloud API logic
     * endpoint: https://graph.facebook.com/v20.0/.../messages
     */
    
    return { 
      success: true, 
      id: "wamid_" + Math.random().toString(36).substr(2, 9) 
    };
  },

  /**
   * Sending simple text or notification updates (requires opt-in)
   */
  async sendMessage(to: string, text: string) {
    console.log(`[WHATSAPP-SERVICE] Sending Message to ${to}: ${text}`);
    return { success: true };
  }
};
