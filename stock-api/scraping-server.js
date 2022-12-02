const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const fs = require('fs');
const scrapeController = require('./controller/scrape.controller')
const client = require('prom-client');

let amexFullTickersRaw = fs.readFileSync('US-Stock-Symbols/amex/amex_full_tickers.json');
let nasdaqFullTickersRaw = fs.readFileSync('US-Stock-Symbols/nasdaq/nasdaq_full_tickers.json');
let nyseFullTickersRaw = fs.readFileSync('US-Stock-Symbols/nyse/nyse_full_tickers.json');

let amexFullTickersJSON = JSON.parse(amexFullTickersRaw)
let nasdaqFullTickersJSON = JSON.parse(nasdaqFullTickersRaw)
let nyseFullTickersJSON = JSON.parse(nyseFullTickersRaw)
const {collectDefaultMetrics} = require('./http-client-with-prom-metrics-tracking');
const register = new client.Registry()

register.setDefaultLabels({
    app: 'stock-api'
  })
collectDefaultMetrics(client);

const tickers = [
    ...amexFullTickersJSON,
    ...nasdaqFullTickersJSON,
    ...nyseFullTickersJSON
  ]

let tickersWithoutUpSymbol = tickers.filter((t) => {
    return !t.symbol.includes("^")
})

let tickersByMarketCap = tickersWithoutUpSymbol.sort((a, b) => parseFloat(b.marketCap) - parseFloat(a.marketCap));


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/api/scrape/run', (req, res) => {
    console.log(req.body);
    scrapeController.run(tickersByMarketCap).then(data => res.json(data));
});

app.get('/api/scrape/deleteAll', (req, res) => {
    console.log(req.body);
    scrapeController.deleteAll().then(data => res.json(data));
});

app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})
app.get("/metrics", async (req, res) => {
    // res.set("Content-Type", client.register.contentType);

    return res.send(await client.register.metrics());
});
app.get('/', (req, res) => {
    res.status(200).send('Ok');
});