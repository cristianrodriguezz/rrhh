const pool = require('../config/db')

const getAvailabilities = async (req, res) => {

  const client = await pool.connect()

  const query = {
    text: `SELECT availability_id, availability_schedule
    FROM public."Availability";`,
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

module.exports = { getAvailabilities }
