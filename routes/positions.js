const { Router } = require('express')
const { getPositions } = require('../controllers/positions')


const router = Router()

router.get('/', getPositions)


module.exports = router