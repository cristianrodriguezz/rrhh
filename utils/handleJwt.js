const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET

const tokenSign = async (user) => {

  const sign = jwt.sign(
    {
      id: user.id
    },
    JWT_SECRET,
    {
      expiresIn: '8h'
    }
  )

  return sign
}
const verifyToken = async (tokenJwt) => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET)
  } catch (e) {
    return null
  }
}


module.exports = { tokenSign, verifyToken }
