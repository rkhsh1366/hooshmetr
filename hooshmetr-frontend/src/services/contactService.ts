import api from "./api";

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const contactService = {
  /**
   * Send contact form
   * @param data Contact form data
   * @returns Promise with response
   */
  sendContactForm: async (
    data: ContactFormData
  ): Promise<{ message: string }> => {
    const response = await api.post("/contact", data);
    return response.data;
  },
};
