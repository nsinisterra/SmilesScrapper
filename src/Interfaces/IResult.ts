import { IBestFlight } from './IBestFlight';
import { ISearch } from './ISearch';

export interface IResult {
  search?: ISearch;
  awardFares: number;
  businessResults: number;
  bestBusinessFlight?: IBestFlight;
  economyResults: number;
  bestEconomyFlights?: {
    faster: IBestFlight;
    chepeast: IBestFlight;
    lessStops: IBestFlight;
  };
}
