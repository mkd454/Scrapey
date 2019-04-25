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

      result.headline = $(this)
        .children("div.text")
        .children("div.title")
        .children("a")
        .text();
      result.link = $(this)
        .children("div.text")
        .children("div.title")
        .children("a")
        .attr("href");
      result.articlePic = $(this)
        .children("div.image")
        .children("a")
        .children("img")
        .attr("src");

      if (result.link[0] === "/") {
        result.link = url + result.link;
      }
      
      // Create new Article in db
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});



module.exports = router;


