const { Router } = require('express')
const { uploadCandidate, uploadCv, getCandidates } = require('../controllers/candidates')
const { validateUploadCv, validateUserId, validateGetCandidatePagination } = require('../validators/candidate')

const router = Router()

router.post('/upload-cv', validateUploadCv, uploadCv)
router.post('/', validateUserId, uploadCandidate)
router.get('/get-candidates', validateGetCandidatePagination, getCandidates)

module.exports = router