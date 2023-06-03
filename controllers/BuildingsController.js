import BuildingsSchema from '../models/BuildingsSchema.js'

export const getAllBuildings = async (req, res) => {
  try {
    const buildings = await BuildingsSchema.find({ institutionId: req.params.institutionId })
      .populate('auditoriums')
      .exec()

    

    res.json(buildings)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати корпуси',
    })
  }
}

export const createBuildings = async (req, res) => {
  try {
    const doc = new BuildingsSchema({
      name: req.body.name,
      institutionId: req.body.institutionId,
    })

    const building = await doc.save()

    res.json(building)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось додати корпус',
    })
  }
}

export const updateBuilding = async (req, res) => {
  try {
    await BuildingsSchema.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
      },
    )

    const newBuilding = await BuildingsSchema.findById(req.params.id)

    res.json(newBuilding)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити корпус',
    })
  }
}

export const removeBuilding = async (req, res) => {
  try {
    BuildingsSchema.findOneAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити копрус',
        })
        return
      }
      if (!doc) {
        return res.status(404).json({
          message: 'Не вдалось знайти копрус',
        })
      }

      res.json({
        id: req.params.id,
      })
    })
  } catch (error) {
    console.log(error)
    res.json({
      message: 'Не вдалось видалити корпус',
    })
  }
}
