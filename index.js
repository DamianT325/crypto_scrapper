const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

async function getPriceFeed() {
  try {
    const siteUrl = "https://coinmarketcap.com/";

    const { data } = await axios({
      method: "GET",
      url: siteUrl,
    });

    const $ = cheerio.load(data);
    const keys = [
      "rank",
      "name",
      "price",
      "24h",
      "7d",
      "marketCap",
      "volume",
      "circulatingSupply",
    ];

    const coinArr = [];

    const elemSelector =
      "#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div > div.h7vnx2-1.bFzXgL > table > tbody > tr";
    $(elemSelector).each((parentIndex, parentElement) => {
      let keyIndex = 0;
      const coinObj = {};
      if (parentIndex <= 9) {
        $(parentElement)
          .children()
          .each((childIndex, childElement) => {
            let tdValue = $(childElement).text();
            if (keyIndex === 1 || keyIndex === 6) {
              tdValue = $("p:first-child", $(childElement).html()).text();
            }
            if (tdValue) {
              coinObj[keys[keyIndex]] = tdValue;
              keyIndex++;
            }
          });
        coinArr.push(coinObj);
      }
    });
    return coinArr;
  } catch (err) {
    console.error(err);
  }
}

const app = express();

app.get("/api/price-feed", async (req, res) => {
  try {
    const priceFeed = await getPriceFeed();
    return res.status(200).json({
      result: priceFeed,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.listen(3000, () => {
  console.log("running on port 3000");
});
