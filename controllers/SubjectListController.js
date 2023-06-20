import SubjectsListModel from '../models/Subjects.js'
import EducationPlanModel from '../models/EducationPlans.js'
import GroupLoadSubjectSchema from '../models/GroupLoadSubjectSchema.js'
import GroupLoadSchema from '../models/GroupLoadSchema.js'

export const createNewSubject = async (req, res) => {
  try {
    const doc = new SubjectsListModel({
      name: req.body.name,
      planId: req.body.planId,
      institutionId: req.body.institutionId,
      totalHour: 0,
    })

    /* Додаємо дисципліну до навчального плану */
    await EducationPlanModel.findByIdAndUpdate({ _id: doc.planId }, { $push: { subjects: doc._id } })

    const newSubject = await doc.save()

    /* Якщо план прикріплений до якоїсь групи - додаємо дисципліну до GroupLoad */

    /* Шукаємо всі groupLoad з якими зв'язаний даний навчальний план */
    const groupLoads = await GroupLoadSchema.find({ planId: req.body.planId })

    /* Якщо хоч до 1 groupLoad даний план прикріплений - додаємо його до GroupLoad.load 
      та створюємо дисципліну в GroupLoadSubjectSchema */
    if (groupLoads) {
      Promise.all(
        groupLoads.map(async (el) => {
          const groupLoadSubjectDoc = new GroupLoadSubjectSchema({
            name: req.body.name,
            planId: req.body.planId,
            groupId: el.groupId,
            totalHour: 0,
          })

          await GroupLoadSchema.updateOne({ _id: el._id }, { $push: { load: groupLoadSubjectDoc._id } })

          await groupLoadSubjectDoc.save()
        })
      )
    }

    res.json(newSubject)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось створити нову дисципліну',
    })
  }
}
export const updateSubjectHours = async (req, res) => {
  try {
    const findedSubject = await SubjectsListModel.findById({ _id: req.params.id })

    let semesterNumber

    if (findedSubject) {
      /* semesterNumber = Номер семестру, який оновлюється */
      semesterNumber = Object.keys(req.body)[0]

      const semesterHours = {
        departmentId: req.body[semesterNumber].departmentId, // ????
        lectures: req.body[semesterNumber].lectures < 0 ? 0 : req.body[semesterNumber].lectures,
        practical: req.body[semesterNumber].practical < 0 ? 0 : req.body[semesterNumber].practical,
        laboratory: req.body[semesterNumber].laboratory < 0 ? 0 : req.body[semesterNumber].laboratory,
        seminars: req.body[semesterNumber].seminars < 0 ? 0 : req.body[semesterNumber].seminars,
        exams: req.body[semesterNumber].exams < 0 ? 0 : req.body[semesterNumber].exams,
        zalik: req.body[semesterNumber].zalik < 0 ? 0 : req.body[semesterNumber].zalik,
        termPaper: req.body[semesterNumber].termPaper,
        individual: req.body[semesterNumber].individual < 0 ? 0 : req.body[semesterNumber].individual,
        inPlan: req.body[semesterNumber].inPlan < 0 ? 0 : req.body[semesterNumber].inPlan,
      }

      findedSubject[semesterNumber] = semesterHours

      /* Роблю перерахунок загальної кількості годин з дисципліни (по всім семестрам) */
      const keys = Object.keys(findedSubject._doc).filter((el) => el.includes('semester'))

      const hoursArray = keys.map((k) => {
        if (findedSubject[k] !== null) {
          return findedSubject[k].inPlan
        }
      })

      const totalHour = hoursArray.filter((el) => el !== undefined).reduce((sum, el) => el + sum, 0)

      findedSubject.totalHour = totalHour

      findedSubject.save()

      await GroupLoadSubjectSchema.updateMany(
        { name: findedSubject.name, planId: findedSubject.planId },
        { totalHour: findedSubject.totalHour, [semesterNumber]: findedSubject[semesterNumber] }
      )
    } else {
      res.status(404).json({
        message: 'Не вдалось знайти дисципліну',
      })
      return
    }

    res.json({ semesterNumber, data: findedSubject })
  } catch (error) {
    console.log(error)
    res.json({
      message: 'Не вдалось оновити дисципліну',
    })
  }
}
export const updateSubjectName = async (req, res) => {
  try {
    const subject = await SubjectsListModel.findOne({ _id: req.params.id })

    if (subject) {
      await SubjectsListModel.updateOne({ _id: req.params.id }, { name: req.body.name })

      await GroupLoadSubjectSchema.updateMany({ name: subject.name, planId: subject.planId }, { name: req.body.name })

      return res.json({
        id: req.params.id,
        name: req.body.name,
      })
    }

    res.status(404).json({ message: 'Не вдалось знайти дисципліну' })
  } catch (error) {
    console.log(error)
    res.json({
      message: 'Не вдалось оновити назву дисципліни',
    })
  }
}
export const removeSubject = async (req, res) => {
  try {
    const subject = await SubjectsListModel.findById(req.params.id)

    const plan = await EducationPlanModel.findById(subject.planId)

    const newSubjects = plan.subjects.filter((el) => String(el) !== req.params.id)

    await EducationPlanModel.updateOne({ _id: subject.planId }, { subjects: newSubjects })

    SubjectsListModel.findOneAndDelete({ _id: req.params.id }, (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити дисципліну',
        })
        return
      }

      if (!doc) {
        return res.status(404).json({
          message: 'Не вдалось знайти дисципліну',
        })
      }

      res.json({
        id: req.params.id,
      })
    })

    const groupLoad = await GroupLoadSchema.find({ planId: subject.planId })

    if (groupLoad) {
      const groupLoadSubjects = await GroupLoadSubjectSchema.find({ planId: subject.planId, name: subject.name })

      await GroupLoadSubjectSchema.deleteMany({ planId: subject.planId, name: subject.name })

      Promise.all(
        groupLoad.map((el) => {
          groupLoadSubjects.map(async (gls) => {
            const items = el.load.filter((load) => String(load) !== String(gls._id))

            await GroupLoadSchema.updateOne({ _id: el._id }, { load: items })
          })
        })
      )
    }
  } catch (error) {
    console.log(error)
    res.json({
      message: 'Не вдалось видалити дисципліну',
    })
  }
}
export const removeSemester = async (req, res) => {
  try {
    if (!req.body.payload) {
      res.json({
        message: 'Не вдалось видалити семестер',
      })
      return
    } else {
      const subject = await SubjectsListModel.findById(req.params.id)

      if (subject) {
        /* Роблю перерахунок загальної кількості годин з дисципліни (по всім семестрам) */
        const keys = Object.keys(subject).filter((el) => el.includes('semester'))

        const hoursArray = keys.map((k) => {
          if (subject[k] !== null) {
            return subject[k].inPlan
          }
        })

        const totalHour = hoursArray.filter((el) => el !== undefined).reduce((sum, el) => el + sum, 0)

        await SubjectsListModel.updateOne({ _id: req.params.id }, { [req.body.payload]: null, totalHour: totalHour })

        await GroupLoadSubjectSchema.updateMany(
          { name: subject.name, planId: subject.planId },
          { [req.body.payload]: null, totalHour: totalHour }
        )
      }
    }

    res.json({
      semester: req.body.payload,
      id: req.params.id,
    })
  } catch (error) {
    console.log(error)
    res.json({
      message: 'Не вдалось видалити семестер',
    })
  }
} // done ??????????????????/
