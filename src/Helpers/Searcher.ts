'use strict';
import Browser from './Browser';
import { config } from '../config';
import { IBestFlight, IResult, ISearch } from '../Interfaces';

export default class Searcher {
  /**
   * Check one test
   *
   * @param search
   * @returns
   */
  async executeSearch(search: ISearch): Promise<IResult> {
    console.log(`Excuting ${search.from} => ${search.to} on ${search.date} [${search.type}]`);
    const resolverFunction = `${search.type.toLowerCase()}StategyResolver`;
    return this[resolverFunction](search);
  }

  /**
   * Resolver business Strategy Resolver
   * @param search
   * @returns
   */
  async businessStategyResolver(search: ISearch)
  {
    const possibleDates = this.getDatesArray(search);

    for (const possibleDate of possibleDates) {
      const result = await this.search(search, possibleDate);

      if (result.businessResults > 0) {
        return result;
      }
    }

    return;
  }

  /**
   * Resolver business Strategy Resolver
   * @param search
   * @returns
   */
  async resumeStategyResolver(search: ISearch)
  {
    let newResult: IResult;
    let result: IResult;
    const possibleDates = this.getDatesArray(search);

    for (const possibleDate of possibleDates) {
      newResult = await this.search(search, possibleDate);      

      if ( ! result){
        result = newResult;
        continue;
      }

      if( newResult.bestBusinessFlight && (! result.bestBusinessFlight || result.bestBusinessFlight.smiles > newResult.bestBusinessFlight.smiles)) {
        result.bestBusinessFlight = newResult.bestBusinessFlight
      }

      if(newResult.bestEconomyFlights && ! result.bestEconomyFlights) {
        result.bestEconomyFlights = newResult.bestEconomyFlights;
      }else{
        if( newResult.bestEconomyFlights ){
          if( newResult.bestEconomyFlights.chepeast.smiles < result.bestEconomyFlights.chepeast.smiles ||
            (newResult.bestEconomyFlights.chepeast.smiles === result.bestEconomyFlights.chepeast.smiles &&
              newResult.bestEconomyFlights.chepeast.durationInMinutes < result.bestEconomyFlights.chepeast.durationInMinutes)){
            result.bestEconomyFlights.chepeast = newResult.bestEconomyFlights.chepeast;
          }

          if( newResult.bestEconomyFlights.faster.durationInMinutes < result.bestEconomyFlights.faster.durationInMinutes ||
            (newResult.bestEconomyFlights.faster.durationInMinutes === result.bestEconomyFlights.faster.durationInMinutes &&
              newResult.bestEconomyFlights.faster.smiles < result.bestEconomyFlights.faster.smiles)){
            result.bestEconomyFlights.faster = newResult.bestEconomyFlights.faster;
          }

          if( newResult.bestEconomyFlights.lessStops.stops < result.bestEconomyFlights.lessStops.stops ||
            ( newResult.bestEconomyFlights.lessStops.stops === result.bestEconomyFlights.lessStops.stops &&
            newResult.bestEconomyFlights.faster.smiles < result.bestEconomyFlights.faster.smiles)){
            result.bestEconomyFlights.lessStops = newResult.bestEconomyFlights.lessStops;
          }
        }
      }
    }

    return result;
  }

  /**
   * Get an array of dates
   *
   * @param search
   * @returns
   */
  private getDatesArray(search: ISearch): number[] {
    const dates = [];
    let daysAdded = 0;
    let daysRemoved = 0;
    let lastAction = 'add';

    const originalDate = Date.parse(`${search.date} 15:00:00 UTC`);
    dates.push(originalDate);

    do {
      if (
        daysRemoved < search.maxBefore &&
        (lastAction === 'add' || daysAdded >= search.maxAfter)
      ) {
        daysRemoved++;
        lastAction = 'remove';
        dates.push(originalDate - 97200000 * daysRemoved);
      }

      if (
        daysAdded < search.maxAfter &&
        (lastAction === 'remove' || daysRemoved >= search.maxBefore)
      ) {
        daysAdded++;
        lastAction = 'add';
        dates.push(originalDate + 97200000 * daysRemoved);
      }
    } while (daysAdded < search.maxAfter || daysRemoved < search.maxBefore);

    return dates;
  }

  /**
   * Entry point to perform the search.
   * @param from origin airport code
   * @param to destination airport code
   * @param date Date in epoch format
   */
  private async search(search: ISearch, forcedDate: number = null): Promise<IResult> {
    const browser = new Browser();
    const webUrl = this.getWebUrl(
      search.from,
      search.to,
      forcedDate ?? Date.parse(search.date)
    );

    const apiData = await browser.getApiData(webUrl);
    browser.close();

    return this.processData(apiData, search);
  }

  /**
   * Process api data and transforms it to a IResult object
   * @param data
   * @returns Promise<IResult>
   */
  private async processData(data: any, search: ISearch): Promise<IResult> {
    const flights = data.requestedFlightSegmentList[0].flightList;

    const businessFlights = await this.getFlightsOfType(flights, 'BUSINESS');
    const economyFlights = await this.getFlightsOfType(flights, 'ECONOMIC');
    const awardFares = flights.filter((flight) => flight.sourceFare === 'AWARD');


    return {
      search,
      awardFares: awardFares.length,
      businessResults: businessFlights.length,
      bestBusinessFlight: businessFlights.length
        ? await this.getChepeastFlight(businessFlights)
        : undefined,
      economyResults: economyFlights.length,
      bestEconomyFlights: economyFlights.length > 0 ? {
        chepeast: await this.getChepeastFlight(economyFlights),
        faster: await this.getFasterFlight(economyFlights),
        lessStops: await this.getLessStopsFlight(economyFlights),
      } : undefined
    };
  }

  /**
   * Filter flights to get only the flights of the type requested.
   * @param flights
   * @param type
   * @returns
   */
  private getFlightsOfType(flights: any, type: string) {
    return flights.filter((flight) => flight.cabin === type);
  }

  /**
   * Apply differnt rules to get the best flight
   *
   * @param flights
   * @returns
   */
  private async getLessStopsFlight(flights: any): Promise<IBestFlight> {
    let flightSelected: IBestFlight;

    for(const flight of flights) {
      const flightResume: IBestFlight = this.parseFlight(flight);

      if (!flightSelected || flightSelected.stops > flightResume.stops) {
        flightSelected = flightResume;
      }
    };

    return flightSelected;
  }

  /**
   * Apply differnt rules to get the best flight
   *
   * @param flights
   * @returns
   */
    private async getFasterFlight(flights: any): Promise<IBestFlight> {
    let flightSelected: IBestFlight;

    for(const flight of flights) {
      const flightResume: IBestFlight = this.parseFlight(flight);

      if (!flightSelected || flightSelected.durationInMinutes > flightResume.durationInMinutes) {
        flightSelected = flightResume;
      }
    };

    return flightSelected;
  }

  /**
   * Apply differnt rules to get the best flight
   *
   * @param flights
   * @returns
   */
  private async getChepeastFlight(flights: any): Promise<IBestFlight> {
    let flightSelected: IBestFlight;

    for(const flight of flights) {
      const flightResume: IBestFlight = this.parseFlight(flight);

      if (!flightSelected || flightSelected.smiles > flightResume.smiles) {
        flightSelected = flightResume;
      }
    };

    return flightSelected;
  }

  /**
   *
   * @param flight
   * @returns
   */
  private parseFlight(flight: any):IBestFlight
  {
    const fullSmiles = flight.fareList.filter((item) => item.type === 'SMILES_CLUB' && item.money === 0)[0].miles;

    return {
      date: new Date(flight.departure.date),
      stops: flight.stops,
      duration: `${flight.duration.hours}:${flight.duration.minutes}`,
      durationInMinutes: flight.duration.minutes + flight.duration.hours * 60,
      smiles: fullSmiles,
      original: flight
    };
  }

  /**
   * Returns the web url to search for the flights.
   *
   * @param string from
   * @param string to
   * @param number date
   * @returns
   */
  private getWebUrl(from, to, date) {
    return `https://www.smiles.com.ar/emission?originAirportCode=${from}&destinationAirportCode=${to}&departureDate=${date}&adults=1&children=0&infants=0&isFlexibleDateChecked=false&tripType=2&cabinType=business&currencyCode=BRL`;
  }
}
