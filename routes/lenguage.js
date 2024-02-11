const { Router } = require('express')
const { getLenguage } = require('../controllers/lenguage')


const router = Router()

router.get('/', getLenguage)


module.exports = router