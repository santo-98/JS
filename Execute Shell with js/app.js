const express = require('express');

const app = express()

app.get('/', function(req,res){
  res.sendFile(__dirname+'/views/index.html')
})

app.listen(9000,function(res,req){
  console.log('Running')
})