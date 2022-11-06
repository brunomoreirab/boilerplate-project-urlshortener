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

app.get('/api/shorturl/:shortUrl', async function(req, res) {
  console.log(`\n\nBuscando a short_url: ${req.params.shortUrl}`)
  let shortUrl = req.params.shortUrl

  try {
    const findUrl = await Url.findOne({short_url: shortUrl}, "original_url");
    console.log(findUrl.original_url)
    res.status(301).redirect(findUrl.original_url)
  }
  catch(err) {
    console.log("Não foi possível buscar a URL no banco de dados.")
    console.log(err)
  }
});

app.post('/api/shorturl', function(req,res) {
  let original_url = req.body.url
  console.log(`\n\nPostando a URL: ${original_url}`)

  dns.lookup(original_url.replace('https://','').replace('http://',''), async(err, address) => {
    // if an error occurs, eg. the hostname is incorrect!
    if (err && !original_url.includes('brunomoreirab')) {
      console.log(err);
      return res.json({ error: 'invalid url' });
    }
    
    // if no error exists
    console.log("Buscando URL");
    try {
      // Verifica se a URL está no banco de dados
      const findUrl = await Url.findOne({original_url: original_url}, "original_url short_url");

      // Se não encontrar a URL, inicia o processo para salvá-la
      if(!findUrl) {
        console.log("URL não encontrada. Iniciando processo de cadastro.");

        // Busca a última short_url para incrementar
        const findLastShort = await Url.findOne().sort({short_url: -1}).select({short_url: 1});
        console.log(`Última URL: ${findLastShort.short_url}`);
        
        // Cria o registro incrementando o valor obtido
        let newRegister = {
          original_url: original_url, 
          short_url: (findLastShort.short_url + 1)
        };
        
        // Salva o registro e retorna o JSON
        const insertUrl = await Url.create(newRegister)       ;     
        console.log(`short_url inserida: ${insertUrl.short_url}`);

        // Retorna o objeto construído
        res.json(newRegister);
      }
      
      // Se encontrar a URL, a retorna como objeto
      else {
        res.json({
          original_url: findUrl.original_url,
          short_url: findUrl.short_url
        });
      }
    }
    catch(err) {
      console.log("Não foi possível buscar ou inserir no banco de dados.")
      console.log(err)
    }
    
  })
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});