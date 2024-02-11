const pool = require('../config/db');
const allowedRoutes = require('./allowedRoutes');
const { verifyToken } = require('../utils/handleJwt')

const authMiddleware = async (req, res, next) => {

  const path = req.originalUrl

  if (allowedRoutes.includes(path.split('?')[0])) return next();

  try {

    if (!req.headers.authorization) {
      res.status(401).send('NEED_SESSION')
      return
    }

    const token = req.headers.authorization.split(' ').pop()
    const dataToken = await verifyToken(token)

    if (!dataToken) {
      res.status(401).send('NOT_PAYLOAD_DATA')
      return
    }

    next()
  } catch (e) {

    res.status(401).send('NOT_SESSION')

  } 
}

module.exports = authMiddleware