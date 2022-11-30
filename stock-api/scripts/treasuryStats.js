// 
const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
// const yahooFinance = require("yahoo-finance");
const yahooFinance = require('../node-yahoo-finance')
const URL = "https://finance.yahoo.com/quote";
const baseURL = "https://finance.yahoo.com/quote";
const logger = require('../logger/api.logger');



async function getAverageHourlyAndWeeklyEarnings(){
    let cpiDataRes = await axios.get("https://www.bls.gov/news.release/empsit.t19.htm#").then((response) => {
        if (response.status === 200) {
            return response.data;
        }
    }, (error) => logger.print(error));
    const dom = new JSDOM(cpiDataRes);
    const lastMonthsWeeklyEarnings = dom.window.document.querySelector("#ces_table3 > tbody > tr:nth-child(1) > td:nth-child(8) > span").textContent;
    const currentWeeklyEarnings = dom.window.document.querySelector("#ces_table3 > tbody > tr:nth-child(1) > td:nth-child(9) > span").textContent;
   
    return {
        "lastMonthsWeeklyEarnings": lastMonthsWeeklyEarnings,
        "currentWeeklyEarnings": currentWeeklyEarnings,
    }
   
}

async function getDailyTreasuryRates() {

    let cpiDataRes = await axios.get("https://www.bls.gov/cpi/latest-numbers.htm").then((response) => {
        if (response.status === 200) {
            return response.data;
        }
    }, (error) => logger.print(error));
    const dom = new JSDOM(cpiDataRes);
    const yoyCPI = dom.window.document.querySelector("#latest-numbers > div:nth-child(4) > p:nth-child(4) > span.data-text > span.data.positive").textContent;
    return yoyCPI

}
async function getTreasuryData() {

    let treasuryDataRes = await axios.get(`https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/2022/all?type=daily_treasury_yield_curve&field_tdr_date_value=2022&page&_format=csv`).then((response) => {
        if (response.status === 200) {
            return response.data;
        }
    }, (error) => logger.print(error));

    let splitTreasuryData = treasuryDataRes.split(",")
    let tenYearGovtTreasuryYtm = splitTreasuryData[24]
    return tenYearGovtTreasuryYtm

}
async function getSpyDividendYield() {
    try {

        let spyQuotes = await yahooFinance.quote({
            symbol: "SPY",
            modules: ['summaryDetail']
        }, function (err, quotes) {

            return quotes
        });
        // logger.print(JSON.stringify(spyQuotes, null, 2))
        return spyQuotes.summaryDetail.yield


    } catch (error) {
        throw error;
    }

}
async function federalReserveDataDownload() {

    let federalReserveDataDownload = await axios.get(`https://www.federalreserve.gov/datadownload/Output.aspx?rel=H6&series=798e2796917702a5f8423426ba7e6b42&lastobs=&from=&to=&filetype=csv&label=include&layout=seriescolumn&type=package`).then((response) => {
        if (response.status === 200) {
            return response.data;
        }
    }, (error) => logger.print(error));
    let splitTreasuryData = federalReserveDataDownload.split("\n")
    let m1SeasonallyAdjustedLastMonth = splitTreasuryData[splitTreasuryData.length - 2].split(",")[11]
    let m1SeasonallyAdjustedCurrent = splitTreasuryData[splitTreasuryData.length - 1].split(",")[11]
   
    return {
        "m1SeasonallyAdjustedLastMonth": m1SeasonallyAdjustedLastMonth,
        "m1SeasonallyAdjustedCurrent": m1SeasonallyAdjustedCurrent
    }

}

//
async function yieldCurveAndTreasuryRate() {

    let treasuryYieldCurveRes = await axios.get(`https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/2022/all?type=daily_treasury_yield_curve&field_tdr_date_value=2022&page&_format=csv`).then((response) => {
        if (response.status === 200) {
            return response.data;
        }
    }, (error) => logger.print(error));

    let splitTreasuryData = treasuryYieldCurveRes.split("\n")
    let treasuryYieldCurve = {}
    let splitTreasureValues = splitTreasuryData[1].split(",")

    splitTreasuryData[0].split(",").forEach((d, i) => {
        if ((i > 0)) {
            d = d.replace('\"', '');
            d = d.replace('\"', '');
                
            if(((!d.includes("4 Mo") || !d.includes("2 Mo")))){
                treasuryYieldCurve[d] = parseFloat(splitTreasureValues[i])
            }
        }
    })

    splitTreasuryData[0].split(",").forEach((d, i) => {
        if ((i > 0)) {
            d = d.replace('\"', '');
            d = d.replace('\"', '');
                
            if(((!d.includes("4 Mo") || !d.includes("2 Mo")))){
                treasuryYieldCurve[d] = parseFloat(splitTreasureValues[i])
            }
        }
    })
    
    let tenYearTreasuryRate = {}
    let tenYearTreasuryRateMonthly = {}
    let tenYearTreasuryRateQuarterly = {}

    tenYearTreasuryRate[`${splitTreasuryData[1].split(",")[0]}`] = splitTreasuryData[1].split(",").slice(11, 12)[0]
    tenYearTreasuryRate[`${splitTreasuryData[5].split(",")[0]}`] = splitTreasuryData[5].split(",").slice(11, 12)[0]

    tenYearTreasuryRateMonthly[`${splitTreasuryData[1].split(",")[0]}`] = splitTreasuryData[1].split(",").slice(11, 12)[0]
    tenYearTreasuryRateMonthly[`${splitTreasuryData[21].split(",")[0]}`] = splitTreasuryData[21].split(",").slice(11, 12)[0]

    tenYearTreasuryRateQuarterly[`${splitTreasuryData[1].split(",")[0]}`] = splitTreasuryData[1].split(",").slice(11, 12)[0]
    tenYearTreasuryRateQuarterly[`${splitTreasuryData[85].split(",")[0]}`] = splitTreasuryData[64].split(",").slice(11, 12)[0]

    return {
        "treasuryYieldCurve": treasuryYieldCurve,
        "tenYearTreasuryRate": tenYearTreasuryRate,
        "tenYearTreasuryRateMonthly":tenYearTreasuryRateMonthly,
        "tenYearTreasuryRateQuarterly":tenYearTreasuryRateQuarterly
    }


}
async function getData() {

    let yoyCPI = await getDailyTreasuryRates()
    let tenYearGovtTreasuryYtm = await getTreasuryData()
    let tresYieldCurveRes = await yieldCurveAndTreasuryRate()
    let spyDividenYield = await getSpyDividendYield()
    let federalReserveDataDownloadRes = await federalReserveDataDownload()
    let getAverageHourlyAndWeeklyEarningsRes =  await getAverageHourlyAndWeeklyEarnings()

   
    return {
        "tenYearGovtTreasuryYtm": tenYearGovtTreasuryYtm,
        "yoyCPI": yoyCPI,
        "treasuryYieldCurve": tresYieldCurveRes["treasuryYieldCurve"],
        "tenYearTreasuryRate": tresYieldCurveRes["tenYearTreasuryRate"],
        "tenYearTreasuryRateMonthly": tresYieldCurveRes["tenYearTreasuryRateMonthly"],
        "tenYearTreasuryRateQuarterly": tresYieldCurveRes["tenYearTreasuryRateQuarterly"],
        "spyDividenYield": spyDividenYield,
        ...federalReserveDataDownloadRes,
        ...getAverageHourlyAndWeeklyEarningsRes
    }
   

}


exports.getData = getData;

  