import { Inngest} from "inngest";

export const inngest = new Inngest({
    id: 'tradepulse',
    ai: { gemini: { apiKey: process.env.GEMINI_API_KEY! }}
})
