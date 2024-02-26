const { Router } = require('express')
const { uploadCandidate, uploadCv, getCandidates, deleteCandidateById , updateCandidate, getCvByCandidateId} = require('../controllers/candidates')
const { validateUploadCv, validateUserId, validateGetCandidatePagination, validateCandidateId, } = require('../validators/candidate')

const router = Router()

router.post('/upload-cv', validateUploadCv, uploadCv)
router.post('/', validateUserId, uploadCandidate)
router.post('/delete', validateUploadCv, deleteCandidateById)
router.get('/get-candidates', validateGetCandidatePagination, getCandidates)
router.get('/get-cv', validateCandidateId, getCvByCandidateId)
router.patch('/update',validateUploadCv, updateCandidate)

module.exports = router