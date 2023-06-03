import { body } from 'express-validator'

export const educationPlanGroupCreateValidation = [
  body('name', 'Введіть назву навчального плану').isLength({ min: 3, max: 50 }).isString(),
]

export const educationPlanCreateValidation = [
  body('name', 'Введіть назву навчального плану').isLength({ min: 3, max: 50 }).isString(),
  body('categoryId', 'Не вірний формат категорії').isNumeric(),
]

// export const educationPlanCreateValidation = [
//   body('name', 'Введіть назву навчального плану').isLength({ min: 3, max: 70 }).isString(),
//   body('categoryId', 'Не вірний формат категорії').isNumeric(),
// ]