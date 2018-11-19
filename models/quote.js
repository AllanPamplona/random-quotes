module.exports = function (mongoose) {
  var Schema = mongoose.Schema
  var quote = new Schema({
    quote: {type: String},
    author: {type: String},
    cat: {type: String},
    image: {type: String}
  })
  var newsSchema = new Schema({
    quote: quote,
    quoteHash: {type: String}
  })

  // Creating the collection model with name and schema
  return mongoose.model("quote", newsSchema)
}

