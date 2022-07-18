const express = require("express");
const router = express.Router();
const {createShortUrl, redirectUrl} = require('../controllers/urlController')


router.post("/url/shorten", createShortUrl)
router.get("/:urlCode", redirectUrl)



module.exports = router



