import { body } from 'express-validator'

export const registerInstitutionValidation = [
  body('email', 'Не вірний формат пошти').isEmail(),
  body('password', 'Довжина пороля має бути від 6 до 30 символів').isLength({ min: 6, max: 30 }),
  body('name', "Вкажіть ім'я").isLength({ min: 2 }),
]

export const loginUserValidation = [
  body('email', 'Не вірний формат пошти').isEmail(),
  body('password', 'Довжина пороля має бути від 6 до 30 символів').isLength({ min: 6, max: 30 }),
]
