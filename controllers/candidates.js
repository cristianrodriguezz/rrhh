const pool = require('../config/db')
const { PutObjectCommand} = require('@aws-sdk/client-s3')
const fs = require('fs')
const fsremove = require('fs').promises
const path = require('path');
const { s3Client } = require('../config/aws3')
const { validationResult } = require('express-validator')
const { validateCandidate, validateUserId } = require('../validators/candidate')
const { getCandidatesQuery, buildUpdateQuery, buildQuery } = require('../utils/handleQuerys');
const xlsx = require('xlsx');

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
    lenguage_id,
    availability_id,
    location_id,
  } = req.body

  const lenguagueIfExists = lenguage_id === undefined ? null : lenguage_id;

  const upload_date = new Date().toISOString()

  const validation = validateCandidate(req.body)

  if(!validation.success) return res.status(400).send({error: validation.error.errors})
  
  const client = await pool.connect()

  const query = {
    text: `INSERT INTO public."Candidates"(
      first_name, last_name, age, phone_number, has_own_transport, has_work_experience, current_position_id, education_id, availability_id, upload_date, user_id, location_id, cuil, email, lenguage_id)
      overriding system value
     VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning *`,
     values: [first_name, last_name, age, phone_number, has_own_transport, has_work_experience, current_position_id, education_id, availability_id, upload_date, user_id, location_id, cuil, email, lenguagueIfExists]
  }
  
  try {

    await client.query('BEGIN')

    const { rows } = await pool.query(query)

    await client.query('COMMIT')

    res.send(rows[0])

  } catch (err) {

    await client.query('ROLLBACK')

    console.log(err);

    let errorUniqueEmail = err?.detail?.includes('email','exists')
    let errorUniqueCuil = err?.detail?.includes('cuil','exists')

    if(errorUniqueEmail) return res.status(409).send({error: 'Email already exists'})
    if(errorUniqueCuil) return res.status(401).send({error: 'Cuil already exists'})

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


  const FOLDER_TO_REMOVE = 'uploads'


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
    fsremove.readdir(FOLDER_TO_REMOVE)
    .then(files => {
      const unlinkPromises = files.map(file => {
        const filePath = path.join(FOLDER_TO_REMOVE, file)
        return fsremove.unlink(filePath)
      })
  
      return Promise.all(unlinkPromises)
    }).catch(err => {
      console.error(`Something wrong happened removing files of ${FOLDER_TO_REMOVE}`)
    })
  

  }

}
const getCandidates = async (req, res) => {
  
  const errors = validationResult(req)

  if(!errors.isEmpty()) return res.send({error: errors.array()})

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
const deleteCandidateById = async (req, res) => {
  
  const errors = validationResult(req)

  if(!errors.isEmpty()) return res.send({error: errors.array()})

  const client = await pool.connect()

  const { user_id , candidate_id } = req.query

  const queryDeleteCandidate = {
    text: `DELETE FROM public."Candidates"
    WHERE user_id = $1 and candidate_id = $2;`,
    values: [user_id, candidate_id]
  }


  try {

    await client.query('BEGIN')
    
    await client.query(queryDeleteCandidate)
    
    res.send({data: 'Delete successfully'})
    
    await client.query('COMMIT')

  } catch (err) {
    
    res.status(400).send({error: err})
    
  } finally {
    await client.query('ROLLBACK')

    client.release()

  }

}

const updateCandidate = async (req, res) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()) return res.send({error: errors.array()})

  const {user_id, candidate_id } = req.query

  const client = await pool.connect()

  const queryUpdate = buildUpdateQuery(req.body, user_id, candidate_id);

  const querySelectCandidate = {
    text: `SELECT *
    FROM public."Candidates"
    where user_id = $1 and candidate_id = $2`,
    values: [user_id, candidate_id]
  }
  

  try {

    await client.query('BEGIN')

    const responseSelectCandidate = await client.query(querySelectCandidate)

    if(responseSelectCandidate.rowCount === 0) return res.status(400).send({error: "Not found candidate"})

    const response = await client.query(queryUpdate)

    res.send({data: 'Update successfully'})
    
    await client.query('COMMIT')
    
  } catch (error) {

    res.status(400).send({error: error})
    
    
  }finally{

    await client.query('ROLLBACK')

    client.release()
  }
}

const getCvByCandidateId = async (req, res) => {
  
  const errors = validationResult(req)

  if(!errors.isEmpty()) return res.send({error: errors.array()})

  const {candidate_id } = req.query

  const client = await pool.connect()

  const query =  {
    text: `SELECT id, link, candidate_id
    FROM public."Cvs"
    where candidate_id = $1`,
    values: [candidate_id]
  }

  try {

    const { rows } = await client.query(query)

    console.log(rows);

    if(!rows) return res.status(400).send({error: "Not found candidate"})

    res.send({data: rows[0]})
    
  } catch (error) {

    res.status(400).send({error: error})
    
    
  }finally{

    client.release()
  }
}





const getExcelCandidates = async (req, res) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()) return res.send({error: errors.array()})

  const { user_id, candidateIds } = req.query

  const candidatesArray = []

  const client = await pool.connect();

  const candidateArray = candidateIds.split(',')

  candidateArray.forEach(element => candidatesArray.push(parseInt(element)))


  try {

    const query = buildQuery(candidatesArray, user_id);

    const result = await client.query(query);

    // Crear un nuevo libro de Excel
    const workbook = xlsx.utils.book_new();
    const ws_name = "Candidates";
    const ws_data = result.rows;

    // Convertir los datos a un formato adecuado para xlsx
    const ws = xlsx.utils.json_to_sheet(ws_data);

    // Agregar la hoja al libro de Excel
    xlsx.utils.book_append_sheet(workbook, ws, ws_name);

    // Convertir el libro de Excel a un buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Establecer las cabeceras de la respuesta para la descarga del archivo
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="candidates.xlsx"',
      'Content-Length': buffer.length,
    });

    // Enviar el archivo Excel como respuesta
    res.end(buffer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al generar el archivo Excel');
  } finally {
    await client.release();
  }
};

module.exports = {
  getExcelCandidates,
};



module.exports = { uploadCandidate, uploadCv, getCandidates , deleteCandidateById, updateCandidate, getCvByCandidateId, getExcelCandidates}

