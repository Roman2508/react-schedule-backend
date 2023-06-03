import FacultySchema from '../models/FacultySchema.js'

export const getAllFaculties = async (req, res) => {
  try {
    const faculties = await FacultySchema.find({ institutionId: req.params.institutionId })
      .populate('specialties')
      .exec()

    res.json(faculties)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати факультети',
    })
  }
}

export const createFaculty = async (req, res) => {
  try {
    const doc = new FacultySchema({
      name: req.body.name,
      shortName: req.body.shortName,
      institutionId: req.body.institutionId,
    })

    const faculties = await doc.save()

    res.json(faculties)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось створити факульете',
    })
  }
}

export const removeFaculty = async (req, res) => {
  try {
    FacultySchema.findByIdAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити факультет',
        })
        return
      }
      if (!doc) {
        res.status(404).json({
          message: 'Не вдалось знайти факульете',
        })
      }

      res.json({ id: req.params.id })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити факультет',
    })
  }
}

export const updateFaculty = async (req, res) => {
  try {
    await FacultySchema.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
        shortName: req.body.shortName,
      },
    )

    const newFaculty = await FacultySchema.findById(req.params.id)

    res.json(newFaculty)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити факультет',
    })
  }
}
