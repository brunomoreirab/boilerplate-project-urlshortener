//Import the Database Connect
const mongoose = require("./config")
//Import the model
const Url = require("./models/url")

const google = {
    "original_url":"https://www.facebook.com",
    "short_url":2
}

const createData = async () => {
    try{
        const createdUrls = await Url.create(google)
        console.log(createdUrls)
    }catch(err){
        console.log(error)
    }
}

//Invoke Function
createData()