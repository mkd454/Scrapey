// Require all models
var db = require("../models");
var express = require("express");
var router = express.Router();
var axios = require("axios");
var cheerio = require("cheerio");
require("path");

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
    res.redirect(200,"..");
  });
});

// Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("Note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({}, { $push: { _id: req.params.id }}, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for showing all articles with notes
router.get("/notes", function(req, res) {
  db.Note.find({})
    .then(function(dbNote) {
      res.json(dbNote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for showing specifci article with notes
router.get("/notes/:id", function(req, res) {
  db.Note.find({_id: req.params.id})
    .then(function(dbNote) {
      res.json(dbNote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//////////////////////////////////////////////////
// Routing for handlebars
//////////////////////////////////////////////////

router.get("/", function(req,res) {
  res.render("index", {
    title: "Home Page",
    customcss: "<link rel=\"stylesheet\" type=\"text/css\" href=\"/assets/css/styles.css\"></link>",
    customjs: "<script type=\"text/javascript\" src=\"/assets/js/app.js\"></script>"
  });
});

module.exports = router;


