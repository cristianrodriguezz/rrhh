const { Router } = require('express')
const { uploadCandidate, uploadCv, getCandidates } = require('../controllers/candidates')
const { validateUploadCv, validateUserId } = require('../validators/candidate')

const router = Router()

router.post('/upload-cv', validateUploadCv, uploadCv)
router.post('/', validateUserId, uploadCandidate)
router.get('/get-candidates', validateUserId, getCandidates)

module.exports = router