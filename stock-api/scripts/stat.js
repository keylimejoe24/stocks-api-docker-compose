const axios = require('axios');
const jsdom = require("jsdom"); 
const { JSDOM } = jsdom;
const baseURL = "https://finance.yahoo.com/quote";
const logger = require('../logger/api.logger');

async function getData(ticker) {
    try {
        const response = await axios.get(`${baseURL}/${ticker}/key-statistics?p=${ticker}`);
        const dom = new JSDOM(response.data);

        const details = [];

        const valMeasures = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div.Fl\\(start\\).smartphone_W\\(100\\%\\).W\\(100\\%\\) > div.Mb\\(10px\\).smartphone_Pend\\(0px\\).Pend\\(0px\\).Cl\\(end\\) > div > div.W\\(100\\%\\).Whs\\(nw\\).Ovx\\(a\\) > div.M\\(0\\).Whs\\(n\\).BdEnd.Bdc\\(\\$seperatorColor\\).D\\(itb\\) > table > tbody").children;
        details.push({
            "mktCapIntraDay": valMeasures[0].children[1].textContent,
            "enterpriseValue": valMeasures[1].children[1].textContent,
            "trailingPE": valMeasures[2].children[1].textContent,
            "forwardPE": valMeasures[3].children[1].textContent,
            "pegRatio": valMeasures[4].children[1].textContent,
            "priceToSales": valMeasures[5].children[1].textContent,
            "priceToBook": valMeasures[6].children[1].textContent,
            "enterpriseValToRevenue": valMeasures[7].children[1].textContent,
            "enterpriseValToEBITDA": valMeasures[8].children[1].textContent
        });

        const fiscalYear = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div:nth-child(3) > div > div:nth-child(1) > div > div > table > tbody").children;

        const profitability = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div:nth-child(3) > div > div:nth-child(2) > div > div > table > tbody").children;

        const managementEffectiveness = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div:nth-child(3) > div > div:nth-child(3) > div > div > table > tbody").children;

        const incomeStatement = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div:nth-child(3) > div > div:nth-child(4) > div > div > table > tbody").children;

        const balanceSheet = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div:nth-child(3) > div > div:nth-child(5) > div > div > table > tbody").children;

        const cashFlow = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div:nth-child(3) > div > div:nth-child(6) > div > div > table > tbody").children;

        details.push({
            "fiscalYear": {
                "fiscalEnd": fiscalYear[0].children[1].textContent,
                "mrq": fiscalYear[1].children[1].textContent
            },
            "profitability": {
                "profitMargin": profitability[0].children[1].textContent,
                "operatingMargin": profitability[1].children[1].textContent
            },
            "managementEffectiveness": {
                "roe": managementEffectiveness[0].children[1].textContent,
                "roa": managementEffectiveness[1].children[1].textContent
            },
            "incomeStatement": {
                "revenue": incomeStatement[0].children[1].textContent,
                "revenuePerShare": incomeStatement[1].children[1].textContent,
                "quarterlyRevenueGrowth": incomeStatement[2].children[1].textContent,
                "grossProfit": incomeStatement[3].children[1].textContent,
                "ebitda": incomeStatement[4].children[1].textContent,
                "netIncome": incomeStatement[5].children[1].textContent,
                "dilutedEPS": incomeStatement[6].children[1].textContent,
                "quarterlyEarningsGrowth": incomeStatement[7].children[1].textContent
            },
            "balanceSheet": {
                "totalCash": balanceSheet[0].children[1].textContent,
                "totalCashPerShare": balanceSheet[1].children[1].textContent,
                "totalDebt": balanceSheet[2].children[1].textContent,
                "totalDebtPerEquity": balanceSheet[3].children[1].textContent,
                "currentRatio": balanceSheet[4].children[1].textContent,
                "bookValuePerShare": balanceSheet[5].children[1].textContent
            },
            "cashFlow": {
                "operatingCashFlow": cashFlow[0].children[1].textContent,
                "leveredFreeCashFlow": cashFlow[1].children[1].textContent
            }
        });

        const stockPriceHistory = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div.Fl\\(end\\).W\\(50\\%\\).smartphone_W\\(100\\%\\) > div > div:nth-child(1) > div > div > table > tbody").children;

        const shareStats = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div.Fl\\(end\\).W\\(50\\%\\).smartphone_W\\(100\\%\\) > div > div:nth-child(2) > div > div > table > tbody").children;

        const dividendSplits = dom.window.document.querySelector("#Col1-0-KeyStatistics-Proxy > section > div.Mstart\\(a\\).Mend\\(a\\) > div.Fl\\(end\\).W\\(50\\%\\).smartphone_W\\(100\\%\\) > div > div:nth-child(3) > div > div > table > tbody").children;

        details.push({
            "stockPriceHistory": {
                "beta": stockPriceHistory[0].children[1].textContent,
                "yearChange": stockPriceHistory[1].children[1].textContent,
                "yearChangeSP": stockPriceHistory[2].children[1].textContent,
                "yearHigh": stockPriceHistory[3].children[1].textContent,
                "yearLow": stockPriceHistory[4].children[1].textContent,
                "movingAvg50": stockPriceHistory[5].children[1].textContent,
                "movingAvg200": stockPriceHistory[6].children[1].textContent
            },
            "shareStats": {
                "avgVolumeMonths3": shareStats[0].children[1].textContent,
                "avgVolumeDays10": shareStats[1].children[1].textContent,
                "sharesOutstanding": shareStats[2].children[1].textContent,
                "impliedSharesOutstanding": shareStats[3].children[1].textContent,
                "float": shareStats[4].children[1].textContent,
                "pctHeldByInsiders": shareStats[5].children[1].textContent,
                "pctHeldByInstitutions": shareStats[6].children[1].textContent,
                "sharesShort": shareStats[7].children[1].textContent,
                "shortRatio": shareStats[8].children[1].textContent,
                "shortPercentOfFloat": shareStats[9].children[1].textContent,
                "shortPercentOfSharesOutstanding": shareStats[10].children[1].textContent,
                "sharesShortPriorMonth": shareStats[11].children[1].textContent
            },
            "dividendSplits": {
                "fwdDividendRate": dividendSplits[0].children[1].textContent,
                "fwdDividendYield": dividendSplits[1].children[1].textContent,
                "trailingDividendRate": dividendSplits[2].children[1].textContent,
                "trailingDividendYield": dividendSplits[3].children[1].textContent,
                "dividendYieldAvg5Years": dividendSplits[4].children[1].textContent,
                "payoutRatio": dividendSplits[5].children[1].textContent,
                "dividendDate": dividendSplits[6].children[1].textContent,
                "exDividendDate": dividendSplits[7].children[1].textContent,
                "lastSplitFactor": dividendSplits[8].children[1].textContent,
                "lastSplitDate": dividendSplits[9].children[1].textContent
            }
        });

        return {
            "name": dom.window.document.querySelector("#quote-header-info > div.Mt\\(15px\\).D\\(f\\).Pos\\(r\\) > div.D\\(ib\\).Mt\\(-5px\\).Maw\\(38\\%\\)--tab768.Maw\\(38\\%\\).Mend\\(10px\\).Ov\\(h\\).smartphone_Maw\\(85\\%\\).smartphone_Mend\\(0px\\) > div.D\\(ib\\) > h1").textContent,
            "valMeasures": details[0],
            "finHighlights": details[1],
            "tradingInfo": details[2]
        };

    } catch (e) {
        console.log(e);
    }
}

exports.getData = getData;

/*
Abbreviation Guide:
mrq = Most Recent Quarter
ttm = Trailing Twelve Months
yoy = Year Over Year
lfy = Last Fiscal Year
fye = Fiscal Year Ending

Footnotes:
1 Data provided by Refinitiv.
2 Data provided by EDGAR Online.
3 Data derived from multiple sources or calculated by Yahoo Finance.
4 Data provided by Morningstar, Inc.
5 Shares outstanding is taken from the most recently filed quarterly or annual report and Market Cap is calculated using shares outstanding.
6 Implied Shares Outstanding of common equity, assuming the conversion of all convertible subsidiary equity into common.
7 EBITDA is calculated by S&P Global Market Intelligence using methodology that may differ from that used by a company in its reporting.
8 A company's float is a measure of the number of shares available for trading by the public. It's calculated by taking the number of issued and outstanding shares minus any restricted stock, which may not be publicly traded. 
*/