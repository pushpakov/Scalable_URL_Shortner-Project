const urlModel = require('../models/urlModel')
const mongoose = require("mongoose")
const shortid = require('shortid')
const validUrl = require('valid-url')

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

        let uniqueUrl = await urlModel.findOne({ longUrl: output.longUrl }).select({ __v: 0, _id: 0 })
        if (uniqueUrl) {
            return res.status(409).send({ status: true, message: "This url already exists", data: uniqueUrl })
        }

        const savedUrl = await urlModel.create(output)
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

        const urlData = await urlModel.findOne({ urlCode: urlCode })
        if (!urlData) {
            return res.status(404).send({ status: false, message: "This urlCode is Invalid" })
        }
        if (urlData) {
            urlData.clicks++;
            urlData.save();
            return res.status(302).redirect(urlData.longUrl);
        }
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.createShortUrl = createShortUrl
module.exports.redirectUrl = redirectUrl