import { config } from '../config';
import { Telegraf } from 'telegraf';
import { IResult } from '../Interfaces';

export default class Bot {
  private _bot: Telegraf;

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

    this._bot.command('chatid', (ctx) => {
      ctx.reply(`Your chat ID is: ${ctx.chat.id}`);
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
  async addCommand(command, callback) {
    this._bot.command(command, callback);
  }

  /**
   * Parse results to human text
   *
   * @param results
   * @returns
   */
  parseResultsToText(results: IResult[]) {
    let text: string = 'Search Results';

    if (results.length === 0) {
      text += `\r\n ===============================`;
      text += `\r\n No results`;
      text += `\r\n ===============================`;
      return text;
    }

    results.forEach((result: IResult) => {
      text += this.parseResultToText(result);
    });

    return text;
  }

  /**
   * Parse result to human text
   * @param result
   * @returns
   */
  parseResultToText(result: IResult): string {
    let text = '';
    text += `\r\n ===============================`;
    text += `\r\n Search ${result.search.from} => ${result.search.to} | ${result.search.date}`;
    text += `\r\n ===============================`;
    text += `\r\n Business Results: ${result.businessResults}`;
    text += `\r\n Economy Results: ${result.economyResults}`;

    if (result.businessResults > 0) {
      text += `\r\n Best Business Flight: (${result.bestBusinessFlight.date.toLocaleString(
        config.locale
      )}) | Smiles: ${result.bestBusinessFlight.smiles.toLocaleString(
        config.locale
      )} | Paradas: ${result.bestBusinessFlight.stops} | Duración: ${
        result.bestBusinessFlight.duration
      }`;
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
      return;
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
  async sendMessage(message: string) {
    if (!this._bot) {
      return;
    }

    await this._bot.telegram.sendMessage(config.telegram.chat_id, message);
  }
}
