const { query } = require('express-validator');
const { z } = require('zod');

const validateUploadCv = [
  query('user_id').isInt().withMessage('UserId must be a valid integer.'),
  query('candidate_id').isInt().withMessage('Candidate_id must be a valid integer.')
]
const validateCandidateId = [
  query('candidate_id').isInt().withMessage('Candidate_id must be a valid integer.')
]
const validateUserId = [
  query('user_id').isInt().withMessage('UserId must be a valid integer.'),
]
const validateGetCandidatePagination = [
  query('user_id').isInt().withMessage('UserId must be a valid integer.'),
  query('limit').isInt().withMessage('Limit must be a valid integer.'),

  query('q').isString().withMessage('Q must be a valid string.'),
]
const candidateSchema = z.object({
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  age: z.string().datetime(),
  phone_number: z.number().int().positive(),
  cuil: z.number().int().positive(),
  has_own_transport: z.boolean(),
  has_work_experience: z.boolean(),
  current_position_id: z.number().max(100).int().positive(),
  education_id: z.number().int().positive(),
  availability_id: z.number().int().positive(),
  lenguage_id:  z.number().nullable().optional(),
  email: z.string().max(40),
  upload_date: z.string().refine((date) => Date.parse(date) > 0 || date === null, {
    message: "Invalid date format",
  }).default(() => new Date().toISOString()),
});

function validateCandidate (object) {
  return candidateSchema.safeParse(object)
}

module.exports = { validateUploadCv , validateUserId , validateGetCandidatePagination , validateCandidate, validateCandidateId}