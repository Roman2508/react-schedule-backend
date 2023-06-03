import jwt from 'jsonwebtoken'
import UserSchema from '../models/UserSchema.js'
import UserSettingsSchema from '../models/UserSettingsSchema.js'
import bcrypt from 'bcrypt'

export const loginUser = async (req, res) => {
  try {
    // Пошук користувача в базі
    const user = await UserSchema.findOne({ email: req.body.email }).populate('settings').exec()

    if (!user) {
      return res.status(404).json({
        message: 'Користувач не знайдений',
      })
    }

    // Перевірка паролю
    const isValidPassword = await bcrypt.compare(req.body.password, user._doc.passwordHash)

    if (!isValidPassword) {
      return res.status(400).json({
        message: 'Невірний логін або пароль',
      })
    }

    const token = jwt.sign({ _id: user._id }, 'secret13', { expiresIn: '30d' })

    const { passwordHash, ...userData } = user._doc

    res.json({
      ...userData,
      token,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось авторизуватись',
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await UserSchema.findById(req.userId).populate('settings').exec()

    if (!user) {
      res.status(404).json({
        message: 'Користувач не знайдений',
      })

      return
    }

    const { passwordHash, ...userData } = user._doc

    res.json(userData)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Немає доступу' })
  }
}

export const updateColorSettings = async (req, res) => {
  try {
    await UserSettingsSchema.findOneAndUpdate(
      { userId: req.params.userId },
      {
        colors: req.body,
      },
    )

    res.json(req.body)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Не вдалось оновити кольори занять' })
  }
}

export const updateSelectedSemester = async (req, res) => {
  try {
    const userSettings = await UserSettingsSchema.findOneAndUpdate(
      { userId: req.params.userId },
      { selectedSemester: req.body.selectedSemester },
      { new: true },
    )

    res.json({ selectedSemester: userSettings.selectedSemester })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Не вдалось оновити семестр' })
  }
}
