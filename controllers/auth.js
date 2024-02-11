const pool = require("../config/db");
const { encrypt, compare } = require("../utils/handlePassword")
const { tokenSign } = require("../utils/handleJwt")
const { validateRegister , validateLogin} = require("../validators/user")



const register = async (req, res) => {
  const result = validateRegister(req.body)
  
  if(result.error) return res.status(400).send({ error: result.error.issues })
  
  
  const { name, lastname, email, password , username} = result.data
  
  const encryptPw = await encrypt(password)
  
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')

    
    const queryRegister = {
      text: `INSERT INTO public."Users"(
        name, lastname, email, password, username)
        overriding system value
        VALUES ( $1, $2, $3, $4, $5) returning name, lastname, email`,
        values: [name,lastname,email,encryptPw, username]
      }
    
      const response = await client.query(queryRegister)
      
    await client.query('COMMIT')
    
    res.send({data: response.rows[0]})
    
  } catch (error) {

    await client.query('ROLLBACK')

    const errors = error.detail.split('(').join(')').split(')')

    if(errors.some(error => error === 'email')){
      res.status(409).json({ error: 'Email en uso, elije otro' })
    }
    if(errors.some(error => error === 'username')){
      res.status(409).json({ error: 'Username en uso, elije otro.' })
    }

    res.status(400).json({ error: error })

  }finally{
    client.release()

  }
}
const login = async (req, res) => {

  const result = validateLogin(req.body)


  if(result.error) return res.status(400).send({ error: result.error.issues })


  const {email, password} = result.data


  const client = await pool.connect()

  try {

    const query = {
      text: `SELECT *
      FROM public."Users"
      where email = $1`,
      values: [email]
    }

    const response = await client.query(query)

    const user = response.rows[0]

    if(!user) return res.status(400).send({error: 'Invalid email. Please register'})


    const hashPassword = user.password
    const check = await compare(password, hashPassword)

    if(!check) return res.status(400).send({error: 'Invalid Password'})

    const userData = {
      email: user.email,
      lastname: user.lastname,
      name: user.name,
      id: user.id,
      username: user.username
    }
    const token = await tokenSign(user)

    const data = {
      token: token,
      user: userData
    }

    res.send({data})

  } catch (error) {

    res.status(409).json({ error: error })
    console.log(error);

  } finally{
    client.release()
  }
}

module.exports = { register, login }