'use strict';
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.DB);

var Schema = mongoose.Schema;
var WebsiteSchema = Schema({
  "original_url":String,"short_url":Number
})
var CounterSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
CounterSchema.index({_id:1, seq:1}, {unique:true})

var counter = mongoose.model('counter', CounterSchema);

WebsiteSchema.pre('save', function(next){
  console.log("call save pre middleware")
  var self = this;
  counter.findByIdAndUpdate(
    {_id: 'entityId'},
    {$inc:{seq:1}},
    {new:true,upsert:true},
    function(err,data){
      if(err){
        console.log("find counter error:",err)
        return next(err)
      }
      console.log("counter:",data)
      self.short_url = data.seq;
      next();
    }
  ).catch(function(error) {
      console.error("counter error-> : "+error);
      throw error;
  });
})

// model
var Website = mongoose.model('Website', WebsiteSchema);

var websiteSave = function(url, callback){
  Website.find({"original_url":url},function(err,data){
    if(data.length==0){
      //Website.create({ "original_url": url },callback)
      var newWeb = new Website({ "original_url": url })
      newWeb.save(callback)
    }else{
      console.log(url,'already exists')
      callback(null,data)
    }
  }) 
}

var getWebsite = function(short_url,callback){
  Website.findOne({"short_url":short_url},callback)
}

exports.websiteSave = websiteSave;
exports.getWebsite = getWebsite;
