const { Router } = require('express')
const { getLocations } = require('../controllers/locations')

const router = Router()

router.get('/', getLocations)


module.exports = router