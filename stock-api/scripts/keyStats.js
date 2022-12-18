const axios = require('axios');
const cheerio = require("cheerio");
const baseURL = "https://finance.yahoo.com/quote";
const logger = require('../logger/api.logger');
const yahooFinance = require('../node-yahoo-finance')
const utils = require('../utils/utils');
const ProxiedRequest = require('../service/request.service');
const { performance } = require('perf_hooks');
var _ = require('lodash');

function convertToNum(text) {
  text = text.replace(/,/g, "");
  let last = text[text.length - 1];



  
  switch (last) {
    case "T":
      text = Number(text.slice(0, -1)) * 1000000000000;
      break;
    case "B":
      text = Number(text.slice(0, -1)) * 1000000000;
      break;
    case "M":
      text = Number(text.slice(0, -1)) * 1000000;
      break;
    case "k":
      text = Number(text.slice(0, -1)) * 1000;
      break;
    case "%":
      text = Number(text.slice(0, -1)) / 100.0;
      break;
    case "A":
      text = 0;
      break;
    default:
      text = Number(text);
  }
  return text;
}
async function parseYahooHtml(html) {

  let $ = cheerio.load(html);
  let table = $('tbody');
  let vals = {};
  table.each(function () {
    for (let i = 0; i < this.childNodes.length; i++) {
      let val = convertToNum($(this.childNodes[i].childNodes[1]).text());
      vals[removeFootnotes($(this.childNodes[i].childNodes[0]).text().trim())] = val;
    }
  });
  return vals
}
// Takes string as input and returns same string with footnote character and whitespace removed
function removeFootnotes(data) {
  let nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  if (nums.includes(data.slice(-1))) {
    return data.slice(0, -2);
  } else {
    return data;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function yahooFinanceSDK(ticker) {
  let financeRes = null
  let yahooFinanceSDKStart = performance.now();

  while (financeRes == null) {

    try {
      let agent = { proxy: "http://scraperapi:3a2d1ce726317bca068416409b016741@proxy-server.scraperapi.com:8001" }
      financeRes = await yahooFinance.quote({
        symbol: ticker,
        modules: ['defaultKeyStatistics', 'summaryDetail', 'financialData'],
        agent
      }, function (err, quotes) {
        if (err != null) {
          logger.error(err)
        }
        return quotes
      });
    } catch (error) {
      logger.error(error)

    }
    logger.info(`function yahooFinanceSDK took ${(performance.now() - yahooFinanceSDKStart).toFixed(3)}ms`);

  }



  let response = {}
  if (typeof financeRes['defaultKeyStatistics'] != undefined) {
    response = { ...financeRes['defaultKeyStatistics'] }
  }
  if (typeof financeRes['summaryDetail'] != undefined) {
    resWithoutOmmited = _.omit(financeRes['summaryDetail'], ['trailingAnnualDividendRate']);
    response = { ...response, ...resWithoutOmmited }

  }
  if (typeof financeRes['financialData'] != undefined) {
    response = { ...response, ...financeRes['financialData'] }
  }

  return response



}
async function getAssetsSharesAndLiabilities(ticker) {
  let balanceSheetRes = {
    'Current Assets': null,
    'Current Liabilities': null,
    'Current Issued Shares': null,
    'Previous Issued Shares': null
  }
  try {
    let currentTime = `${Date.now()}`
   
    let url = `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${ticker}?lang=en-US&region=US&symbol=${ticker}&padTimeSeries=true&type=quarterlyCurrentLiabilities%2CquarterlyCurrentAssets%2CquarterlyShareIssued&merge=false&period1=493590046&period2=${currentTime.slice(0, -3)}&corsDomain=finance.yahoo.com`
    let res = await ProxiedRequest.get(url)
   
    if (res === null) {
      logger.info(`retrying https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${ticker}?lang=en-US&region=US&symbol=${ticker}&padTimeSeries=true&type=quarterlyCurrentLiabilities%2CquarterlyCurrentAssets%2CquarterlyShareIssued&merge=false&period1=493590046&period2=${currentTime.slice(0, -3)}&corsDomain=finance.yahoo.com`);
    }
   
    res.body.timeseries.result.forEach(function (item, index) {
     
      if (_.has(item, 'quarterlyShareIssued')) {
        if (_.has(item, 'quarterlyShareIssued[2].reportedValue.raw')) { 
          balanceSheetRes['previousIssuedShares'] = item.quarterlyShareIssued[2].reportedValue.raw
        }
        if (_.has(item, 'item.quarterlyShareIssued[3].reportedValue.raw')) { 
          balanceSheetRes['currentIssuedShares'] = item.quarterlyShareIssued[3].reportedValue.raw
        }
        
      }
      if (_.has(item, 'quarterlyCurrentLiabilities')) {
        if (_.has(item, 'quarterlyCurrentLiabilities[3].reportedValue.raw')) { 
          balanceSheetRes['currentLiabilities'] = item.quarterlyCurrentLiabilities[3].reportedValue.raw
        }
      }
      if (_.has(item, 'quarterlyCurrentAssets')) {
        if (_.has(item, 'item.quarterlyCurrentAssets[3].reportedValue.raw')) { 
          balanceSheetRes['quarterlyCurrentAssets'] = item.quarterlyCurrentAssets[3].reportedValue.raw
        }
      }

    });
    return balanceSheetRes


  } catch (error) {
    console.log(error)
    return balanceSheetRes
  }
}

async function quoteSummary(ticker) {
  let results = null
  while (results === null) {


    try {


      let res = await ProxiedRequest.get(`https://finance.yahoo.com/quote/${ticker}`)
      if (res === null) {
        logger.info(`retrying https://finance.yahoo.com/quote/${ticker}`);
      }
      let parsedTables = await parseYahooHtml(res.body);

      results = {
        previousClose: parsedTables["Previous Close"],
        volume: parsedTables["Volume"],
        beta: parsedTables["Beta (5Y Monthly)"],
        eps: parsedTables["EPS (TTM)"],
        forwardAnnualDividend: parsedTables["Forward Dividend & Yield"]
      }

    }

    catch (e) {
      logger.error(e)
    }
    return results
  }
}
async function getData(ticker) {
  let results = null
  let defaultStats = await yahooFinanceSDK(ticker);
  let quoteSummaryRes = await quoteSummary(ticker);
  let financialsRes = await getAssetsSharesAndLiabilities(ticker);
  
  while (results === null) {


    try {


      let res = await ProxiedRequest.get(`https://finance.yahoo.com/quote/${ticker}/key-statistics?p=${ticker}`)
      if (res === null) {
        logger.info(`retrying https://finance.yahoo.com/quote/${ticker}/key-statistics?p=${ticker}`);
      }
      let parsedTables = await parseYahooHtml(res.body);

      results = {
        ...defaultStats, ...{
          quarterlyRevenueGrowth: parsedTables["Quarterly Revenue Growth (yoy)"],
          fiftyTwoWeekChange: parsedTables["52-Week Change"],
          sAndPFiveHundredFiftyTwoWeekChange: parsedTables["S&P500 52-Week Change"],
          dilutedEPS: parsedTables["Diluted EPS (ttm)"],
          forwardAnnualDividendRate: parsedTables["Forward Annual Dividend Rate"],
          trailingAnnualDividendRate: parsedTables["Trailing Annual Dividend Rate"],
          shortPercentOfSharesOutstanding: parsedTables["Short % of Shares Outstanding"],
        },...quoteSummaryRes,...financialsRes
      }

    }
    catch (e) {
      logger.error(e)
    }
    return results;
  }

}

exports.getData = getData;
