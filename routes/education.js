const { Router } = require('express')
const { getEducation } = require('../controllers/education')

const router = Router()

router.get('/', getEducation)


module.exports = router