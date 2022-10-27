  // Pull Schema and model from mongoose
  const {Schema, model} = require("mongoose")

  //CREATE DOG SCHEMA
  const urlSchema = new Schema({
      original_url: {type: String, required: true},
      short_url: {type: Number, required: true}
  })
  
  //Create Model Object, specify collection and schema
  const Url = model('url', urlSchema)
  
  //Export Model
  module.exports =  Url