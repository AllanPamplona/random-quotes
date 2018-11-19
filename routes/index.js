var express = require('express');
var axios = require('axios')
var hash = require('object-hash')
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/v1/generate-changing-life-quote', async (req, res) =>  {
  let result = await getResult()
  let quote = new global.db.quote({quote: result, quoteHash: hash(result)})
  result.id = quote._id
  quote.save((err)=>{
    if(err) throw err;
    res.set('Content-Type', 'text/html');
    res.render('quote', result)
  })
})

router.post('/api/v1/get-quote-by-id', (req, res) => {
  let id = req.body.id
  global.db.quote.findOne({_id: id}).then((doc, err)=>{
    if(err) throw err;
    if(doc!==null){
      let result = doc.quote
      result.id = doc._id
      res.json(result)
    } else {
      res.json({'error': 'The quote wiht that id does not exist.'})
    }
  })
})

router.delete('/api/v1/delete-quote-by-id', (req, res) => {
  let id = req.body.id
  global.db.quote.deleteOne({_id: id}, (err)=>{
    if(err) throw err;
    res.json({status: 'deleted'})
  })
})

const getResult = async () => {
  while(true){
    let quote = await getQuote()
    let pic = await getRelatedPic(quote.data.cat)
    let result = quote.data
    let element = Math.floor(Math.random() * 200);  
    result.image = pic.data.hits[element].webformatURL
    let validation = await getDatabase(hash(result)) 
    if(validation){
      return result
    }
  }

}

const getDatabase = async (hashv) => {
  let validation = await global.db.quote.find({quoteHash: hashv})
  .then((docs, err)=>{
    if(err) throw err;
    if(docs.length === 0){
      return true
    } else {
      return false
    }
  })
  return validation
}

const getQuote = async () => {
  try {
    let quote = await axios.get('https://talaikis.com/api/quotes/random/')
    return quote
  } catch (error) {
    console.error(error)
  }
}

const getRelatedPic = async (category) => {
  let key = process.env.picKey
  try {
    return await axios.get('https://pixabay.com/api/?key='+key+'&q='+category+'&page=1&per_page=200')
  } catch (error) {
    console.error(error)
  }
}

module.exports = router;
