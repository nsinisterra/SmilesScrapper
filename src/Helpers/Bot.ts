import { config } from '../config';
import { Telegraf } from 'telegraf';
import { IResult, ISearch } from '../Interfaces';

export default class Bot {
  private _bot: Telegraf;

  private _commandList: Array<{
    command: string;
    description: string;
   }> = [];

  /**
   * Bot constructor
   */
  constructor() {
    if (config.telegram.key) {
      this._bot = new Telegraf(config.telegram.key);
    }
  }

  /**
   * Start the bot
   *
   * @returns
   */
  async start() {
    if (!this._bot) {
      return;
    }

    this._bot.telegram.setMyCommands(this._commandList);

    this._bot.start((ctx) => {
      ctx.reply(
        'Welcome! This is a private bot. Please, leave me, I want to be alone.'
      );
    });

    this._bot.on('text', (ctx) => {
      /* tslint:disable no-console */
      console.log(
        `Message received from ${ctx.message.from.id} | ${
          ctx.message.from.username
        }: ${JSON.stringify(ctx.message)} `
      );
    });

    /* tslint:disable no-console */
    console.log('Smile Telegram Bot: Running...');
    return this._bot.launch();
  }

  /**
   * Bridge to add new command
   *
   * @param command
   * @param callback
   */
  async addCommand(command, callback, description = undefined) {
    this._bot.command(command, callback);

    if(description){
      this._commandList.push({
        command,
        description
      });
    }
  }

  /**
   * Parse results to human text
   *
   * @param results
   * @returns
   */
  parseResultsToText(results: IResult[]) {
    let text: string = 'Search Results';
    for(const result of results){
      text += this.parseResultToText(result.search, result);
    }
    return text;
  }

  /**
   * Parse result to human text
   * @param result
   * @returns
   */
  parseResultToText(search: ISearch,result: IResult): string {
    let text = '';

    if(! result){
      text += `\r\n ===============================`;
      text += `\r\n No results`;
      text += `\r\n ===============================`;
      return text;
    }

    text += `\r\n ===============================`;
    text += `\r\n Search ${result.search.from} => ${result.search.to} | ${result.search.date} [${search.type.toLowerCase()}]`;
    text += `\r\n ===============================`;

    let functionName = `${search.type.toLowerCase()}SearchParser`;
    text += this[functionName](result);

    return text;
  }

  private businessSearchParser(result:IResult){
    let text = '';    
    text += `\r\n Business Results: ${result.businessResults}`;
    text += `\r\n Economy Results: ${result.economyResults}`;

    if (result.bestBusinessFlight) {
      text += `\r\n\r\n Best Business Flight: (${result.bestBusinessFlight.date.toLocaleString(
        config.locale
      )}) | Smiles: ${result.bestBusinessFlight.smiles.toLocaleString(
        config.locale
      )} | Paradas: ${result.bestBusinessFlight.stops} | Duración: ${
        result.bestBusinessFlight.duration
      }`;
    }

    return text;
  }

  private resumeSearchParser(result:IResult){
    let text = '';
    if( result.bestBusinessFlight ){
      text += `\r\n\r\n Best Business Flight: (${result.bestBusinessFlight.date.toLocaleString(
        config.locale
      )}) | Smiles: ${result.bestBusinessFlight.smiles.toLocaleString(
        config.locale
      )} | Paradas: ${result.bestBusinessFlight.stops} | Duración: ${
        result.bestBusinessFlight.duration
      }`;
    }else{
      text += `\r\n Best Business Flight: No flights.`
    }

    if(result.economyResults > 0){
      text += `\r\n\r\n Chepeast Economy Flight: (${result.bestEconomyFlights.chepeast.date.toLocaleString(
        config.locale
      )}) | Smiles: ${result.bestEconomyFlights.chepeast.smiles.toLocaleString(
        config.locale
      )} | Paradas: ${result.bestEconomyFlights.chepeast.stops} | Duración: ${
        result.bestEconomyFlights.chepeast.duration
      }`;

      text += `\r\n\r\n Faster Economy Flight: (${result.bestEconomyFlights.faster.date.toLocaleString(
        config.locale
      )}) | Smiles: ${result.bestEconomyFlights.faster.smiles.toLocaleString(
        config.locale
      )} | Paradas: ${result.bestEconomyFlights.faster.stops} | Duración: ${
        result.bestEconomyFlights.faster.duration
      }`;

      text += `\r\n\r\n Less Stops Economy Flight: (${result.bestEconomyFlights.lessStops.date.toLocaleString(
        config.locale
      )}) | Smiles: ${result.bestEconomyFlights.lessStops.smiles.toLocaleString(
        config.locale
      )} | Paradas: ${result.bestEconomyFlights.lessStops.stops} | Duración: ${
        result.bestEconomyFlights.lessStops.duration
      }`;
    }else{
      text += `\r\n No good economy flights.`
    }

    return text;
  }

  /**
   * Transform command to object with parameters
   *
   * @param text
   * @returns
   */
  parseCommand(text: string): any {
    const parameters = {};
    const messageParts = text.split(' ');
    messageParts.shift();

    if (messageParts.length < 1) {
      return {};
    }

    messageParts.map((item) => {
      const keyValue = item.split(':');
      parameters[keyValue[0]] = keyValue[1];
    });

    return parameters;
  }

  /**
   * Send a message
   * @param message
   * @returns
   */
  async sendMessage(message: string, chatId: string = null) {
    if(! chatId){
      chatId = config.telegram.chat_id;
    }

    if (!this._bot || !chatId) {
      return;
    }

    await this._bot.telegram.sendMessage(chatId, message);
  }
}
