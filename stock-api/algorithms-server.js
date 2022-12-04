const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const fs = require('fs');

const scrapeController = require('./controller/scrape.controller')

const port = process.env.PORT || 3001;
const router = express.Router();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


router.get('/api/scrape/runAlgorithms/:id', (req, res) => {
    scrapeController.runAlgorithms(req.params.id).then(data => res.json(data));
});

router.get('/api/health', (req, res) => {
    return res.status(200).send('Ok');
});

app.use(router);

app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})