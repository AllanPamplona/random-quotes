if (!global.hasOwnProperty('db')) {
  var mongo = require('mongoose')
  // Coneccion a la base de datos
  let mongoc = mongo.connect(process.env.mongo_connection_string, {useNewUrlParser: true})
  global.db = {
    // Import el framework como objeto
    mongoose: mongoc,
    quote: require('./quote')(mongo),
  }
}
// se exporta la base de datos
module.exports = global.db