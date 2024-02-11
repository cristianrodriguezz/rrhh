const pool = require('../config/db')

const getLenguage = async (req, res) => {

  const client = await pool.connect()

  const query = {
    text: `SELECT lenguage_id, lenguage
    FROM public."Lenguage"`,
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

module.exports = { getLenguage }
