var express = require('express');
var axios = require('axios')
var hash = require('object-hash')
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/**
 * End point for generate a new quote.
 * If json = true, it returns a json object.
 * If json = false, it returns a html dom.
 * @param {string} json
 */
router.post('/api/v1/generate-changing-life-quote', async (req, res) =>  {
  let json = req.body.json
  // getResult will return a new quote
  let result = await getResult()
  // the new quote is saved
  let quote = new global.db.quote({quote: result, quoteHash: hash(result)})
  result.id = quote._id
  quote.save((err)=>{
    if(err) throw err;
    if(json==='true'){
      res.json(result)
    } else {
      res.set('Content-Type', 'text/html');
      res.render('quote', result)
    }
  })
})

/**
 * Endpoint for getting the quote with the given id.
 * @param {string} id
 */
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

/**
 * Enpoint for delete a quote by id.
 * @param {string} id 
 */
router.delete('/api/v1/delete-quote-by-id', (req, res) => {
  let id = req.body.id
  global.db.quote.deleteOne({_id: id}, (err)=>{
    if(err) throw err;
    res.json({status: 'deleted'})
  })
})

/**
 * This function build the result json with the quote and the related image.
 * It verifies if there's a quote with the given quote and pic and if exists, it makes another one.
 */
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


/**
 * When a new quote is generated, it is saved with one hash of its contents.
 * This is for verifying if the created quote (text + image) it is in the database.
 * The hash is unique for one quote with its pic.
 * This function verifies if one quotes with the given has exists in the database.
 * @param {string} hashv 
 */
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

/**
 * Make a request to our quote's api generator
 * It returns a json with the given information:
 *  - quote: The generated quote
 *  - author: Its author
 *  - cat: The category
 */
const getQuote = async () => {
  try {
    let quote = await axios.get('https://talaikis.com/api/quotes/random/')
    return quote
  } catch (error) {
    console.error(error)
  }
}

/**
 * Make a request to our image's api with the given category.
 * @param {string} category 
 * 
 * It returns an array of related images
 */
const getRelatedPic = async (category) => {
  let key = process.env.picKey
  try {
    return await axios.get('https://pixabay.com/api/?key='+key+'&q='+category+'&page=1&per_page=200')
  } catch (error) {
    console.error(error)
  }
}

module.exports = router;
