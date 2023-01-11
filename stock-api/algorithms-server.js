const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const fs = require('fs');
const cors = require('cors');
const scrapeController = require('./controller/scrape.controller')

let amexFullTickersRaw = fs.readFileSync('US-Stock-Symbols/amex/amex_full_tickers.json');
let nasdaqFullTickersRaw = fs.readFileSync('US-Stock-Symbols/nasdaq/nasdaq_full_tickers.json');
let nyseFullTickersRaw = fs.readFileSync('US-Stock-Symbols/nyse/nyse_full_tickers.json');

let amexFullTickersJSON = JSON.parse(amexFullTickersRaw)
let nasdaqFullTickersJSON = JSON.parse(nasdaqFullTickersRaw)
let nyseFullTickersJSON = JSON.parse(nyseFullTickersRaw)

const tickers = [
    ...amexFullTickersJSON,
    ...nasdaqFullTickersJSON,
    ...nyseFullTickersJSON
]

let tickersWithoutUpSymbol = tickers.filter((t) => {
    return !t.symbol.includes("^")
})

// let tickersByMarketCap = tickersWithoutUpSymbol.sort((a, b) => parseFloat(b.marketCap) - parseFloat(a.marketCap));



const port = process.env.PORT || 3001;
const router = express.Router();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

router.get('/api/algorithms/run/:id', (req, res) => {
    scrapeController.runAlgorithms(req.params.id).then(data => res.json(data));
});

router.get('/api/algorithms/ids', (req, res) => {
    scrapeController.getScrapeIds().then(data => res.json(data));
});

router.get('/api/algorithms/tickers', (req, res, next) => {
    return res.status(200).send(JSON.stringify(tickersWithoutUpSymbol));  
})

router.post('/api/algorithms/create_scrape', (req, res, next) => {
   
    return res.status(200).send('Ok');s
})

router.get('/api/health', (req, res) => {
    return res.status(200).send('Ok');
});


app.use(router);

app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})