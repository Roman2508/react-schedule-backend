import DepartmentsSchema from '../models/DepartmentsSchema.js'

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await DepartmentsSchema.find({ institutionId: req.params.institutionId })
      .populate('teachers')
      .exec()

    res.json(departments)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати структурні підрозділи',
    })
  }
}

export const createDepartment = async (req, res) => {
  try {
    const doc = new DepartmentsSchema({
      name: req.body.name,
      departmentNumber: req.body.departmentNumber,
      institutionId: req.body.institutionId,
    })

    const department = await doc.save()

    res.json(department)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось створити структурний підрозділ',
    })
  }
}

export const updateDepartment = async (req, res) => {
  try {
    await DepartmentsSchema.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
        departmentNumber: req.body.departmentNumber,
      },
    )

    const newDepartment = await DepartmentsSchema.findById(req.params.id)

    res.json(newDepartment)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити структурний підрозділ',
    })
  }
}

export const removeDepartment = async (req, res) => {
  try {
    DepartmentsSchema.findOneAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити структурний підрозділ',
        })
        return
      }
      if (!doc) {
        return res.status(404).json({
          message: 'Не вдалось знайти структурний підрозділ',
        })
      }

      res.json({
        id: req.params.id,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалит структурний підрозділ',
    })
  }
}
