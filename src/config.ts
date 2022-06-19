import { IConfig } from './Interfaces';

export const config: IConfig = {
  locale: process.env.LOCALE ?? 'es-AR',
  playwright: {
    headless: ! ((process.env.PLAYWRIGHT_RENDER_BROWSER || 'false') === 'true'),
  },
  telegram: {
    key: process.env.TELEGRAM_KEY ?? null,
    chat_id: process.env.TELEGRAM_CHAT_ID ?? null
  },
  searchs: [
    {
      from: 'BUE',
      to: 'MIA',
      date: '2022-11-22',
      maxBefore: 4,
      maxAfter: 2,
      chatId: process.env.TELEGRAM_CHAT_ID ?? null,
      type: 'business'
    },
    {
      from: 'BUE',
      to: 'NYC',
      date: '2022-11-22',
      maxBefore: 4,
      maxAfter: 0,
      chatId: process.env.TELEGRAM_CHAT_ID ?? null,
      type: 'business'
    },
    {
      from: 'BUE',
      to: 'MCO',
      date: '2022-11-22',
      maxBefore: 4,
      maxAfter: 0,
      chatId: process.env.TELEGRAM_CHAT_ID ?? null,
      type: 'business'
    }
  ]
};
