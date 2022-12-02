const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const fs = require('fs');

const scrapeController = require('./controller/scrape.controller')

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.get('/api/scrape/runAlgorithms/:id', (req, res) => {
    scrapeController.runAlgorithms(req.params.id).then(data => res.json(data));
});
app.get('/', (req, res) => {
    res.status(200).send('Ok');
  });



app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})