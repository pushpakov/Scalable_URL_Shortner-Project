const express = require("express");
const router = express.Router();
const {createShortUrl, redirectUrl} = require('../controllers/urlController')


router.post("/url/shorten", createShortUrl)
router.get("/:urlCode", redirectUrl)

router.all("/*", function (req, res){
    res.status(404).send({status :false, message: "URL not found."})
})


module.exports = router



