require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const dns = require('dns')
const app = express();

//Import the Database Connect
const mongoose = require("./config")
//Import the model
const Url = require("./models/url")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req,res) {
  let original_url = req.body.url
  console.log(`POST: ${original_url}`)
  original_url = original_url.replace('https://','');
  original_url = original_url.replace('http://','');

  dns.lookup(original_url, (error, address, family) => {
    // if an error occurs, eg. the hostname is incorrect!
    if (error) {
      console.log(error);
      res.json({ error: 'invalid url' });
    }
    else {
      console.log("Buscando URL")
      // if no error exists
      Url.findOne({original_url: original_url}, "original_url short_url", (err, doc) =>{
        if(err) {
          res.json({error: 'Não foi possível acessar o banco de dados'});
        }

        if(doc === null) {
          console.log("Inserindo registro")
          Url.findOne()
          .sort({short_url: -1})
          .select({short_url: 1})
          .exec((err, short_url_obj) => {
            if(err) {
              console.log("Não foi possível encontrar a última short_url");
            }
            else {
              console.log(`Última short_url: ${short_url_obj.short_url}`)
              let new_register = {original_url: original_url, short_url: (short_url_obj.short_url + 1)}
              const createData = async () => {
                try{
                    const createdUrls = await Url.create(new_register)
                    console.log(createdUrls)
                    res.json({original_url: "https://" + new_register.original_url, short_url: new_register.short_url})
                }catch(err){
                    console.log(error)
                }
              }
              createData();
            }
          })
        }

        else {
          res.json({
            original_url: "https://" + doc.original_url,
            short_url: doc.short_url
          })
        }
      });
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});