import GroupLoadSchema from '../models/GroupLoadSchema.js'
import SubjectSchema from '../models/Subjects.js'
import GroupLoadSubjectSchema from '../models/GroupLoadSubjectSchema.js'

export const getGroupLoad = async (req, res) => {
  try {
    const groupLoad = await GroupLoadSchema.findById(req.params.id).populate('load').exec()

    res.json(groupLoad)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати навантаження групи',
    })
  }
}

// ?????????????????????????????????????????????????
export const createGroupLoad = async (req, res) => {
  try {
    const doc = new GroupLoadSchema({
      groupId: req.body.groupId,
      planId: req.body.planId,
      load: req.body.load,
    })

    const groupLoad = await doc.save()

    await Promise.all(
      groupLoad.load.map(async (el) => {
        const subject = await SubjectSchema.findById(el)

        if (subject) {
          const doc = new GroupLoadSubjectSchema({ ...subject._doc, groupId: req.body.groupId })
          doc.isNew = true
          await doc.save()
        }
      }),
    )

    const finalGroupLoad = await GroupLoadSchema.findById(groupLoad._id).populate('load').exec()

    res.json(finalGroupLoad)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось створити навантаження групи',
    })
  }
}

export const updateGroupLoad = async (req, res) => {
  try {
    const group = await GroupLoadSchema.findById(req.params.id)

    if (req.body.planId !== group.planId) {
      GroupLoadSubjectSchema.deleteMany({ groupId: req.params.id }, (err, doc) => {
        if (err) {
          res.status(500).json({
            message: 'some error',
          })
        }
        if (!doc) {
          res.status(404).json({
            message: 'Не вдалось оновити навантаження групи',
          })
        }
      })

      await GroupLoadSchema.updateOne(
        { groupId: req.params.id },
        {
          groupId: req.body.groupId,
          planId: req.body.planId,
          load: req.body.load,
        },
      )

      const newGroup = await GroupLoadSchema.findOne({ groupId: req.params.id })

      await Promise.all(
        newGroup.load.map(async (el) => {
          const subject = await SubjectSchema.findById(el)
          if (subject) {
            const doc = new GroupLoadSubjectSchema({ ...subject._doc, groupId: req.body.groupId })
            doc.isNew = true
            await doc.save()
          }
        }),
      )

      const finalGroulLoad = await GroupLoadSchema.findOne({ groupId: req.params.id }).populate('load').exec()

      res.json(finalGroulLoad)
    } else {
      res.status(404)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити навантаження групи',
    })
  }
}
