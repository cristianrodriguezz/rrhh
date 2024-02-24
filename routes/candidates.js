const { Router } = require('express')
const { uploadCandidate, uploadCv, getCandidates, deleteCandidateById , updateCandidate} = require('../controllers/candidates')
const { validateUploadCv, validateUserId, validateGetCandidatePagination, } = require('../validators/candidate')

const router = Router()

router.post('/upload-cv', validateUploadCv, uploadCv)
router.post('/', validateUserId, uploadCandidate)
router.post('/delete', validateUploadCv, deleteCandidateById)
router.get('/get-candidates', validateGetCandidatePagination, getCandidates)
router.patch('/update',validateUploadCv, updateCandidate)

module.exports = router