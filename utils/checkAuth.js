import jwt from 'jsonwebtoken'

export default (req, res, next) => {
  // Отримую токен
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

  if (token) {
    try {
      // Розшифровую токен
      // const decoded = jwt.verify(token, process.env.SECRET_KEY || 'secret123', { algorithms: ['HS256'] })
      const decoded = jwt.decode(token)
      req.userId = decoded._id
      next()

      // Якщо не вдалось розшифрувати токен
    } catch (error) {
      console.log(error)
      return res.status(403).json({
        message: 'Немає доступу',
      })
    }
  } else {
    return res.status(403).json({
      message: 'Немає доступу',
    })
  }
}
