const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const fs = require('fs');
const scrapeController = require('./controller/scrape.controller')
const client = require('prom-client');
const _ = require('lodash');
const logger = require('./logger/api.logger');
const cors = require('cors');
const constants = require('./constants.js');

const { MetricsTracker } = require('nodejs-metrics');

let amexFullTickersRaw = fs.readFileSync('US-Stock-Symbols/amex/amex_full_tickers.json');
let nasdaqFullTickersRaw = fs.readFileSync('US-Stock-Symbols/nasdaq/nasdaq_full_tickers.json');
let nyseFullTickersRaw = fs.readFileSync('US-Stock-Symbols/nyse/nyse_full_tickers.json');

let amexFullTickersJSON = JSON.parse(amexFullTickersRaw)
let nasdaqFullTickersJSON = JSON.parse(nasdaqFullTickersRaw)
let nyseFullTickersJSON = JSON.parse(nyseFullTickersRaw)



let metricsTracker = null;

const register = new client.Registry()

register.setDefaultLabels({
    app: 'stock-api'
})


const externalHttpRequestDurationLabels = [constants.Metrics.Labels.Target, constants.Metrics.Labels.Method, constants.Metrics.Labels.StatusCode, constants.Metrics.Labels.Error];
metricsTracker = new MetricsTracker({
    metrics: {
        [constants.Metrics.ExternalHttpRequestDurationSeconds]: new client.Histogram({
            name: constants.Metrics.ExternalHttpRequestDurationSeconds,
            help: `duration histogram of http responses labeled with: ${externalHttpRequestDurationLabels.join(', ')}`,
            labelNames: externalHttpRequestDurationLabels,
            buckets: constants.Metrics.HistogramValues.Buckets
        })
    }
});

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
const http = require('http').Server(app);
const socketIO = require('socket.io')(http,  { cors: { origin: '*' } });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

socketIO.on("connection", (socket) => {
	console.log(`⚡: ${socket.id} user just connected!`);

	socket.on("disconnect", () => {
		socket.disconnect();
		console.log("🔥: A user disconnected");
	});
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

router.post('/api/scrape/run', (req, res, next) => {
    let tickers = req.body.tickers
    let id = req.body.scrapeID
    // scrapeController.run(tickers,id,socketIO);  metricsTracker
    scrapeController.run(tickers,id,metricsTracker); 
    return res.status(200).send({ok:"ok"});
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
    return res.status(200).send({ok:"ok"});
});
app.use(router);

http.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})
