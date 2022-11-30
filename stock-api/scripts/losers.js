const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const URL = "https://finance.yahoo.com/losers";

async function getData() {
    try {
        const response = await axios.get(URL);
        const dom = new JSDOM(response.data);

        const totalStocks = dom.window.document.querySelector("#fin-scr-res-table > div.W\\(100\\%\\) > div.D\\(ib\\).Fz\\(m\\).Fw\\(b\\).Lh\\(23px\\).W\\(75\\%\\)--mobp > span.Mstart\\(15px\\).Fw\\(500\\).Fz\\(s\\) > span");

        const count = parseInt(totalStocks.textContent.slice(7));

        const newResponse = await axios.get(`${URL}?count=${count}`);
        const newDom = new JSDOM(newResponse.data);

        const rows = newDom.window.document.querySelector("#scr-res-table > div.Ovx\\(a\\).Ovx\\(h\\)--print.Ovy\\(h\\).W\\(100\\%\\) > table > tbody");

        const details = {};

        for (let row of rows.children) {
            details[row.children[0].textContent] = await createJSONObject(row);
        }

        return details;

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