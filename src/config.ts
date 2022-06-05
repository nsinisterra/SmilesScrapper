require('dotenv').config();
import { IConfig } from "./Interfaces";

export const config:IConfig = {
  locale: process.env.LOCALE ?? 'es-AR',
  telegram: {
    key: process.env.TELEGRAM_KEY ?? null,
    chat_id:  process.env.TELEGRAM_CHAT_ID ?? null,
  },
  searchs: [
    {
      from: 'BUE',
      to: 'MIA',
      date: '2022-11-22',
      maxBefore: 1,
      maxAfter: 3      
    }
  ]
};