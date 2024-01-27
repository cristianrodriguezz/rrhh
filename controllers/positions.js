const pool = require('../config/db')

const getPositions = async (req, res) => {

  const client = await pool.connect()

  const query = {
    text: `SELECT current_position_id, current_position
    FROM public."Positions"`,
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

module.exports = { getPositions }
