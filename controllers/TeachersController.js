import TeachersSchema from '../models/TeachersSchema.js'
import DepartmentsSchema from '../models/DepartmentsSchema.js'

export const createTeacher = async (req, res) => {
  try {
    const doc = new TeachersSchema({
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      formOfWork: req.body.formOfWork,
      departmentId: req.body.departmentId,
      institutionId: req.body.institutionId,
    })

    const department = await DepartmentsSchema.findOne({ _id: doc.departmentId })

    if (department) {
      department.teachers.push(doc._id)
      await department.save()
    } else {
      res.status(500).json({
        message: 'some error',
      })
      return
    }

    const teacher = await doc.save()

    res.json(teacher)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось створити викладача',
    })
  }
}

export const updateTeacher = async (req, res) => {
  try {
    const oldTeacher = await TeachersSchema.findById(req.params.id)

    const { lastName, middleName, firstName, formOfWork, departmentId } = req.body

    await TeachersSchema.updateOne(
      { _id: req.params.id },
      {
        lastName,
        middleName,
        firstName,
        formOfWork,
        departmentId,
      },
    )

    const newTeacher = await TeachersSchema.findById(req.params.id)

    if (String(oldTeacher.departmentId) !== String(departmentId)) {
      const department = await DepartmentsSchema.findOne({ _id: oldTeacher.departmentId })

      const newTeachers = department.teachers.filter((el) => String(el._id) !== String(oldTeacher._id))

      department.teachers = newTeachers

      await department.save()

      const newDepartments = await DepartmentsSchema.findOne({ _id: departmentId })

      if (newDepartments) {
        newDepartments.teachers.push(req.params.id)
        await newDepartments.save()
      } else {
        res.status(500).json({
          message: 'some error',
        })
        return
      }
    }

    res.json(newTeacher)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити викладача',
    })
  }
}

export const removeTeacher = async (req, res) => {
  try {
    const oldDepartment = await DepartmentsSchema.findById(req.params.departmentId)

    const newTeachers = oldDepartment.teachers.filter((el) => String(el) !== req.params.id)

    await DepartmentsSchema.updateOne({ _id: req.params.departmentId }, { teachers: newTeachers })

    TeachersSchema.findByIdAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити викладача',
        })
        return
      }
      if (!doc) {
        return res.status(404).json({
          message: 'Не вдалось знайти викладача',
        })
      }

      res.json({
        id: req.params.id,
        departmentId: req.params.departmentId,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити викладача',
    })
  }
}
