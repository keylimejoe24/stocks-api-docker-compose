
const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const URL = "https://finance.yahoo.com/quote";
const baseURL = "https://finance.yahoo.com/quote";
const ProxiedRequest = require('../service/request.service');





exports.getData = getData;