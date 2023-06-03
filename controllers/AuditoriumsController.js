import AuditoriumSchema from '../models/AuditoriumSchema.js'
import BuildingsSchema from '../models/BuildingsSchema.js'

export const createAuditorium = async (req, res) => {
  try {
    const doc = new AuditoriumSchema({
      name: req.body.name,
      buildingId: req.body.buildingId,
      type: req.body.type,
      seatsNumber: req.body.seatsNumber,
      institutionId: req.body.institutionId,
    })

    const building = await BuildingsSchema.findOne({ _id: doc.buildingId })

    if (building) {
      building.auditoriums.push(doc._id)
      await building.save()
    } else {
      res.status(500).json({
        message: 'some error',
      })
      return
    }

    const auditorium = await doc.save()

    res.json(auditorium)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось додати аудиторію',
    })
  }
}

export const removeAuditorium = async (req, res) => {
  try {
    const building = await BuildingsSchema.findOne({ _id: req.params.buildingId })

    const newAuditoriums = building.auditoriums.filter((el) => String(el) !== req.params.id)
    console.log(newAuditoriums)
    await BuildingsSchema.updateOne({ _id: req.params.buildingId }, { auditoriums: newAuditoriums })

    AuditoriumSchema.findByIdAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити аудиторію',
        })
        return
      }
      if (!doc) {
        return res.status(404).json({
          message: 'Не вдалось знайти аудиторію',
        })
      }
      res.json({
        id: req.params.id,
        buildingId: req.params.buildingId,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити аудиторію',
    })
  }
}

export const updateAuditorium = async (req, res) => {
  try {
    const oldAuditorium = await AuditoriumSchema.findById(req.params.id)

    const { name, buildingId, type, seatsNumber } = req.body

    await AuditoriumSchema.updateOne(
      { _id: req.params.id },
      {
        name,
        buildingId,
        type,
        seatsNumber,
      },
    )

    const newAuditorium = await AuditoriumSchema.findById(req.params.id)

    if (String(oldAuditorium.buildingId) !== String(buildingId)) {
      const building = await BuildingsSchema.findOne({ _id: oldAuditorium.buildingId })

      const newAuditoriums = building.auditoriums.filter((el) => String(el._id) !== String(oldAuditorium._id))

      building.auditoriums = newAuditoriums
      await building.save()

      const newBuildings = await BuildingsSchema.findOne({ _id: buildingId })

      if (newBuildings) {
        newBuildings.auditoriums.push(req.params.id)
        await newBuildings.save()
      } else {
        res.status(500).json({
          message: 'some error',
        })
        return
      }
    }

    res.json(newAuditorium)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити аудиторію',
    })
  }
}
