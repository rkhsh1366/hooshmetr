// فایل api/tools.js
// تابعی برای گرفتن لیست ابزارها از API (فعلاً از دیتا استاتیک استفاده می‌کنیم)
export const getTools = async () => {
    // اینجا می‌تونی در آینده fetch واقعی بزنی
    return [
      {
        id: 1,
        name: "ChatGPT",
        description: "چت‌بات هوشمند از OpenAI",
        category: "متن",
        image: "https://cdn.openai.com/chatgpt/icon.png"
      },
      {
        id: 2,
        name: "Midjourney",
        description: "تولید تصویر با هوش مصنوعی",
        category: "تصویر",
        image: "https://cdn.midjourney.com/icon.png"
      },
      {
        id: 3,
        name: "RunwayML",
        description: "ابزار ویدیو هوشمند",
        category: "ویدیو",
        image: "https://runwayml.com/icon.png"
      }
    ]
  }
  