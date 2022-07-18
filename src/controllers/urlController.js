const urlModel = require('../models/urlModel')
const mongoose = require("mongoose")
const shortid = require('shortid')
//const validUrl = require('valid-url')


/*### POST /url/shorten
- Create a short URL for an original url recieved in the request body.
- The baseUrl must be the application's baseUrl. Example if the originalUrl is http://abc.com/user/images/name/2 then the shortened url should be http://localhost:3000/xyz
- Return the shortened unique url. Refer [this](#url-shorten-response) for the response
- Ensure the same response is returned for an original url everytime
- Return HTTP status 400 for an invalid request*/


const createShortUrl = async (req,res) => {
    const originalUrl = req.body. longUrl
    const urlCode = shortid.generate(originalUrl)
    const shortUrl = "http://localhost:3000/"+urlCode

    let output = {}

        output.longUrl = originalUrl,
        output.shortUrl = shortUrl,
        output.urlCode = urlCode

    const savedUrl = await urlModel.create(output)
    return res.status(201).send({status: true, data: savedUrl})   

    
}

module.exports.createShortUrl = createShortUrl