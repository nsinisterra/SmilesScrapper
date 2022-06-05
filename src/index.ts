'use strict'

import Searcher from './Helpers/Searcher';
import Bot from './Helpers/Bot';
import { config } from './config';
import { IResult, ISearch } from './Interfaces';

const bot = new Bot();

bot.addCommand('check', async function(ctx){
  ctx.reply("Awesome, I'll run my checks and I'll let you know when I'm done.");
  const searcherObject = new Searcher();
  searcherObject.executeSearches(config.searchs).then((result:IResult[]) => bot.sendMessage(bot.parseResultsToText(result)));    
});

bot.addCommand('search', async function(ctx){
  const messageParts = bot.parseCommand(ctx.message.text);  

  if(Object.keys(messageParts).length < 1){
    ctx.reply("To use this command, you must to add some parameters. Here's the list: /r/n from: Airport name (3 letters) \r\n to: Airport name (3 letters) \r\n date: YYYY-MM-DD \r\n maxBefore: Number of days before the date \r\n maxAfter: Number of days after the date");
    return;
  }

  if(messageParts.from === undefined || messageParts.to === undefined || messageParts.date === undefined){
    ctx.reply('You must to add at least from, to and date parameters');
    return;
  }
  
  const date = Date.parse(messageParts.date);
  if(! date){
    ctx.reply("Date format is invalid. Please, send the following format YEAR-MONTH-DAY");
    return;
  }

  ctx.reply(`Searching fly from ${messageParts[1]} to ${messageParts[2]} on ${messageParts[3]}...`);  
  const searchObject:ISearch = {
    from: messageParts.from,
    to: messageParts.to,
    date: messageParts.date,
    maxAfter: messageParts.maxAfter ?? 0, 
    maxBefore: messageParts.maxBefore ?? 0,    
  }
  const searcherObject = new Searcher();
  searcherObject.executeSeach(searchObject).then((result:IResult) => bot.sendMessage(bot.parseResultToText(result)));      
})

bot.start();

console.log('Smiles Scrapper running...');



