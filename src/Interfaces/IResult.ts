import { IBestFlight } from "./IBestFlight";
import { ISearch } from "./ISearch";

export interface IResult {
  search?: ISearch;
  businessResults: number,
  bestBusinessFlight?: IBestFlight,
  economyResults: number,
  bestEconomyFlights?: any[]
}