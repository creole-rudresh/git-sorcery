const express = require('express')
const authMiddleware = require('../middleware/auth')
const { db } = require('../db')

const router = express.Router()
router.use(authMiddleware)

module.exports = router
