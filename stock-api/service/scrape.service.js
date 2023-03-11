const treasuryStats = require('../scripts/treasuryStats');
const scrapeRepository = require('../repository/scrape.repository');
const { randomUUID } = require('crypto'); // Added in: node v14.17.0
const logger = require('../logger/api.logger');
const yahooFinance2 = require('../node-yahoo-finance2').default;
const cheerio = require("cheerio");
const yahooFinance = require('../node-yahoo-finance')
const ProxiedRequest = require('../service/request.service');
var _ = require('lodash');
const { PromisePool } = require('@supercharge/promise-pool')
const { performance } = require('perf_hooks');
var sleep = require('sleep');
const Algorithms = require('./algorithms.js');
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

function removeFootnotes(data) {
    let nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if (nums.includes(data.slice(-1))) {
        return data.slice(0, -2);
    } else {
        return data;
    }
}
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

function removeFootnotes(data) {
    let nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if (nums.includes(data.slice(-1))) {
        return data.slice(0, -2);
    } else {
        return data;
    }
}


async function getClosingHistories(ticker) {
    let result = null
    while (result === null) {
        try {
            const today = new Date()
            const yesterday = new Date(today)
            const tenDaysAgo = new Date(today)

            tenDaysAgo.setDate(yesterday.getDate() - 10)
            let yesterdayISOFormat = yesterday.toISOString().split("T")[0]
            let tenDaysAgoISOFormat = tenDaysAgo.toISOString().split("T")[0]

            const queryOptions = { period1: tenDaysAgoISOFormat, period2: yesterdayISOFormat };
            let ProxiedRequestStart = performance.now();

            result = await yahooFinance2.historical(ticker, queryOptions);
            logger.info(`function  yahooFinance2.historical took ${(performance.now() - ProxiedRequestStart).toFixed(3)}ms`);

           
        }
        catch (error) {
            logger.info(e.toString())
            if (e.toString() === "HTTPError: Too Many Requests") {
                let sleepFor = retryCount * 10
                logger.info(`Retry Count: ${retryCount}, Sleeping for ${sleepFor}`)
                await sleep.sleep(sleepFor);
            }
            logger.error(error);
            logger.error(e.code)
        }
    }
    return {
        "closingHistories": result.slice(0, 4).map(q => {
            return q.close
        })
    }

}

async function getBalanceSheetHistory(ticker) {
    let result = null
    var retryCount = 0;
    while (result === null) {
        try {
            let ProxiedRequestStart = performance.now();
            result = await yahooFinance2.quoteSummary(ticker, { modules: ["balanceSheetHistory"] });
            if (result === null) {

                logger.info(`retrying yahooFinance2.quoteSummary(${ticker}, { modules: ["balanceSheetHistory"] })`);
            }
            logger.info(`function yahooFinance2.quoteSummary took ${(performance.now() - ProxiedRequestStart).toFixed(3)}ms`);

            
        } catch (e) {
            logger.info(e.toString())
            if (e.toString() === "HTTPError: Too Many Requests") {
                let sleepFor = retryCount * 10
                logger.info(`Retry Count: ${retryCount}, Sleeping for ${sleepFor}`)
                await sleep.sleep(sleepFor);
            }
            logger.error(error);
            logger.error(e.code)
        }

    }
    return result.balanceSheetHistory.balanceSheetStatements[0]
}
async function quoteSummary(ticker) {
    let results = null
    var retryCount = 0;
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
            logger.info(e.toString())
            if (e.toString() === "HTTPError: Too Many Requests") {
                let sleepFor = retryCount * 10
                logger.info(`Retry Count: ${retryCount}, Sleeping for ${sleepFor}`)
                await sleep.sleep(sleepFor);
            }
            logger.error(error);
            logger.error(e.code)

        }
        
    }
    return results
}

async function getAssetsSharesAndLiabilities(ticker) {
    var retryCount = 0;
    let balanceSheetRes = {}
    while (_.isEmpty(balanceSheetRes)) {
        try {
            let currentTime = `${Date.now()}`

            let url = `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${ticker}?lang=en-US&region=US&symbol=${ticker}&padTimeSeries=true&type=quarterlyCurrentLiabilities%2CquarterlyCurrentAssets%2CquarterlyShareIssued&merge=false&period1=493590046&period2=${currentTime.slice(0, -3)}&corsDomain=finance.yahoo.com`
            let res = await ProxiedRequest.get(url)

            if (res === null) {
                logger.info(`retrying https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${ticker}?lang=en-US&region=US&symbol=${ticker}&padTimeSeries=true&type=quarterlyCurrentLiabilities%2CquarterlyCurrentAssets%2CquarterlyShareIssued&merge=false&period1=493590046&period2=${currentTime.slice(0, -3)}&corsDomain=finance.yahoo.com`);
            }

            let quarterlySharesIssued = _.get(_.find(res.body.timeseries.result, "quarterlyShareIssued"), "quarterlyShareIssued", null)
            let quarterlyCurrentLiabilities = _.get(_.find(res.body.timeseries.result, "quarterlyCurrentLiabilities"), "quarterlyCurrentLiabilities", null)
            let quarterlyCurrentAssets = _.get(_.find(res.body.timeseries.result, "quarterlyCurrentAssets"), "quarterlyCurrentAssets", null)

            if (quarterlySharesIssued != null) {
                balanceSheetRes['previouslyIssuedShares'] = quarterlySharesIssued[quarterlySharesIssued.length - 2].reportedValue.raw
                balanceSheetRes['currentlyIssuedShares'] = quarterlySharesIssued[quarterlySharesIssued.length - 1].reportedValue.raw
            }
            if (quarterlyCurrentLiabilities != null) {
                balanceSheetRes['currentLiabilities'] = quarterlyCurrentLiabilities[quarterlyCurrentLiabilities.length - 1].reportedValue.raw
            }
            if (quarterlyCurrentAssets != null) {
                balanceSheetRes['currentAssets'] = quarterlyCurrentAssets[quarterlyCurrentAssets.length - 1].reportedValue.raw
            }

           

        }

        catch (e) {
            if (e.toString() === "HTTPError: Too Many Requests") {
                let sleepFor = retryCount * 10
                logger.info(`Retry Count: ${retryCount}, Sleeping for ${sleepFor}`)
                await sleep.sleep(sleepFor);
            }

            logger.error(e)
            logger.error(e.code)
            logger.info("retrying...")
        }
        
    }
    return balanceSheetRes
}

async function quoteSummary(ticker) {
    var retryCount = 0;
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
            if (e.toString() === "HTTPError: Too Many Requests") {
                let sleepFor = retryCount * 10
                logger.info(`Retry Count: ${retryCount}, Sleeping for ${sleepFor}`)
                await sleep.sleep(sleepFor);
            }

            logger.error(e)
            logger.error(e.code)
            logger.info("retrying...")
        }
        
    }
    return results
}

async function getData(ticker) {
    var retryCount = 0;
    let results = null

    let quoteSummaryRes = await quoteSummary(ticker);
    let financialsRes = await getAssetsSharesAndLiabilities(ticker);
    while (results === null) {
        try {
            let res = await ProxiedRequest.get(`https://finance.yahoo.com/quote/${ticker}/key-statistics?p=${ticker}`)
            if (res === null) {
                logger.info(`retrying https://finance.yahoo.com/quote/${ticker}/key-statistics?p=${ticker}`);
            }
            let parsedTables = await parseYahooHtml(res.body);
            let shortPercentOfSharesOutStanding = _.pickBy(parsedTables, (value, key) => _.includes(key, "Short % of Shares Outstanding"))
            let shortPercentOfSharesOutStandingVal = Object.values(shortPercentOfSharesOutStanding)[0]

            results = {
                symbol: ticker,
                ...financialsRes,
                ...quoteSummaryRes,
                quarterlyRevenueGrowth: parsedTables["Quarterly Revenue Growth (yoy)"],
                fiftyTwoWeekChange: parsedTables["52-Week Change"],
                sAndPFiveHundredFiftyTwoWeekChange: parsedTables["S&P500 52-Week Change"],
                dilutedEPS: parsedTables["Diluted EPS (ttm)"],
                forwardAnnualDividendRate: parsedTables["Forward Annual Dividend Rate"],
                trailingAnnualDividendRate: parsedTables["Trailing Annual Dividend Rate"],
                shortPercentOfSharesOutstanding: shortPercentOfSharesOutStandingVal,
                operatingCashFlow: parsedTables["Operating Cash Flow (ttm)"]
            }

        }
        catch (e) {

            if (e.toString() === "HTTPError: Too Many Requests") {
                let sleepFor = retryCount * 10
                logger.info(`Retry Count: ${retryCount}, Sleeping for ${sleepFor}`)
                await sleep.sleep(sleepFor);
            }

            logger.error(error.message)
            logger.error(e.code)
            logger.info("retrying...")
        }
    }
    return results;

}


const batchStoreScrape = async (tickers, uuid, treasuryStatsRes, socketIO) => {

    await PromisePool.for(tickers).withConcurrency(2).process(async ticker => {

        const start = performance.now();
        let keyStatsRes = await getData(ticker);
        let closingHistories = await getClosingHistories(ticker);
        let balanceSheetStatements = await getBalanceSheetHistory(ticker);

        let scrapeResult = {
            id: uuid,
            ticker: ticker,
            ...keyStatsRes,
            ...closingHistories,
            ...balanceSheetStatements,
            ...treasuryStatsRes
        }
        logger.info("scrapeResult", scrapeResult)

        scrapeRepository.create(scrapeResult)
        let scrapeDuration = (performance.now() - start) / 1000

        logger.info("batchFinished", { finishedTickers: [ticker], scrapeTime: scrapeDuration })
        socketIO.emit("batchFinished", { finishedTickers: [ticker], scrapeTime: scrapeDuration });

    })

    socketIO.emit("complete");

}

class ScrapeService {

    constructor() { }

    async runAlgorithms(scrapeId) {
        const results = await scrapeRepository.listByID(scrapeId)
        let totalResults = {}
        let summaryRes = []
        results.forEach(r => {
            let marketEquilibriumRes = Algorithms.marketEquilibrium(r)
            let yieldCurveInOrderRes = Algorithms.yieldCurveInOrder(r)
            let tenYearTreasuryRateRes = Algorithms.tenYearTreasuryRate(r)
            let tenYearTreasuryRateMonthlyRes = Algorithms.tenYearTreasuryRateMonthly(r)
            let tenYearTreasuryRateQuarterlyRes = Algorithms.tenYearTreasuryRateQuarterly(r)
            let m1SeasonallyAdjustedRes = Algorithms.m1SeasonallyAdjusted(r)
            let averageWageGrowthRes = Algorithms.averageWageGrowth(r)
            let dividendRateComparisonRes = Algorithms.dividendRateComparison(r)
            let pegRatioAndEPSRes = Algorithms.pegRatioAndEPS(r)
            let betaSwingsRes = Algorithms.betaSwings(r)
            let movingAverageMeanReversionsRes = Algorithms.movingAverageMeanReversions(r)
            let shortPercentOfSharesOutstandingRes = Algorithms.shortPercentOfSharesOutstanding(r)
            let stockMovementSevenDaysRes = Algorithms.stockMovementSevenDays(r)
            let fiftyTwoWeekLowsHighsAndVolumeRes = Algorithms.fiftyTwoWeekLowsHighsAndVolume(r)
            let revenueGrowthRes = Algorithms.revenueGrowth(r)
            let earningsGrowthRes = Algorithms.earningsGrowth(r)
            let abilityToPayCurrentLiabilitiesRes = Algorithms.abilityToPayCurrentLiabilities(r)
            let trailingPEvsForwardRes = Algorithms.trailingPEvsForward(r)
            let stockBuyBackRes = Algorithms.stockBuyBacks(r)
            let freeCashFlowYieldPerStockRes = Algorithms.freeCashFlowYieldPerStock(r)
            let totalWeight = 0
            let calculations = [dividendRateComparisonRes,
                pegRatioAndEPSRes,
                betaSwingsRes,
                fiftyTwoWeekLowsHighsAndVolumeRes,
                movingAverageMeanReversionsRes,
                stockMovementSevenDaysRes,
                shortPercentOfSharesOutstandingRes,
                revenueGrowthRes,
                earningsGrowthRes,
                trailingPEvsForwardRes,
                abilityToPayCurrentLiabilitiesRes,
                stockBuyBackRes,
                freeCashFlowYieldPerStockRes,
                marketEquilibriumRes,
                yieldCurveInOrderRes,
                tenYearTreasuryRateRes,
                tenYearTreasuryRateMonthlyRes,
                tenYearTreasuryRateQuarterlyRes,
                m1SeasonallyAdjustedRes,
                averageWageGrowthRes]

            for (const calc of calculations) {
                if (typeof calc != 'undefined') {
                    if (calc.hasOwnProperty('weight')) {
                        if (typeof calc.weight === 'number') {
                            if (!_.isNull(calc.weight) && !_.isNil(calc.weight) && calc.weight != null) {
                                totalWeight += calc.weight
                            }

                        }
                    }
                }
            }
            let tickerCalculationResults = {
                "Total Weight": totalWeight,
                "1.) Dividend Rate Comparison": dividendRateComparisonRes,
                "2.) Peg Ratio and EPS": pegRatioAndEPSRes,
                "3.) Beta Swings": betaSwingsRes,
                "4.) 52 Week Low and Highs & Volume": fiftyTwoWeekLowsHighsAndVolumeRes,
                "5.) Moving Average Mean Reversions": movingAverageMeanReversionsRes,
                "6.) Stock Movement Seven Days": stockMovementSevenDaysRes,
                "7.) % of Shares Short": shortPercentOfSharesOutstandingRes,
                "8.) Revenue Growth": revenueGrowthRes,
                "9.) Earnings Growth": earningsGrowthRes,
                "10.) Trailing P/E vs.Forward P/E": trailingPEvsForwardRes,
                "11.) Ability to Pay Current Liabilities": abilityToPayCurrentLiabilitiesRes,
                "12.) Stock Buy Backs": stockBuyBackRes,
                "20.) Free CashFlow Yield PerStock": freeCashFlowYieldPerStockRes,
                "13.) Market Equilibrium": marketEquilibriumRes,
                "14.) Yield Curve In Order": yieldCurveInOrderRes,
                "15.) 10 Year Treasury Rate Increasing or Decreasing": tenYearTreasuryRateRes,
                "16.) 10 Year Treasury Rate Increasing or Decreasing Monthly": tenYearTreasuryRateMonthlyRes,
                "17.) 10 Year Treasury Rate Increasing or Decreasing Quarterly": tenYearTreasuryRateQuarterlyRes,
                "18.) Money Supply": m1SeasonallyAdjustedRes,
                "19.) Average Wage Growth": averageWageGrowthRes,

            }

            totalResults[r.symbol] = tickerCalculationResults
            summaryRes.push({
                ticker: r.symbol,
                weight: totalWeight
            })


        })


        let filteredResWeightNan = _.reject(summaryRes, i => isNaN(i.weight) === true);
        let sortedAndFilteredRes = filteredResWeightNan.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
        let topTenResults = sortedAndFilteredRes.slice(0, 10)
        let bottomTenResults = sortedAndFilteredRes.slice(sortedAndFilteredRes.length - 10, sortedAndFilteredRes.length)
        return {
            totalResults: totalResults,
            topTen: topTenResults,
            bottomTen: bottomTenResults
        }
    }
    async run(tickers, scrapeID, socketIO) {
        let treasuryStatsRes
        try {
            treasuryStatsRes = await treasuryStats.getData();
        } catch (e) {
            logger.error(e)
        }
        batchStoreScrape(tickers, scrapeID, treasuryStatsRes, socketIO)
    }



}

module.exports = new ScrapeService();