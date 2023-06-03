import StreamsSchema from '../models/StreamsSchema.js'
import GroupSchema from '../models/GroupSchema.js'
import LessonsSchema from '../models/LessonsSchema.js'
import { DistributedLoadSubjects } from '../models/DistributedLoadSchema.js'

export const getStreams = async (req, res) => {
  try {
    const streams = await StreamsSchema.find({ institutionId: req.params.institutionId })
      .populate(['components', 'components.groupLoad'])
      .exec()

    res.json(streams)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати потоки',
    })
  }
}

export const createStream = async (req, res) => {
  try {
    const doc = new StreamsSchema({
      name: req.body.name,
      institutionId: req.body.institutionId,
    })

    const stream = await doc.save()

    res.json(stream)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось створити потік',
    })
  }
}

export const updateStream = async (req, res) => {
  try {
    await StreamsSchema.updateOne({ _id: req.params.id }, { name: req.body.name })

    const groupIdArray = req.body.groupId

    // Оновлюю назву потоку в виставлених заняттях
    Promise.all(
      groupIdArray.map(async (groupId) => {
        const distributedLoad = await DistributedLoadSubjects.find({ groupId: groupId })

        distributedLoad.map(async (el) => {
          const { _id, groupId, institutionId, name, semester, specialization, __v, ...subjects } = el._doc

          const keys = Object.keys(subjects)

          keys.map(async (key) => {
            if (el[key] && el[key].stream) {
              const updatedSubjects = {
                ...el[key]._doc,
                stream: {
                  ...el[key]._doc.stream._doc,
                  name: req.body.name,
                },
              }

              await DistributedLoadSubjects.findByIdAndUpdate(_id, {
                [key]: updatedSubjects,
              })

              return el[key]
            }
          })
        })
      }),
    )

    res.json({
      _id: req.params.id,
      name: req.body.name,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити назву потока',
    })
  }
}

export const removeStream = async (req, res) => {
  try {
    StreamsSchema.findByIdAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити потік',
        })
        return
      }

      if (!doc) {
        console.log(err)
        res.status(404).json({
          message: 'Не вдалось знайти потік',
        })
      }

      res.json({
        id: req.params.id,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500),
      json({
        message: 'Не вдалось видалити потік',
      })
  }
}

export const createStreamComponent = async (req, res) => {
  try {
    const stream = await StreamsSchema.findById({ _id: req.params.id })

    await StreamsSchema.updateOne(
      { _id: req.params.id },
      {
        groupId: req.body.groupId,
        components: [...stream.components, req.body],
      },
    )

    const group = await GroupSchema.findById(req.body.groupId)

    if (group) {
      await GroupSchema.updateOne({ _id: req.body.groupId }, { streams: [...group.streams, req.params.id] })
    }

    const newStream = await StreamsSchema.findById({ _id: req.params.id }) /* .populate('groupLoad') */

    res.json(newStream)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось додати групу в потік',
    })
  }
}

export const removeStreamComponent = async (req, res) => {
  try {
    const stream = await StreamsSchema.findById(req.params.streamId)

    if (stream) {
      const removedcomponent = stream.components.find((el) => String(el._id) === req.params.id)

      const newComponents = stream.components.filter((el) => String(el._id) !== req.params.id)

      await StreamsSchema.findByIdAndUpdate({ _id: req.params.streamId }, { components: newComponents })

      const group = await GroupSchema.findById(removedcomponent.groupId)

      if (group) {
        const newStreamsData = group.streams.filter((el) => String(el) !== req.params.streamId)

        await GroupSchema.updateOne({ _id: removedcomponent.groupId }, { streams: newStreamsData })
      }

      const newStreams = await StreamsSchema.findById(req.params.streamId)

      if (newStreams.components.length <= 1) {
        await StreamsSchema.findByIdAndUpdate({ _id: req.params.streamId }, { details: [] })
      }

      res.json(req.params)
    } else {
      res.status(404).json({
        message: 'Не вдалось знайти групу',
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити групу з потоку',
    })
  }
}

export const updateStreamDetails = async (req, res) => {
  try {
    const stream = await StreamsSchema.findById(req.params.id)

    if (req.body.length === 1) {
      /* Якщо оновлюється один вид занять */

      /* Шукаємо чи є вже такий елемент в базі */
      const findedItem = stream.details.find(
        (el) =>
          el.name === req.body[0].name &&
          el.semester === req.body[0].semester &&
          el.type === req.body[0].type &&
          el.subgroupNumber === req.body[0].subgroupNumber,
      )

      /* Якщо є - просто повертаємо об'єкти */
      if (findedItem) {
        const newStream = await StreamsSchema.findById(req.params.id)

        res.json({ id: req.params.id, data: newStream.details })
      } else {
        /* Якщо немає - створюємо новий */

        await StreamsSchema.updateOne(
          { _id: req.params.id },
          {
            details: [...stream.details, req.body[0]],
          },
        )
        const newStream = await StreamsSchema.findById(req.params.id)

        res.json({ id: req.params.id, data: newStream.details })
      }

      /*  */
    } else if (req.body.length > 1) {
      /* Якщо оновлюється декілька видів занять */

      /* Перевіряємо чи є передані елементи в базі */
      const findedSubjects = []

      const newSubjects = []

      for (let i = 0; i < req.body.length; i++) {
        const finded = stream.details.find(
          (el) => el.name === req.body[i].name && el.semester === req.body[i].semester && el.type === req.body[i].type,
        )
        if (finded) {
          findedSubjects.push(finded)
        } else {
          newSubjects.push(req.body[i])
        }
      }
      /* Якщо об'єкти не знайдені - додаємо нові об'єкти в базу */
      const validStream = await StreamsSchema.findById(req.params.id)

      await StreamsSchema.updateOne(
        { _id: req.params.id },
        {
          details: [...validStream.details, ...newSubjects],
        },
      )
      /* // Якщо об'єкти не знайдені - додаємо нові об'єкти в базу */

      res.json({
        id: req.params.id,
        data: [...validStream.details, ...newSubjects],
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось об`єднати дисципліну в потік :(',
    })
  }
}

export const removeStreamDetails = async (req, res) => {
  const stream = await StreamsSchema.findById(req.params.streamId)

  if (stream) {
    const newStreamDetails = stream.details.filter((el) => String(el._id) !== req.params.id)

    await StreamsSchema.updateOne(
      { _id: req.params.streamId },
      {
        details: newStreamDetails,
      },
    )

    res.json(req.params)
  } else {
    res.status(404).json({
      message: 'Потік не знайдено',
    })
  }

  try {
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити дисципліну з потоку',
    })
  }
}

// const data = [
//   {
//     _id: '64440c5f5bfe1bc7782b37c2',
//     groupId: '6439696be54efa267cfc90c2',
//     institutionId: '643294bc1af1425e921deb6a',
//     name: 'Дисципліна 3',
//     semester: 3,
//     specialization: null,
//     lectures: {
//       type: 'Лекції',
//       teacher: '643443bf90557efe120044a6',
//       hours: 24,
//       students: 22,
//       stream: {
//         streamId: '6443d160e4b5d6371fc1d1e6',
//         name: '111111111',
//         groups: ['6439696be54efa267cfc90c2', '6443a80c2c7d8b27a1ffa597'],
//       },
//       subgroupNumber: null,
//       _id: '644525a0d20402c91f2df2b9',
//     },
//     laboratory: {
//       type: 'Лабораторні',
//       teacher: ' 643443d990557efe120044aa',
//       hours: 48,
//       students: 20,
//       stream: null,
//       subgroupNumber: null,
//       _id: '64440c5f5bfe1bc7782b37c2',
//     },
//   },
//   {
//     _id: '64440c5f5bfe1bc7782b37c2',
//     groupId: '6439696be54efa267cfc90c2',
//     institutionId: '643294bc1af1425e921deb6a',
//     name: 'Дисципліна 3',
//     semester: 3,
//     specialization: null,
//     lectures: {
//       type: 'Лекції',
//       teacher: '643443bf90557efe120044a6',
//       hours: 24,
//       students: 22,
//       stream: null,
//       subgroupNumber: null,
//       _id: '644525a0d20402c91f2df2b9',
//     },

//     laboratory: {
//       type: 'Лабораторні',
//       teacher: ' 643443d990557efe120044aa',
//       hours: 48,
//       students: 20,
//       stream: null,
//       subgroupNumber: null,
//       _id: '64440c5f5bfe1bc7782b37c2',
//     },
//   },
// ]
