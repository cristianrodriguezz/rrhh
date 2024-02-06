const pool = require('../config/db')
const { PutObjectCommand} = require('@aws-sdk/client-s3')
const fs = require('fs')
const { s3Client } = require('../config/aws3')
const { validationResult } = require('express-validator')
const { validateCandidate, validateUserId } = require('../validators/candidate')
const { getCandidatesQuery } = require('../utils/handleQuerys')


const AWS_BUCKET_NAME=process.env.AWS_BUCKET_NAME

async function uploadCandidate (req, res) {

  const errors = validationResult(req)

  if(!errors.isEmpty()) return res.send({error: errors.array()})

  const { user_id } = req.query
  
  const {
    first_name,
    last_name,
    age,
    cuil,
    email,
    phone_number,
    has_own_transport,
    has_work_experience,
    current_position_id,
    education_id,
    availability_id,
    location_id,
  } = req.body

  const upload_date = new Date().toISOString()

  const validation = validateCandidate(req.body)

  if(!validation.success) return res.status(400).send({error: validation.error.errors})
  
  const client = await pool.connect()

  const query = {
    text: `INSERT INTO public."Candidates"(
      first_name, last_name, age, phone_number, has_own_transport, has_work_experience, current_position_id, education_id, availability_id, upload_date, user_id, location_id, cuil, email)
      overriding system value
     VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) returning *`,
     values: [first_name, last_name, age, phone_number, has_own_transport, has_work_experience, current_position_id, education_id, availability_id, upload_date, user_id, location_id, cuil, email]
  }
  
  try {

    await client.query('BEGIN')

    const { rows } = await pool.query(query)

    await client.query('COMMIT')

    res.send(rows)

  } catch (err) {

    await client.query('ROLLBACK')

    let errorUniqueEmail = err?.detail?.includes('email','exists')

    if(errorUniqueEmail) return res.status(409).send({error: 'Email already exists'})

    res.status(400).send({error: err})

  } finally {

    client.release()

  }
}
const uploadCv =  async ( req, res) => {
  
  const errors = validationResult(req)

  if(!errors.isEmpty()) return res.send({error: errors.array()})

  const { user_id, candidate_id } = req.query

  const stream = fs.createReadStream(req.files['cv'].tempFilePath)
  
  const extension = req.files['cv'].mimetype.split('/')[1]

  const generateRandomFileName = () => {
    const randomBigInt = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    return `${user_id}_${randomBigInt}.${extension}`;
  }

  const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: generateRandomFileName(),
      Body: stream,
    })

  const client = await pool.connect()

  const cv = `https://rrhh-recopilacion-de-cv.s3.us-east-2.amazonaws.com/${command.input.Key}`

  const queryInsertCv = {
    text: `INSERT INTO public."Cvs"(
      link, candidate_id)
      overriding system value
      VALUES ($1,$2) returning *`,
    values: [cv, candidate_id]
  }

  try {

    await client.query('BEGIN')

    const { rows } = await pool.query(queryInsertCv)

    const response = await s3Client.send(command);


    await client.query('COMMIT')

    res.send(rows)

  } catch (err) {

    await client.query('ROLLBACK')

    console.log(err);

    res.status(400).send({error: err})

  } finally {

    client.release()

  }

}
const getCandidates = async (req, res) => {
  
  const errors = validationResult(req)


  if(!errors.isEmpty()) return res.send({error: errors.array()})

  const { limit, offset, user_id, q } = req.query

  const client = await pool.connect()

  const { selectQuery, combinedValues, totalPagesQuery, values } = getCandidatesQuery(req.query)


  const query = {
    text: selectQuery,
    values: combinedValues
  }
  const queryPagination = {
    text: totalPagesQuery,
    values
  }


  try {
    const responsePagination  = await client.query(queryPagination)
    console.log(responsePagination.rows);
    const responseData = await client.query(query)


    res.send({ 
      data: responseData.rows,
      totalPages: responsePagination.rows[0].total_pages,
     })
    
  } catch (err) {

    res.status(400).send({error: err})

  } finally {

    client.release()

  }

}



module.exports = { uploadCandidate, uploadCv, getCandidates }

