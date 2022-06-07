import { ISearch } from './ISearch';

export interface IConfig {
  playwright: {
    headless: boolean;
  };
  locale: string;
  telegram: {
    key?: string;
    chat_id?: string;
  };
  searchs?: ISearch[];
}
