'use strict'
import Browser from "./Browser";
import { config } from "../config"
import { IBestFlight, IResult, ISearch } from "../Interfaces";

export default class Searcher {

  async executeSearches(searches): Promise<IResult[]> {
    const results:IResult[] = [];

    for (let index = 0; index < searches.length; index++) {  
      let result = await this.executeSeach(searches[index]);
      if(result){
        results.push(result);
      }      
    }

    return results;
  }

  async executeSeach(search:ISearch):Promise<IResult> {
    const possibleDates = this.getDatesArray(search);  

    for (let index = 0; index < possibleDates.length; index++) {        
      const result = await this.search(search, possibleDates[index]);        

      if(result.businessResults > 0){
        return result;        
      }
    }

    return;
  }


  private getDatesArray(search: ISearch): number[] {
    const dates = [];
    let daysAdded = 0;
    let daysRemoved = 0;
    let lastAction = 'add';

    const originalDate = Date.parse(`${search.date} 15:00:00 UTC`);
    dates.push(originalDate);

    do{
      if(daysRemoved < search.maxBefore && (lastAction === 'add' || daysAdded >= search.maxAfter)){
        daysRemoved++;
        lastAction = 'remove';        
        dates.push(originalDate - (97200000 * daysRemoved));        
      }

      if(daysAdded < search.maxAfter && (lastAction === 'remove' || daysRemoved >= search.maxBefore)){
        daysAdded++;
        lastAction = 'add';        
        dates.push(originalDate + (97200000 * daysRemoved));        
      }
    }while(daysAdded < search.maxAfter || daysRemoved < search.maxBefore);

    return dates;
  }

  /**
   * Entry point to perform the search.
   * @param from origin airport code
   * @param to destination airport code
   * @param date Date in epoch format
   */
  private  async search(search: ISearch, forcedDate:number = null): Promise<IResult> {    
    const browser = new Browser();
    const webUrl = this.getWebUrl(search.from, search.to, forcedDate ?? Date.parse(search.date));

    const apiData = await browser.getApiData(webUrl);    
    browser.close();

    return this.processData(apiData, search);
  }


  /**
   * Process api data and transforms it to a IResult object
   * @param data 
   * @returns Promise<IResult>
   */
  private async processData(data: any, search: ISearch): Promise<IResult>
  {       
    const flights = data.requestedFlightSegmentList[0].flightList

    const businessFlights = await this.getFlightsOfType(flights, 'BUSINESS');
    const economyFlights = await this.getFlightsOfType(flights, 'ECONOMIC');

    return {
      search: search,
      businessResults: businessFlights.length,
      bestBusinessFlight: businessFlights.length ? await this.getBestFlight(businessFlights) : undefined,
      economyResults: economyFlights.length,
      bestEconomyFlights: economyFlights.length ? [{}] : null     
    };
  }

  /**
   * Filter flights to get only the flights of the type requested.
   * @param flights 
   * @param type 
   * @returns 
   */
  private getFlightsOfType(flights:any, type:string)
  {
    return flights.filter(flight => flight.cabin === type);
  }

  /**
   * Apply differnt rules to get the best flight
   * 
   * @param flights 
   * @returns 
   */
   private async getBestFlight(flights:any): Promise<IBestFlight>
  {
    let flightSelected:IBestFlight; 
    flights.forEach(flight => {
      let flightResume:IBestFlight = {
        date: new Date(flight.departure.date),
        stops: flight.stops,        
        duration: `${flight.duration.hours}:${flight.duration.minutes}`,
        smiles: flight.fareList.filter(item => item.type === 'SMILES_CLUB' && item.money == 0)[0].miles,
        original: flight,        
      }
      
      if(!flightSelected || flightSelected.smiles > flightResume.smiles){
        flightSelected = flightResume;
      }
    })

    return flightSelected;
  }

  /**
   * Returns the web url to search for the flights.
   * 
   * @param string from 
   * @param string to 
   * @param number date 
   * @returns 
   */
  private getWebUrl(from, to, date){
    return `https://www.smiles.com.ar/emission?originAirportCode=${from}&destinationAirportCode=${to}&departureDate=${date}&adults=1&children=0&infants=0&isFlexibleDateChecked=false&tripType=2&cabinType=business&currencyCode=BRL`;
  }
}