const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const URL = "https://finance.yahoo.com/etfs?count=250";

async function getData() {
    try {
        const response = await axios.get(URL);
        const dom = new JSDOM(response.data);

        const rows = dom.window.document.querySelector("#scr-res-table > div.Ovx\\(a\\).Ovx\\(h\\)--print.Ovy\\(h\\).W\\(100\\%\\) > table > tbody");

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
    const data = ["name", "price", "change", "pctChange", "volume", "avgDay50", "avgDay200" , "uri"];

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