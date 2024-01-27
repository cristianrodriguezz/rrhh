const pool = require('../config/db')

const getLocations = async (req, res) => {

  const client = await pool.connect()

  const query = {
    text: `SELECT location_id, name
    FROM public."Location"`,
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

module.exports = { getLocations }
