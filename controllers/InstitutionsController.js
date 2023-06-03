import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import InstitutionsSchema from '../models/InstitutionsSchema.js'
import InstitutionsSettingsSchema from '../models/InstitutionsSettingsSchema.js'
import UserSchema from '../models/UserSchema.js'
import UserSettingsSchema from '../models/UserSettingsSchema.js'
import bcrypt from 'bcrypt'

export const getInstitutions = async (req, res) => {
  try {
    const institution = await InstitutionsSchema.findById(req.params.id).populate('settings').exec()

    const { passwordHash, ...data } = institution._doc

    res.json(data)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати дані :(',
    })
  }
}

export const createInstitutions = async (req, res) => {
  try {
    const errors = validationResult(req)

    // Перевірка
    if (!errors.isEmpty()) {
      res.status(400).json(errors.array())
    }

    // Шифрую пароль
    const password = req.body.password
    const sult = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, sult)

    // Створюю Institution
    const doc = new InstitutionsSchema({
      passwordHash: hash,
      email: req.body.email,
      name: req.body.name,
    })

    const institution = await doc.save()

    // Створюю InstitutionSettings
    const settingsDoc = new InstitutionsSettingsSchema({
      institutionId: institution._doc._id,
    })

    const institutionSettings = await settingsDoc.save()
    /// Створюю User
    const userDoc = new UserSchema({
      name: 'admin',
      access: 'owner',
      passwordHash: hash,
      email: req.body.email,
      institutionId: institution._doc._id,
    })

    const user = await userDoc.save()

    // Створюю UserSettings
    const userSettingsDoc = new UserSettingsSchema({
      userId: user._doc._id,
      institutionId: institution._doc._id,
    })

    const userSettings = await userSettingsDoc.save()

    // Додаю до user, userSettings
    const updatedUser = await UserSchema.findByIdAndUpdate(
      { _id: user._doc._id },
      {
        settings: userSettings._doc._id,
      },
    )

    // Додаю до Institution, InstitutionSettings та members
    const updatedInstitution = await InstitutionsSchema.findByIdAndUpdate(
      { _id: doc._id },
      {
        settings: institutionSettings._doc._id,
        members: [user._doc._id],
      },
    )

    // Створюю токен
    const token = jwt.sign({ _id: institution._id }, process.env.SECRET_KEY || 'secret123', {
      expiresIn: '30d',
      algorithm: 'HS256',
    })

    const { passwordHash, ...data } = updatedInstitution

    res.json({
      ...data._doc,
      members: [user._doc._id],
      settings: institutionSettings._doc,
      token,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Помилка реєстрації :(',
    })
  }
}

export const updateTermsOfStudy = async (req, res) => {
  try {
    await InstitutionsSettingsSchema.findOneAndUpdate(
      { institutionId: req.params.institutionId },
      {
        termsOfStudy: req.body.termsOfStudy,
      },
    )

    res.json(req.body.termsOfStudy)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити терміни навчання',
    })
  }
}

export const updateCurrentShowedYear = async (req, res) => {
  try {
    await InstitutionsSettingsSchema.findOneAndUpdate(
      { institutionId: req.params.institutionId },
      {
        currentShowedYear: req.body.currentShowedYear,
      },
    )

    res.json(req.body.currentShowedYear)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Не вдалось оновити рік' })
  }
}
