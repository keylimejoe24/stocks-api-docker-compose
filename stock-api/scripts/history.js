const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const yahooFinance = require("yahoo-finance");
const URL = "https://finance.yahoo.com/quote";
const baseURL = "https://finance.yahoo.com/quote";


async function getData(ticker) {
    try {
        
        let quotes = await yahooFinance.historical({
            symbol: ticker,
          }, function (err, quotes) {
            return quotes
          });
        
       return quotes.slice(0,4).map(q => {
        return q.close   
       })
          
    } catch (error) {
        throw error;
    }
}

async function createJSONObject(row) {
    const data = ["name", "price", "change", "pctChange", "volume", "avgVol", "mktCap", "PE", "uri"];

    const json = {};

    for (let i = 0; i < data.length; i++) {
        if (i == data.length - 1)
            json[data[i]] = `/ticker/${row.children[0].textContent}`;
        else
            json[data[i]] = row.children[i + 1].textContent;
    }

    return json;
}

exports.getData = getData;