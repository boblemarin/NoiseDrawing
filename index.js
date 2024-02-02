const express = require('express');
const app = express();
const fs = require('fs');
const path = "images/";

app.use(express.json({limit: '50mb'}));
//app.use(express.urlencoded({limit: '50mb'}));

app.use(express.static('www'));

app.post('/', (req, res) => {
   let now = new Date();
   let filename = now.getFullYear()+'-'+doubleDigit(now.getMonth()+1)+'-'+doubleDigit(now.getDate())+'_'+doubleDigit(now.getHours())+'-'+doubleDigit(now.getMinutes())+'-'+doubleDigit(now.getSeconds())+ '.png';
   fs.writeFileSync(path + filename, Buffer.from(req.body.imageData, 'base64'));
   res.status(200).json({ success: true});
});
 
app.listen(3000, () => {
  console.log('Our express server is up on port 3000');
});

function doubleDigit(n) { return n<10?'0'+n:n}