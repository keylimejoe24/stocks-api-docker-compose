const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const baseURL = "https://finance.yahoo.com/quote";

async function fetchData(ticker) {
    try {
        const response = await axios.get(`${baseURL}/${ticker}?p=${ticker}`);
        const dom = new JSDOM(response.data);

        const table1 = dom.window.document.querySelector("#quote-summary > div.D\\(ib\\).W\\(1\\/2\\).Bxz\\(bb\\).Pend\\(12px\\).Va\\(t\\).ie-7_D\\(i\\).smartphone_D\\(b\\).smartphone_W\\(100\\%\\).smartphone_Pend\\(0px\\).smartphone_BdY.smartphone_Bdc\\(\\$seperatorColor\\) > table > tbody");

        const table2 = dom.window.document.querySelector("#quote-summary > div.D\\(ib\\).W\\(1\\/2\\).Bxz\\(bb\\).Pstart\\(12px\\).Va\\(t\\).ie-7_D\\(i\\).ie-7_Pos\\(a\\).smartphone_D\\(b\\).smartphone_W\\(100\\%\\).smartphone_Pstart\\(0px\\).smartphone_BdB.smartphone_Bdc\\(\\$seperatorColor\\) > table > tbody");

        const rows1 = table1.querySelectorAll("tr");
        const rows2 = table2.querySelectorAll("tr");

        const properties = ["name", "price", "change", "pctChange", "remark", "prevClose", "open", "bid", "ask", "dayRange", "yearRange", "volume", "avgVolume", "marketCap", "beta", "PE", "EPS", "earningsDate", "fwdDividendY", "exDividendDate", "tgtEst1Y"];

        const details = [];

        const name = dom.window.document.querySelector("#quote-header-info > div.Mt\\(15px\\).D\\(f\\).Pos\\(r\\) > div.D\\(ib\\).Mt\\(-5px\\).Maw\\(38\\%\\)--tab768.Maw\\(38\\%\\).Mend\\(10px\\).Ov\\(h\\).smartphone_Maw\\(85\\%\\).smartphone_Mend\\(0px\\) > div.D\\(ib\\) > h1").textContent;

        details.push(name);

        const realtime = dom.window.document.querySelector("#quote-header-info > div.My\\(6px\\).Pos\\(r\\).smartphone_Mt\\(6px\\).W\\(100\\%\\) > div.D\\(ib\\).Va\\(m\\).Maw\\(65\\%\\).Ov\\(h\\) > div");
        details.push(realtime.children[0].textContent);
        details.push(realtime.children[1].textContent);
        details.push(realtime.children[2].textContent.replace(/[()]/g, ''));
        details.push(realtime.children[5].textContent.replace(/\s{2,}/g, ' '));

        for (let row of rows1) {
            details.push(row.querySelector('td:nth-of-type(2)').textContent);
        }

        for (let row of rows2) {
            details.push(row.querySelector('td:nth-of-type(2)').textContent);
        }

        tickerData = {};

        for (let i = 0; i < properties.length; i++) {
            tickerData[properties[i]] = details[i];
        }

        return tickerData;

    } catch (error) {
        throw error;
    }
}

exports.fetchData = fetchData;