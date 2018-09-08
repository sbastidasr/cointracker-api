"use strict";

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const moment = require("moment");
const fetch = require("node-fetch");

const app = express();

app.use(morgan("common"));
app.use(express.json());
app.use(express.static("public"));

let TOKEN = process.env.token;

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  if (req.method === "OPTIONS") {
    return res.send(204);
  }
  next();
});

let options = {
  btcusd: [
    "binance:btcusdt",
    "gdax:btcusd",
    "bitfinex:btcusd",
    "bitstamp:btcusd",
    "poloniex:btcusdt"
  ],
  ethusd: [
    "binance:ethusdt",
    "bitstamp:ethusd",
    "gdax:ethusd",
    "bitfinex:ethusd",
    "poloniex:ethusdt"
  ],
  ltcusd: [
    "binance:ltcusdt",
    "gdax:ltcusd",
    "bitstamp:ltcusd",
    "bitfinex:ltcusd",
    "poloniex:ltcusdt"
  ]
};

app.get("/data/:currencyChoice", (req, res) => {
  let results = [];
  options[req.params.currencyChoice].forEach(symbol => {
    fetch("https://coinograph.io/ticker/?symbol=" + symbol, {
      headers: {
        Authorization: "Token " + TOKEN
      }
    })
      .then(res => res.json())
      .then(data => {
        results.push(data);
        if (results.length === options.btcusd.length) {
          res.json(results);
        }
      })
      .catch(err => console.error(err));
  });
});

// app.get("/data", (req, res) => {
//   const symbol = "binance:btcusdt";
//   fetch("https://coinograph.io/ticker/?symbol=" + symbol, {
//     headers: { Authorization: "Token fb5499d2f5cc9b01b6e80864abe8be92fbebdd7f" }
//   })
//     .then(res => res.json())
//     .then(json => console.log(json))
//     .catch(err => console.error(err));
//
//   res.json("hi");
// });

// start server
let server;

function runServer(DATABASE_URL, port = 8080) {
  return new Promise((resolve, reject) => {
    server = app
      .listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on("error", err => {
        mongoose.disconnect();
        reject(err);
      });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log("Closing server");
    server.close(err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
