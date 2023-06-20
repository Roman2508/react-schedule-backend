import moment from 'moment'
import LessonsSchema from '../models/LessonsSchema.js'

export const getLessonsById = async (req, res) => {
  try {
    const lessons = await LessonsSchema.find({
      [req.params.type]: req.params.id,
      institutionId: req.params.institutionId,
    })
      .populate(['teacher', 'auditory', , 'stream'])
      .exec()

    res.json(lessons)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати розклад',
    })
  }
}

export const createLesson = async (req, res) => {
  const doc = new LessonsSchema({
    name: req.body.name,
    date: req.body.date,
    hours: req.body.hours,
    remark: req.body.remark,
    stream: req.body.stream,
    userId: req.body.userId,
    groupId: req.body.groupId,
    teacher: req.body.teacher,
    auditory: req.body.auditory,
    students: req.body.students,
    semester: req.body.semester,
    groupName: req.body.groupName,
    subjectType: req.body.subjectType,
    subjectNumber: req.body.subjectNumber,
    institutionId: req.body.institutionId,
  })

  await doc.save()

  const lesson = await LessonsSchema.findById(doc._id).populate(['teacher', 'auditory', 'stream']).exec()

  res.json(lesson)
  try {
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось додати дисципліну',
    })
  }
}

export const updateLessons = async (req, res) => {
  try {
    const lesson = await LessonsSchema.findByIdAndUpdate(
      req.params.id,
      {
        auditory: req.body.auditory,
      },
      { new: true },
    )
      .populate(['teacher', 'auditory', 'stream'])
      .exec()

    res.json({ auditory: lesson.auditory, _id: req.params.id })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити розклад',
    })
  }
}

export const updateStreamLessons = async (req, res) => {
  try {
    const lesson = await LessonsSchema.findOneAndUpdate(
      {
        groupId: req.params.groupId,
        institutionId: req.body.institutionId,
        subjectNumber: req.body.subjectNumber,
        name: req.body.name,
        date: req.body.date,
        semester: req.body.semester,
      },
      {
        auditory: req.body.auditory,
      },
      { new: true },
    )
      .populate(['teacher', 'auditory', 'stream'])
      .exec()

    res.json({ auditory: lesson.auditory, _id: lesson._id })
    // res.json({ ...req.body, ...req.params })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити розклад',
    })
  }
}

export const removeLesson = async (req, res) => {
  try {
    LessonsSchema.findOneAndDelete({ _id: req.params.id }, (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити дисципліну',
        })
      }

      if (!doc) {
        res.status(404).json({
          message: 'Не вдалось знайти дисципліну',
        })
      }

      res.json({
        id: req.params.id,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити дисципліну',
    })
  }
}

export const removeStreamLesson = async (req, res) => {
  try {
    LessonsSchema.findOneAndDelete(
      {
        name: req.body.name,
        date: req.body.date,
        groupId: req.body.groupId,
        subjectNumber: req.body.subjectNumber,
      },
      (err, doc) => {
        if (err) {
          console.log(err)
          res.status(500).json({
            message: 'Не вдалось видалити дисципліну',
          })
        }

        if (!doc) {
          res.status(404).json({
            message: 'Не вдалось знайти дисципліну',
          })
        }

        res.json({
          _id: doc._id,
        })
      },
    )
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось виладити дисципліну',
    })
  }
}

export const checkAuditoryOverlay = async (req, res) => {
  try {
    const overlayLessons = await LessonsSchema.find({
      institutionId: req.params.institutionId,
      semester: req.params.semester,
      subjectNumber: req.params.subjectNumber,
      date: req.params.date,
    })
      .populate(['auditory'])
      .exec()

    const overlayAuditoryArray = overlayLessons.map((el) => ({
      _id: el.auditory._id,
      buildingId: el.auditory.buildingId,
    }))

    res.json(overlayAuditoryArray)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

// https://ruseller.com/lessons.php?rub=32&id=2043 - moment
export const createSeveralLessons = async (req, res) => {
  try {
    // moment.unix(1681160400).clone().add(1, 'week').format('DD.MM.YYYY') Збільшити розклад на 1 тиждень
    // moment.unix(1681160400).clone().add(1, 'week').unix() Збільшити розклад на 1 тиждень

    const { groupId, institutionId, startDateCopyFrom, endDateCopyFrom, startDateCopyTo, endDateCopyTo } = req.body

    // Різниця між тижнем, з якого потрібно скопіювати розклад та тижня, в який потрібно скопіювати (в тижнях)
    const weekDifference = moment.unix(startDateCopyTo).diff(moment.unix(startDateCopyFrom), 'week')

    // Масив дисциплін тижня, з якого потрібно скопіювти розклад
    const copyFromlessons = await LessonsSchema.find({
      institutionId: institutionId,
      groupId: groupId,
      date: { $gte: startDateCopyFrom, $lte: endDateCopyFrom },
      // date: { $gte: startDate }, Більше ніж
      // date: { $lte: endDate }, Менше ніж
    })

    // Масив дисциплін тижня, на який потрібно скопіювати розклад
    const week = await LessonsSchema.find({
      institutionId: institutionId,
      groupId: groupId,
      date: { $gte: startDateCopyTo, $lte: endDateCopyTo },
    })

    // Масив нових дисциплін
    const copyToLessonsId = []

    // Якщо overlay === true - є накладки в (групи / викладача / аудиторії)
    let overlay

    // Якщо на тижні, на який потрібно скопіювати розклад стоять пари, потрібно зробити перевірку накладок
    if (copyFromlessons.length /* && week.length */) {
      //
      // Перевірка чи немає накладок в групи
      copyFromlessons.forEach((el) => {
        overlay = week.some((week) => {
          const date = moment.unix(el.date).clone().add(weekDifference, 'week').unix()
          return week.subjectNumber === el.subjectNumber && week.date === date
        })
      })

      //
      // Перевірка чи немає накладок аудиторій
      await Promise.all(
        copyFromlessons.map(async (lesson) => {
          const date = moment.unix(lesson.date).clone().add(weekDifference, 'week').unix()

          const auditoryLessons = await LessonsSchema.find({
            date: date,
            auditory: lesson.auditory,
            institutionId: institutionId,
            subjectNumber: lesson.subjectNumber,
          })

          if (auditoryLessons.length) {
            overlay = true
          }
        }),
      )

      //
      // Перевірка чи немає накладок в викладачів
      await Promise.all(
        copyFromlessons.map(async (lesson) => {
          const date = moment.unix(lesson.date).clone().add(weekDifference, 'week').unix()

          const TeacherLessons = await LessonsSchema.find({
            date: date,
            teacher: lesson.teacher,
            institutionId: institutionId,
            subjectNumber: lesson.subjectNumber,
          })

          if (TeacherLessons.length) {
            overlay = true
          }
        }),
      )

      // Якщо накладок немає - копіюю розклад
      if (!overlay) {
        Promise.all(
          copyFromlessons.map(async (el) => {
            const date = moment.unix(el.date).clone().add(weekDifference, 'week').unix()

            const doc = new LessonsSchema({
              groupId: el.groupId,
              name: el.name,
              subjectType: el.subjectType,
              teacher: el.teacher,
              auditory: el.auditory,
              remark: el.remark,
              date: date,
              groupName: el.groupName,
              semester: el.semester,
              subjectNumber: el.subjectNumber,
              hours: el.hours,
              stream: el.stream,
              userId: el.userId,
              students: el.students,
              institutionId: el.institutionId,
            })

            copyToLessonsId.push(doc._id)
            doc.save()
          }),
        )
      }
    }

    //
    if (overlay) {
      res.status(400).json({ message: 'Не вдалось скопіювати розклад через накладки занять' })
    } else {
      const newLessons = []
      await LessonsSchema.find({ date: '1' })

      await Promise.all(
        copyToLessonsId.map(async (el) => {
          const lesson = await LessonsSchema.findById(el).populate(['teacher', 'auditory', , 'stream']).exec()

          if (lesson) {
            newLessons.push(lesson)
          }
        }),
      )

      res.json(newLessons)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Не вдалось додати дисципліни' })
  }
}
