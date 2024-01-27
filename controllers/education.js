const pool = require('../config/db')

const getEducation = async (req, res) => {

  const client = await pool.connect()

  const query = {
    text: `SELECT education_id, education
    FROM public."Education"`,
    values: []
  }

  try {
    const { rows } = await client.query(query)

    res.send({ data: rows })
    
  } catch (err) {

    res.status(400).send({error: err})

  } finally {

    client.release()

  }
}

module.exports = { getEducation }
