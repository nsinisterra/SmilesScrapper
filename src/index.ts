'use strict';
/* tslint:disable no-var-requires */
require('dotenv').config();

const schedule = require('node-schedule')
import Searcher from './Helpers/Searcher';
import Bot from './Helpers/Bot';
import { config } from './config';
import { IResult, ISearch } from './Interfaces';


const bot = new Bot();

/** Basic Commands */

bot.addCommand('chatid', (ctx) => {
  ctx.reply(`Your chat ID is: ${ctx.chat.id}`);
});

bot.addCommand('ping', (ctx) => {
  ctx.reply(`Pong!`);
});


/** Search commands */
bot.addCommand('check', async (ctx) => {
  ctx.reply("Awesome, I'll run my checks and I'll let you know when I'm done.");
  const searcherObject = new Searcher();  

  config.searchs.filter(item => item.chatId == ctx.chat.id).forEach(async search => {
    const searcherObject = new Searcher();
    const result = await searcherObject.executeSearch(search);

    if(result){
      bot.sendMessage(bot.parseResultToText(search, result), search.chatId);
    }
  });
});

bot.addCommand('search', async (ctx) => {
  const messageParts = bot.parseCommand(ctx.message.text);

  if (Object.keys(messageParts).length < 1) {
    ctx.reply(
      `To use this command, you must to add some parameters, here's the list:
      - <b>from:</b> Airport name (3 letters)
      - <b>to:</b> Airport name (3 letters)
      - <b>date:</b> YYYY-MM-DD
      - <b>type:</b> Search type can be
          - <b>business</b> check if there's any Business flight.
          - <b>resume</b> check if there's AWARD fares (Chepeast fares).

You may send optional parameters also:
      - <b>maxBefore:</b> [Optional] If no flights are found on your date, max number of days before your date to search
      - <b>maxAfter:</b> [Optional] If no flights are found on your date, max number of days after your date to search

For example, to search flights from BUE to MIA on Nov 11 you may send

/search from:BUE to:MIA date:2022-11-11 type:business`
    , { parse_mode: "HTML" });
    return;
  }

  if (!messageParts.from || !messageParts.to || !messageParts.date || !messageParts.type) {
    ctx.reply('You must to add at least from:, to:, date: and type: parameters');
    return;
  }

  const date = Date.parse(messageParts.date);
  if (!date) {
    ctx.reply(
      'Date format is invalid. Please, send the following format YEAR-MONTH-DAY'
    );
    return;
  }

  ctx.reply(
    `Searching flight from ${messageParts.from} to ${messageParts.to} on ${messageParts.date.toLocaleString(config.locale)}...`
  );
  const searchObject: ISearch = {
    from: messageParts.from,
    to: messageParts.to,
    date: messageParts.date,
    maxAfter: messageParts.maxAfter ?? 0,
    maxBefore: messageParts.maxBefore ?? 0,
    chatId: ctx.chat.id,
    type: messageParts.type
  };
  const searcherObject = new Searcher();
  searcherObject
    .executeSearch(searchObject)
    .then((result: IResult) => {      
      bot.sendMessage(bot.parseResultToText(searchObject, result), searchObject.chatId);
    });
});

bot.start();
bot.sendMessage(`Hi pappa! I was died, but I'm alive again!`)

schedule.scheduleJob('05 * * * *', async () => {
  console.log("Running scheduled jobs");

  config.searchs.forEach(async search => {
    const searcherObject = new Searcher();
    const result = await searcherObject.executeSearch(search);

    if(result){
      bot.sendMessage(bot.parseResultToText(search, result), search.chatId);
    }
  });
});

/* tslint:disable no-console */
console.log('Smiles Scrapper running...');
