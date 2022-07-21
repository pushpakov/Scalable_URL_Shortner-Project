const urlModel = require('../models/urlModel')
const mongoose = require("mongoose")
const shortid = require('shortid')
const validUrl = require('valid-url')
const redis = require("redis");
const {promisify} = require("util");

/*######################################### Validation Function ###########################################*/

const isValid = (value) => {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) false
    else {
        return true
    }
}

const url_valid = function (url) {
    let regex = /^https?:\/\/.*\/.*\.\??.*$/gmi
    return regex.test(url)
}




//Connect to redis
const redisClient = redis.createClient(
    15518,
    "redis-15518.c264.ap-south-1-1.ec2.cloud.redislabs.com",   
    { no_ready_check: true }
  );
  redisClient.auth("8kxq0Xve9aJm5HMOPcE6iVT3iRsPECB1", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  
  
  
  //1. connect to the server
  //2. use the commands :
  
  //Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


/*######################################### POST /url/shorten ###########################################*/

const createShortUrl = async (req, res) => {
    try {
        const originalUrl = req.body.longUrl

        if (Object.keys(originalUrl).length == 0) {
            return res
                .status(400)
                .send({ status: false, message: "Please Provide Required Url" });
        }

        if (!isValid(originalUrl)) {
            return res.status(400).send({ status: false, message: "User need to provide Url" })
        }


        const urlCode = shortid.generate()

        const shortUrl = "http://localhost:3000/" + urlCode

        let output = {}

        output.longUrl = originalUrl
            .trim()
            .split(" ")
            .filter((word) => word)
            .join(""),
            output.shortUrl = shortUrl,
            output.urlCode = urlCode.trim().toLowerCase()

            

        if (!validUrl.isUri(output.longUrl) && !url_valid(output.longUrl)) {
            return res.status(400).send({ status: false, message: "Provided Url is invalid" })
        }

        const cahcedUrl = await GET_ASYNC(`${output.longUrl}`)
        if (cahcedUrl) {
            let urlData = JSON.parse(cahcedUrl)

            return res.status(201).send({ status: true, message: "This url already exists in cache memory", data: urlData })
        }

        let uniqueUrl = await urlModel.findOne({ longUrl: output.longUrl }).select({ __v: 0, _id: 0 })
        if (uniqueUrl) {
            await SET_ASYNC(`${uniqueUrl.longUrl}`, JSON.stringify({uniqueUrl}))
            return res.status(201).send({ status: true, message: "This url already exists", data: uniqueUrl })
        }

        const savedUrl = await urlModel.create(output) 

        await SET_ASYNC(`${output.longUrl}`, JSON.stringify({output}))

        let saved = {
            longUrl: savedUrl.longUrl,
            shortUrl: savedUrl.shortUrl,
            urlCode: savedUrl.urlCode
        }
       
            return res.status(201).send({ status: true, data: saved })
        
        
    }

    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}


/*######################################### GET /:urlCode ###########################################*/

const redirectUrl = async (req, res) => {
    try {
        let urlCode = req.params.urlCode

        const cahcedUrl = await GET_ASYNC(`${urlCode}`)
        if (cahcedUrl) {
            let urlData = JSON.parse(cahcedUrl)

            return res.status(302).redirect(urlData.longUrl)
        } else {
            const profile = await urlModel.findOne({ urlCode: urlCode });

            if(!profile){
                return res.status(404).send({ status: false, message: "This urlCode is Invalid" })
            }
            if (profile) {
                
                await SET_ASYNC(`${urlCode}`, JSON.stringify(profile))
                res.status(302).redirect(profile.longUrl);
            }
        }
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.createShortUrl = createShortUrl
module.exports.redirectUrl = redirectUrl