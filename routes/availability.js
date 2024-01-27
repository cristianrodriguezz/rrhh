const { Router } = require('express')
const { getAvailabilities } = require('../controllers/availability')

const router = Router()

router.get('/', getAvailabilities)


module.exports = router