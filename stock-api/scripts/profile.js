const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const baseURL = "https://finance.yahoo.com/quote";

async function getData(ticker) {
    try {
        const response = await axios.get(`${baseURL}/${ticker}/profile?p=${ticker}`);
        const dom = new JSDOM(response.data);

        const data = ["name", "currentPrice", "change", "pctChange", "remark", "contact", "sector", "industry", "employees", "description", "keyExecs", "corporateGovern"]

        const details = [];

        const name = dom.window.document.querySelector("#quote-header-info > div.Mt\\(15px\\).D\\(f\\).Pos\\(r\\) > div.D\\(ib\\).Mt\\(-5px\\).Maw\\(38\\%\\)--tab768.Maw\\(38\\%\\).Mend\\(10px\\).Ov\\(h\\).smartphone_Maw\\(85\\%\\).smartphone_Mend\\(0px\\) > div.D\\(ib\\) > h1").textContent;

        details.push(name);

        const realtime = dom.window.document.querySelector("#quote-header-info > div.My\\(6px\\).Pos\\(r\\).smartphone_Mt\\(6px\\).W\\(100\\%\\) > div.D\\(ib\\).Va\\(m\\).Maw\\(65\\%\\).Ov\\(h\\) > div");

        details.push(realtime.children[0].textContent);
        details.push(realtime.children[1].textContent);
        details.push(realtime.children[2].textContent.replace(/[()]/g, ''));
        details.push(realtime.children[5].textContent.replace(/\s{2,}/g, ' '));

        const contact = dom.window.document.querySelector("#Col1-0-Profile-Proxy > section > div.asset-profile-container > div > div > p.D\\(ib\\).W\\(47\\.727\\%\\).Pend\\(40px\\)");
        const contactLength = contact.children.length;

        const contactDetails = [];
        
        const addressText = contact.innerHTML.split("<br>");
        
        for (let i = 0; i < addressText.length; i++) {
            if(i==addressText.length-1) {
                contactDetails.push(contact.children[contactLength-1].textContent);
            } else if(i==addressText.length-2) {
                contactDetails.push(contact.children[contactLength-3].textContent);
            } else {
                contactDetails.push(addressText[i]);
            }
        }
        details.push(contactDetails);

        const sector = dom.window.document.querySelector("#Col1-0-Profile-Proxy > section > div.asset-profile-container > div > div > p.D\\(ib\\).Va\\(t\\) > span:nth-child(2)").textContent;
        details.push(sector);

        const industry = dom.window.document.querySelector("#Col1-0-Profile-Proxy > section > div.asset-profile-container > div > div > p.D\\(ib\\).Va\\(t\\) > span:nth-child(5)").textContent;
        details.push(industry);

        const employees = dom.window.document.querySelector("#Col1-0-Profile-Proxy > section > div.asset-profile-container > div > div > p.D\\(ib\\).Va\\(t\\) > span:nth-child(8)").textContent;
        details.push(employees);

        const description = dom.window.document.querySelector("#Col1-0-Profile-Proxy > section > section.quote-sub-section.Mt\\(30px\\) > p").textContent;
        details.push(description);

        const keyExecs = dom.window.document.querySelector("#Col1-0-Profile-Proxy > section > section.Bxz\\(bb\\).quote-subsection.undefined > table > tbody").children;
        
        const keyExecArray = [];
        const keyExecTitles = ["name", "title", "pay", "exercised", "birthYear"];

        for(let key of keyExecs) {
            let temp = {};
            for(let i = 0; i < key.children.length; i++) {
                temp[keyExecTitles[i]] = key.children[i].textContent;
            }
            keyExecArray.push(temp);
        }
        details.push(keyExecArray);

        const corporateGovern = dom.window.document.querySelector("#Col1-0-Profile-Proxy > section > section.Mt\\(30px\\).corporate-governance-container > div").textContent.replace(/\s{2,}/g, ' ');
        details.push(corporateGovern);

        const fetchedData = {};
        for(let i = 0; i < data.length; i++) {
            fetchedData[data[i]] = details[i];
        }

        return fetchedData;

    } catch (err) {
        console.log(err);
    }
}

exports.getData = getData;