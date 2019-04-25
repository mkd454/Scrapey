// Require all models
var db = require("../models");
var express = require("express");
var router = express.Router();
var axios = require("axios");
var cheerio = require("cheerio");

// Routes

// Scrape from AllKpop
router.get("/scrape", function(req,res) {
  axios.get("https://www.allkpop.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    var url = "https://www.allkpop.com/";

    $("div.width95").each(function(i,elem) {
      var result = {};

      result.title = $(this)
        .children("div.text")
        .children("div.title")
        .children("a")
        .text();
      result.link = $(this)
        .children("div.text")
        .children("div.title")
        .children("a")
        .attr("href");

      if (result.link[0] === "/") {
        result.link = url + result.link;
      }
      console.log(result);
    })
  })
})



module.exports = router;


