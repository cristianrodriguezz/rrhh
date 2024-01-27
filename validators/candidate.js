const { query } = require('express-validator');
const { z } = require('zod');

const validateUploadCv = [
  query('user_id').isInt().withMessage('UserId must be a valid integer.'),
  query('candidate_id').isInt().withMessage('UserId must be a valid integer.')
]
const validateUserId = [
  query('user_id').isInt().withMessage('UserId must be a valid integer.'),
]
const candidateSchema = z.object({
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  age: z.number().max(100).int().positive(),
  phone_number: z.string().min(1).max(20),
  has_own_transport: z.boolean(),
  has_work_experience: z.boolean(),
  current_position_id: z.number().max(100).int().positive(),
  education_id: z.number().int().positive(),
  availability_id: z.number().int().positive(),
  location_id: z.number().int().positive(),
  upload_date: z.string().refine((date) => Date.parse(date) > 0 || date === null, {
    message: "Invalid date format",
  }).default(() => new Date().toISOString()),
});

function validateCandidate (object) {
  return candidateSchema.safeParse(object)
}

module.exports = { validateUploadCv , validateUserId , validateCandidate}