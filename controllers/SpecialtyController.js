import FacultySchema from '../models/FacultySchema.js'
import SpecialtySchema from '../models/SpecialtySchema.js'

export const getActiveSpecialty = async (req, res) => {
  try {
    const specialties = await SpecialtySchema.findById(req.params.id).populate('groups').exec()

    res.json(specialties)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати спеціальності',
    })
  }
}

export const createSpecialty = async (req, res) => {
  try {
    const doc = new SpecialtySchema({
      name: req.body.name,
      shortName: req.body.shortName,
      facultieId: req.body.facultieId,
      institutionId: req.body.institutionId,
    })

    const faculty = await FacultySchema.findOne({ _id: req.body.facultieId })

    if (faculty) {
      faculty.specialties.push(doc._id)

      await faculty.save()
    } else {
      res.status(500).json({
        message: 'Не вдалось створити спеціальність',
      })
    }

    const specialty = await doc.save()

    res.json(specialty)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось створити спеціальність',
    })
  }
}

export const removeSpecialty = async (req, res) => {
  try {
    const oldFaculties = await FacultySchema.findById(req.params.facultieId)

    const specialties = oldFaculties.specialties.filter((el) => String(el._id) !== req.params.id)

    await FacultySchema.updateOne({ _id: req.params.facultieId }, { specialties })

    SpecialtySchema.findByIdAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити спеціальність',
        })
        return
      }

      if (!doc) {
        console.log(err)
        res.status(404).json({
          message: 'Не вдалось знайти спеціальність',
        })
        return
      }

      res.json({
        id: req.params.id,
        facultieId: req.params.facultieId,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити спеціальність',
    })
  }
}

export const updateSpecialty = async (req, res) => {
  try {
    const oldSpecialty = await SpecialtySchema.findById(req.params.id)

    await SpecialtySchema.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
        shortName: req.body.shortName,
        facultieId: req.body.facultieId,
      },
    )

    const newSpecialty = await SpecialtySchema.findById(req.params.id)

    if (String(oldSpecialty.facultieId) !== String(req.body.facultieId)) {
      const faculties = await FacultySchema.findById(oldSpecialty.facultieId)

      const specialties = faculties.specialties.filter((el) => String(el._id) !== String(req.params.id))

      faculties.specialties = specialties

      await faculties.save()

      const newFaculty = await FacultySchema.findById(req.body.facultieId)

      if (newFaculty) {
        newFaculty.specialties.push(req.params.id)
        await newFaculty.save()
      }
    }

    res.json(newSpecialty)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити спеціальність',
    })
  }
}
