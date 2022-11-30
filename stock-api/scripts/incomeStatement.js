const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const baseURL = "https://finance.yahoo.com/quote";

async function getData(ticker) {
    try {
        const response = await axios.get(`${baseURL}/${ticker}/financials?p=${ticker}`);
        const dom = new JSDOM(response.data);

        dom.window.document.querySelector("#Col1-1-Financials-Proxy > section > div.Mb\\(10px\\) > button").click();

        const table = dom.window.document.querySelector("#Col1-1-Financials-Proxy > section > div.Pos\\(r\\) > div.W\\(100\\%\\).Whs\\(nw\\).Ovx\\(a\\).BdT.Bdtc\\(\\$seperatorColor\\) > div > div.D\\(tbrg\\)").children;

        const date1 = dom.window.document.querySelector("#Col1-1-Financials-Proxy > section > div.Pos\\(r\\) > div.W\\(100\\%\\).Whs\\(nw\\).Ovx\\(a\\).BdT.Bdtc\\(\\$seperatorColor\\) > div > div.D\\(tbhg\\) > div > div:nth-child(3) > span").textContent;

        const date2 = dom.window.document.querySelector("#Col1-1-Financials-Proxy > section > div.Pos\\(r\\) > div.W\\(100\\%\\).Whs\\(nw\\).Ovx\\(a\\).BdT.Bdtc\\(\\$seperatorColor\\) > div > div.D\\(tbhg\\) > div > div:nth-child(4) > span").textContent;

        const date3 = dom.window.document.querySelector("#Col1-1-Financials-Proxy > section > div.Pos\\(r\\) > div.W\\(100\\%\\).Whs\\(nw\\).Ovx\\(a\\).BdT.Bdtc\\(\\$seperatorColor\\) > div > div.D\\(tbhg\\) > div > div:nth-child(5) > span").textContent;

        const date4 = dom.window.document.querySelector("#Col1-1-Financials-Proxy > section > div.Pos\\(r\\) > div.W\\(100\\%\\).Whs\\(nw\\).Ovx\\(a\\).BdT.Bdtc\\(\\$seperatorColor\\) > div > div.D\\(tbhg\\) > div > div:nth-child(6) > span").textContent;

        return  {
            "name": dom.window.document.querySelector("#quote-header-info > div.Mt\\(15px\\).D\\(f\\).Pos\\(r\\) > div.D\\(ib\\).Mt\\(-5px\\).Maw\\(38\\%\\)--tab768.Maw\\(38\\%\\).Mend\\(10px\\).Ov\\(h\\).smartphone_Maw\\(85\\%\\).smartphone_Mend\\(0px\\) > div.D\\(ib\\) > h1").textContent,
            "ttm": {
                "totalRevenue": table[0].children[0].children[1].textContent,
                "costOfRevenue": table[1].children[0].children[1].textContent,
                "grossProfit": table[2].children[0].children[1].textContent,
                "operatingExpense": table[3].children[0].children[1].textContent,
                "operatingIncome": table[4].children[0].children[1].textContent,
                "netNonOperatingIncome": table[5].children[0].children[1].textContent,
                "otherIncomeExpense": table[6].children[0].children[1].textContent,
                "pretaxIncome": table[7].children[0].children[1].textContent,
                "taxProvision": table[8].children[0].children[1].textContent,
                "netIncome": table[9].children[0].children[1].textContent,
                "dilutedNetIncome": table[10].children[0].children[1].textContent,
                "basicEps": table[11].children[0].children[1].textContent,
                "dilutedEps": table[12].children[0].children[1].textContent,
                "basicAvgShares": table[13].children[0].children[1].textContent,
                "dilutedAvgShares": table[14].children[0].children[1].textContent,
                "totalOperatingIncomeAsReported": table[15].children[0].children[1].textContent,
                "totalExpenses": table[16].children[0].children[1].textContent,
                "netIncomeFromContinuingOps": table[17].children[0].children[1].textContent,
                "normalizedIncome": table[18].children[0].children[1].textContent,
                "interestIncome": table[19].children[0].children[1].textContent,
                "interestExpense": table[20].children[0].children[1].textContent,
                "netInterestIncome": table[21].children[0].children[1].textContent,
                "ebit": table[22].children[0].children[1].textContent,
                "ebitda": table[23].children[0].children[1].textContent,
                "reconciledCostOfRevenue": table[24].children[0].children[1].textContent,
                "reconciledDepreciation": table[25].children[0].children[1].textContent,
                "netIncomeFromContinuingOpsNetMinorityInterest": table[26].children[0].children[1].textContent,
                "normalizedEbitda": table[27].children[0].children[1].textContent,
                "taxRateForCalcs": table[28].children[0].children[1].textContent,
                "taxEffectOfUnusualItems": table[29].children[0].children[1].textContent
            },
            [date1]: {
                "totalRevenue": table[0].children[0].children[2].textContent,
                "costOfRevenue": table[1].children[0].children[2].textContent,
                "grossProfit": table[2].children[0].children[2].textContent,
                "operatingExpense": table[3].children[0].children[2].textContent,
                "operatingIncome": table[4].children[0].children[2].textContent,
                "netNonOperatingIncome": table[5].children[0].children[2].textContent,
                "otherIncomeExpense": table[6].children[0].children[2].textContent,
                "pretaxIncome": table[7].children[0].children[2].textContent,
                "taxProvision": table[8].children[0].children[2].textContent,
                "netIncome": table[9].children[0].children[2].textContent,
                "dilutedNetIncome": table[10].children[0].children[2].textContent,
                "basicEps": table[11].children[0].children[2].textContent,
                "dilutedEps": table[12].children[0].children[2].textContent,
                "basicAvgShares": table[13].children[0].children[2].textContent,
                "dilutedAvgShares": table[14].children[0].children[2].textContent,
                "totalOperatingIncomeAsReported": table[15].children[0].children[2].textContent,
                "totalExpenses": table[16].children[0].children[2].textContent,
                "netIncomeFromContinuingOps": table[17].children[0].children[2].textContent,
                "normalizedIncome": table[18].children[0].children[2].textContent,
                "interestIncome": table[19].children[0].children[2].textContent,
                "interestExpense": table[20].children[0].children[2].textContent,
                "netInterestIncome": table[21].children[0].children[2].textContent,
                "ebit": table[22].children[0].children[2].textContent,
                "ebitda": table[23].children[0].children[2].textContent,
                "reconciledCostOfRevenue": table[24].children[0].children[2].textContent,
                "reconciledDepreciation": table[25].children[0].children[2].textContent,
                "netIncomeFromContinuingOpsNetMinorityInterest": table[26].children[0].children[2].textContent,
                "normalizedEbitda": table[27].children[0].children[2].textContent,
                "taxRateForCalcs": table[28].children[0].children[2].textContent,
                "taxEffectOfUnusualItems": table[29].children[0].children[2].textContent
            },
            [date2]: {
                "totalRevenue": table[0].children[0].children[3].textContent,
                "costOfRevenue": table[1].children[0].children[3].textContent,
                "grossProfit": table[2].children[0].children[3].textContent,
                "operatingExpense": table[3].children[0].children[3].textContent,
                "operatingIncome": table[4].children[0].children[3].textContent,
                "netNonOperatingIncome": table[5].children[0].children[3].textContent,
                "otherIncomeExpense": table[6].children[0].children[3].textContent,
                "pretaxIncome": table[7].children[0].children[3].textContent,
                "taxProvision": table[8].children[0].children[3].textContent,
                "netIncome": table[9].children[0].children[3].textContent,
                "dilutedNetIncome": table[10].children[0].children[3].textContent,
                "basicEps": table[11].children[0].children[3].textContent,
                "dilutedEps": table[12].children[0].children[3].textContent,
                "basicAvgShares": table[13].children[0].children[3].textContent,
                "dilutedAvgShares": table[14].children[0].children[3].textContent,
                "totalOperatingIncomeAsReported": table[15].children[0].children[3].textContent,
                "totalExpenses": table[16].children[0].children[3].textContent,
                "netIncomeFromContinuingOps": table[17].children[0].children[3].textContent,
                "normalizedIncome": table[18].children[0].children[3].textContent,
                "interestIncome": table[19].children[0].children[3].textContent,
                "interestExpense": table[20].children[0].children[3].textContent,
                "netInterestIncome": table[21].children[0].children[3].textContent,
                "ebit": table[22].children[0].children[3].textContent,
                "ebitda": table[23].children[0].children[3].textContent,
                "reconciledCostOfRevenue": table[24].children[0].children[3].textContent,
                "reconciledDepreciation": table[25].children[0].children[3].textContent,
                "netIncomeFromContinuingOpsNetMinorityInterest": table[26].children[0].children[3].textContent,
                "normalizedEbitda": table[27].children[0].children[3].textContent,
                "taxRateForCalcs": table[28].children[0].children[3].textContent,
                "taxEffectOfUnusualItems": table[29].children[0].children[3].textContent
            },
            [date3]: {
                "totalRevenue": table[0].children[0].children[4].textContent,
                "costOfRevenue": table[1].children[0].children[4].textContent,
                "grossProfit": table[2].children[0].children[4].textContent,
                "operatingExpense": table[3].children[0].children[4].textContent,
                "operatingIncome": table[4].children[0].children[4].textContent,
                "netNonOperatingIncome": table[5].children[0].children[4].textContent,
                "otherIncomeExpense": table[6].children[0].children[4].textContent,
                "pretaxIncome": table[7].children[0].children[4].textContent,
                "taxProvision": table[8].children[0].children[4].textContent,
                "netIncome": table[9].children[0].children[4].textContent,
                "dilutedNetIncome": table[10].children[0].children[4].textContent,
                "basicEps": table[11].children[0].children[4].textContent,
                "dilutedEps": table[12].children[0].children[4].textContent,
                "basicAvgShares": table[13].children[0].children[4].textContent,
                "dilutedAvgShares": table[14].children[0].children[4].textContent,
                "totalOperatingIncomeAsReported": table[15].children[0].children[4].textContent,
                "totalExpenses": table[16].children[0].children[4].textContent,
                "netIncomeFromContinuingOps": table[17].children[0].children[4].textContent,
                "normalizedIncome": table[18].children[0].children[4].textContent,
                "interestIncome": table[19].children[0].children[4].textContent,
                "interestExpense": table[20].children[0].children[4].textContent,
                "netInterestIncome": table[21].children[0].children[4].textContent,
                "ebit": table[22].children[0].children[4].textContent,
                "ebitda": table[23].children[0].children[4].textContent,
                "reconciledCostOfRevenue": table[24].children[0].children[4].textContent,
                "reconciledDepreciation": table[25].children[0].children[4].textContent,
                "netIncomeFromContinuingOpsNetMinorityInterest": table[26].children[0].children[4].textContent,
                "normalizedEbitda": table[27].children[0].children[4].textContent,
                "taxRateForCalcs": table[28].children[0].children[4].textContent,
                "taxEffectOfUnusualItems": table[29].children[0].children[4].textContent
            },
            [date4]: {
                "totalRevenue": table[0].children[0].children[5].textContent,
                "costOfRevenue": table[1].children[0].children[5].textContent,
                "grossProfit": table[2].children[0].children[5].textContent,
                "operatingExpense": table[3].children[0].children[5].textContent,
                "operatingIncome": table[4].children[0].children[5].textContent,
                "netNonOperatingIncome": table[5].children[0].children[5].textContent,
                "otherIncomeExpense": table[6].children[0].children[5].textContent,
                "pretaxIncome": table[7].children[0].children[5].textContent,
                "taxProvision": table[8].children[0].children[5].textContent,
                "netIncome": table[9].children[0].children[5].textContent,
                "dilutedNetIncome": table[10].children[0].children[5].textContent,
                "basicEps": table[11].children[0].children[5].textContent,
                "dilutedEps": table[12].children[0].children[5].textContent,
                "basicAvgShares": table[13].children[0].children[5].textContent,
                "dilutedAvgShares": table[14].children[0].children[5].textContent,
                "totalOperatingIncomeAsReported": table[15].children[0].children[5].textContent,
                "totalExpenses": table[16].children[0].children[5].textContent,
                "netIncomeFromContinuingOps": table[17].children[0].children[5].textContent,
                "normalizedIncome": table[18].children[0].children[5].textContent,
                "interestIncome": table[19].children[0].children[5].textContent,
                "interestExpense": table[20].children[0].children[5].textContent,
                "netInterestIncome": table[21].children[0].children[5].textContent,
                "ebit": table[22].children[0].children[5].textContent,
                "ebitda": table[23].children[0].children[5].textContent,
                "reconciledCostOfRevenue": table[24].children[0].children[5].textContent,
                "reconciledDepreciation": table[25].children[0].children[5].textContent,
                "netIncomeFromContinuingOpsNetMinorityInterest": table[26].children[0].children[5].textContent,
                "normalizedEbitda": table[27].children[0].children[5].textContent,
                "taxRateForCalcs": table[28].children[0].children[5].textContent,
                "taxEffectOfUnusualItems": table[29].children[0].children[5].textContent
            }
        };

    } catch (error) {
        console.log(error);
    }
}

exports.getData = getData;