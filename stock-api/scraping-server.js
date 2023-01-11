const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const fs = require('fs');
const scrapeController = require('./controller/scrape.controller')
const client = require('prom-client');
const _ = require('lodash');
const logger = require('./logger/api.logger');
const cors = require('cors');

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
const http = require('http').Server(app);
const socketIO = require('socket.io')(http,  { cors: { origin: '*' } });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({origin:true,credentials: true}));

// const socketIO = require("socket.io")(httpServer, {
//     allowRequest: (req, callback) => {
//       const noOriginHeader = req.headers.origin === undefined;
//       callback(null, noOriginHeader);
//     }
//   });


socketIO.on("connection", (socket) => {
	console.log(`⚡: ${socket.id} user just connected!`);

	// socket.on("runScrape", (tickers) => {
		
	// 	socket.emit("runnning", todoList);
	// });

	// socket.on("viewComments", (id) => {
	// 	for (let i = 0; i < todoList.length; i++) {
	// 		if (id === todoList[i].id) {
	// 			socket.emit("commentsReceived", todoList[i]);
	// 		}
	// 	}
	// });
	// socket.on("updateComment", (data) => {
	// 	const { user, todoID, comment } = data;
	// 	for (let i = 0; i < todoList.length; i++) {
	// 		if (todoID === todoList[i].id) {
	// 			todoList[i].comments.push({ name: user, text: comment });
	// 			socket.emit("commentsReceived", todoList[i]);
	// 		}
	// 	}
	// });

	// socket.on("deleteTodo", (id) => {
	// 	todoList = todoList.filter((todo) => todo.id !== id);
	// 	socket.emit("todos", todoList);
	// 	// sendNotification("<TEMPLATE_ID>");
	// });

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
    return scrapeController.run(req.body.tickersToScrape,req.body.scrapeID,socketIO).then(data => res.json(data)); 
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

http.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})
