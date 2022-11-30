const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const stock = require('./stock');
const trendingURL = "https://finance.yahoo.com/trending-tickers";

async function getData() {
    try {
        const response = await axios.get(trendingURL);
        const dom = new JSDOM(response.data);
        const rows = dom.window.document.querySelectorAll('.simpTblRow');

        const details = {};
        for (let row of rows) {
            details[row.children[0].textContent] = await createJSONObject(row);
        }

        return details;

    } catch (error) {
        throw error;
    }
}

async function createJSONObject(row) {
    const data = ["name", "lastPrice", "mktTime", "change", "pctChange", "volume", "mktCap", "uri"];

    const json = {};

    for(let i=0; i<data.length; i++) {
        if(i==data.length-1)
            json[data[i]] = `/ticker/${row.children[0].textContent}`;
        else
            json[data[i]] = row.children[i+1].textContent;
    }
    return json;
}

exports.getData = getData;