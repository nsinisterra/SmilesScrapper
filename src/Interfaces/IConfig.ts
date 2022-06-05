import { ISearch } from "./ISearch"

export interface IConfig {
  locale: string,
  telegram: {
    key?: string,
    chat_id?: string,
  },
  searchs?: ISearch[]
}
