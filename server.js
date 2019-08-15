'use strict';

var express = require('express');

var cors = require('cors');

var bodyParser = require('body-parser');

var dns = require('dns')

const urlModule = require('url')

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;


app.use(cors());

var websiteSave = require('./app.js').websiteSave;
var getWebsite = require('./app.js').getWebsite

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl/new",function(req,res){
  var website = req.body.url;
  console.log("request url:",website)
  // validicate the website
  var host = urlModule.parse(website).host
  dns.lookup(host, function(err,address,family){
    if(err){
      console.log("lookup error:",err);
      res.json({"error":"invalid URL"})
    }else{
      console.log('address: %j family: IPv%s', address, family)
      if(!address){
        res.json({"error":"invalid URL"})
      }else{
        websiteSave(website, function(err,data){
          if(err){
            console.log(err);
          }else{
            res.json(data)
          }
        })
      }
    }
  })
})

app.get("/api/shorturl/:short_url",function(req,res){
  getWebsite(req.params.short_url,function(err,data){
    if(err){
      res.end("can not find this short url")
    }else{
      console.log("found this",data)
      res.redirect(301,data.original_url)
    }
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});
