const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const fs = require('fs');
const scrapeController = require('./controller/scrape.controller')
const client = require('prom-client');
const _ = require('lodash');

let amexFullTickersRaw = fs.readFileSync('US-Stock-Symbols/amex/amex_full_tickers.json');
let nasdaqFullTickersRaw = fs.readFileSync('US-Stock-Symbols/nasdaq/nasdaq_full_tickers.json');
let nyseFullTickersRaw = fs.readFileSync('US-Stock-Symbols/nyse/nyse_full_tickers.json');

let amexFullTickersJSON = JSON.parse(amexFullTickersRaw)
let nasdaqFullTickersJSON = JSON.parse(nasdaqFullTickersRaw)
let nyseFullTickersJSON = JSON.parse(nyseFullTickersRaw)



const { collectDefaultMetrics } = require('./http-client-with-prom-metrics-tracking');

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


const port = process.env.PORT || 3000;

const router = express.Router();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true }));
// router.use(express.json());



router.post('/api/scrape/run', (req, res, next) => {
    tickersToScrape = []
    req.body.tickers.forEach(ticker => {
        requestedTicker = _.find(tickersWithoutUpSymbol, {"symbol":ticker})
        console.log(JSON.stringify(requestedTicker))
        tickersToScrape.push(requestedTicker)
    })
    return scrapeController.run(tickersToScrape).then(data => res.json(data)); 
})
router.get('/api/scrape/deleteAll', (req, res, next) => {
    console.log(req.body);
    scrapeController.deleteAll().then(data => res.json(data));
});
router.get("/metrics", async (req, res, next) => {
    // res.set("Content-Type", client.register.contentType);

    return res.send(await client.register.metrics());
});

router.get('/api/health', (req, res) => {
    return res.status(200).send('Ok');
});
app.use(router);

app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})