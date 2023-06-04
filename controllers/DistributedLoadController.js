import DistributedLoadSchema, { DistributedLoadSubjects } from '../models/DistributedLoadSchema.js'
import StreamsSchema from '../models/StreamsSchema.js'
import GroupLoadSchema from '../models/GroupLoadSchema.js'
import SpecializationSubjectSchema from '../models/SpecializationSubjectSchema.js'
import SubgroupsSchema from '../models/SubgroupsSchema.js'
import TeachersSchema from '../models/TeachersSchema.js'
import GroupSchema from '../models/GroupSchema.js'
import InstitutionsSettingsSchema from '../models/InstitutionsSettingsSchema.js'
import UserSettingsSchema from '../models/UserSettingsSchema.js'
import LessonsSchema from '../models/LessonsSchema.js'
import { useGetDistributedTeacherLoad } from '../utils/useGetDistributedTeacherLoad.js'
// import isEqual from 'lodash.isequal'

export const subjectTypes = [
  'lectures',
  'lectures_1',
  'lectures_2',
  'lectures_3',
  'lectures_4',
  'practical',
  'practical_1',
  'practical_2',
  'practical_3',
  'practical_4',
  'laboratory',
  'laboratory_1',
  'laboratory_2',
  'laboratory_3',
  'laboratory_4',
  'seminars',
  'seminars_1',
  'seminars_2',
  'seminars_3',
  'seminars_4',
  'exams',
  'exams_1',
  'exams_2',
  'exams_3',
  'exams_4',
]

const populate = [
  'lectures.teacher',
  'lectures_1.teacher',
  'lectures_2.teacher',
  'lectures_3.teacher',
  'lectures_4.teacher',
  'practical.teacher',
  'practical_1.teacher',
  'practical_2.teacher',
  'practical_3.teacher',
  'practical_4.teacher',
  'laboratory.teacher',
  'laboratory_1.teacher',
  'laboratory_2.teacher',
  'laboratory_3.teacher',
  'laboratory_4.teacher',
  'seminars.teacher',
  'seminars_1.teacher',
  'seminars_2.teacher',
  'seminars_3.teacher',
  'seminars_4.teacher',
  'exams.teacher',
  'exams_1.teacher',
  'exams_2.teacher',
  'exams_3.teacher',
  'exams_4.teacher',
]

export const getDistributedLoad = async (req, res) => {
  try {
    const userSettings = await UserSettingsSchema.findOne({ userId: req.params.userId })

    const distributedLoad = await DistributedLoadSchema.findOne({ groupId: req.params.id })

    let semesterSubjects = []

    if (userSettings.selectedSemester === '1') {
      semesterSubjects = await DistributedLoadSubjects.find({
        groupId: req.params.id,
        semester: req.currentSemesters.first,
      })
        .populate(populate)
        .exec()
    }

    if (userSettings.selectedSemester === '2') {
      semesterSubjects = await DistributedLoadSubjects.find({
        groupId: req.params.id,
        semester: req.currentSemesters.second,
      })
        .populate(populate)
        .exec()
    }

    res.json({
      ...distributedLoad._doc,
      load: semesterSubjects,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалося отримати навантаження',
    })
  }
}

export const getDistributedLoadBySemester = async (req, res) => {
  try {
    const { sortType, selectedSemester, id } = req.params

    // if (sortType === 'teacher') {
    //   const distributedSemesterLoad = await DistributedLoadSubjects.find({
    //     semester: selectedSemester,
    //   })

    //   const teacher = await TeachersSchema.findById(req.params.teacher)

    //   // Отримую ід на назви груп
    //   const groupList = []

    //   await Promise.all(
    //     distributedSemesterLoad.map(async (el) => {
    //       const group = await GroupSchema.findById(el.groupId)
    //       groupList.push({ _id: group._id, name: group.name })
    //     }),
    //   )

    //   const { distributedTeacherLoad } = useGetDistributedTeacherLoad(distributedSemesterLoad, groupList, teacher, id)

    //   const filtredDistributedTeacherLoad = distributedTeacherLoad.filter((el) => el !== undefined)

    //   // console.log(filtredDistributedTeacherLoad)

    //   res.json(filtredDistributedTeacherLoad)
    // }

    if (sortType === 'group') {
      const distributedSemesterLoad = await DistributedLoadSubjects.find({
        semester: selectedSemester,
        groupId: id,
      })
        .populate(populate)
        .exec()

      res.json(distributedSemesterLoad)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Помилка при отриманні навантаження' })
  }
}

export const createCurrentSemesters = async (req, res, next) => {
  try {
    let currentGroup

    currentGroup = await GroupSchema.findById(req.body.groupId)

    if (!currentGroup) {
      currentGroup = await GroupSchema.findById(req.params.id)
    }

    const settings = await InstitutionsSettingsSchema.findOne({
      institutionId: currentGroup._doc.institutionId,
    })

    const yearOfAdmission = currentGroup._doc.yearOfAdmission
    const currentShowedYear = settings._doc.currentShowedYear

    const currentSemesters = {
      first: 0,
      second: 0,
    }

    const showedSemesters = Number(currentShowedYear) - Number(yearOfAdmission)

    if (showedSemesters === 0) {
      currentSemesters.first = 1
      currentSemesters.second = 2
    }

    if (showedSemesters === 1) {
      currentSemesters.first = 3
      currentSemesters.second = 4
    }

    if (showedSemesters === 2) {
      currentSemesters.first = 5
      currentSemesters.second = 6
    }

    if (showedSemesters === 3) {
      currentSemesters.first = 7
      currentSemesters.second = 8
    }

    req.currentSemesters = currentSemesters

    next()
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Помилка :(' })
  }
}

export const updateDistributedLoad = async (req, res) => {
  try {
    const group = await GroupSchema.findById(req.body.groupId)

    const distributedLoadAllSemesters = await DistributedLoadSchema.find({
      groupId: req.body.groupId,
    })
      .populate('load')
      .exec()

    let distributedLoad = []

    if (distributedLoadAllSemesters.length) {
      // Фільтрую всі дисципліни, які не читаються в 1 семестрі поточного року
      const firstSemesterSubjects = distributedLoadAllSemesters[0].load.filter(
        (el) => Number(el.semester) === Number(req.currentSemesters.first),
      )
      // Фільтрую всі дисципліни, які не читаються в 2 семестрі поточного року
      const secondSemesterSubjects = distributedLoadAllSemesters[0].load.filter(
        (el) => Number(el.semester) === Number(req.currentSemesters.second),
      )

      // Створюю оновлений об'єкти навантаження лише з дисциплінами 1 та 2 семестру поточного року
      distributedLoad.push({
        ...distributedLoadAllSemesters[0]._doc,
        load: [...firstSemesterSubjects, ...secondSemesterSubjects],
      })
    }

    const groupLoad = await GroupLoadSchema.findOne({ _id: req.body.groupLoadId }).populate('load').exec()
    const specializationSubjects = await SpecializationSubjectSchema.find({
      groupId: req.body.groupId,
    }) // ??
    const subgroups = await SubgroupsSchema.find({ groupId: req.body.groupId })
    const stream = await StreamsSchema.findById(req.body.streamId)

    const createDistributedLoad = () => {
      const deepCopy = JSON.parse(JSON.stringify(groupLoad))

      const load = deepCopy.load.map((el) => {
        const semestersKeys = Object.keys(el).filter((k) => k.includes('semester'))

        const subject = semestersKeys
          .map((k) => {
            if (el[k] !== null) {
              const semesterNumber = k.split('_')[1]

              // Перевірка чи співпадає поточний 1 семестр
              if (Number(semesterNumber) === Number(req.currentSemesters.first)) {
                return {
                  ...el[k],
                  name: el.name,
                  groupId: el.groupId,
                  semester: semesterNumber,
                  institutionId: req.body.institutionId,
                }
              }

              // Перевірка чи співпадає поточний 2 семестр
              if (Number(semesterNumber) === Number(req.currentSemesters.second)) {
                return {
                  ...el[k],
                  name: el.name,
                  groupId: el.groupId,
                  semester: semesterNumber,
                  institutionId: req.body.institutionId,
                }
              }
            }
          })
          .filter((ks) => ks !== undefined)

        return subject
      })

      const flatedLoad = load.flat(2)

      // Створюю об'єкти дисциплін та видаляю зайві поля
      const createSubjectTypes = (updatedSubject, type, hours) => {
        const subjectType =
          type === 'lectures'
            ? 'Лекції'
            : type === 'practical'
            ? 'Практичні'
            : type === 'laboratory'
            ? 'Лабораторні'
            : type === 'seminars'
            ? 'Семінари'
            : 'Екзамени'

        updatedSubject[type] = {
          type: subjectType,
          hours: hours,
          // students: group.students, !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          teacher: null,
          stream: null,
          subgroupNumber: null,
        }

        if (updatedSubject[type].hours <= 0) {
          delete updatedSubject[type]
        }

        // delete updatedSubject._id
        delete updatedSubject.inPlan
        delete updatedSubject.termPaper
        delete updatedSubject.individual
        // delete updatedSubject.semester
        delete updatedSubject.zalik

        return updatedSubject
      }

      // Функція для додавання інформації про підгрупи
      const createSubgrous = (updatedSubject, subgroup, type, hours) => {
        const subjectType =
          type === 'lectures'
            ? 'Лекції'
            : type === 'practical'
            ? 'Практичні'
            : type === 'laboratory'
            ? 'Лабораторні'
            : type === 'seminars'
            ? 'Семінари'
            : 'Екзамени'
        if (subgroup[type] !== null) {
          for (let i = 0; i < subgroup[type]; i++) {
            let subject = `${type}_${i + 1}`

            updatedSubject[subject] = {
              type: subjectType,
              hours: hours,
              teacher: null,
              stream: null,
              subgroupNumber: i + 1,
            }
          }

          delete updatedSubject[type]
        } else {
          createSubjectTypes(updatedSubject, type, hours)
        }

        return updatedSubject
      }

      // Створення підгруп
      const subjectWithSubgroups = flatedLoad.map((el) => {
        if (!subgroups.length) {
          createSubjectTypes(el, 'lectures', el.lectures)
          createSubjectTypes(el, 'practical', el.practical)
          createSubjectTypes(el, 'laboratory', el.laboratory)
          createSubjectTypes(el, 'seminars', el.seminars)
          createSubjectTypes(el, 'exams', el.exams)

          return el
        }

        const subject = subgroups.map((s) => {
          if (el.name === s.name && el.semester === s.semester) {
            const updatedSubject = {
              ...el,
              _id: el._id,
              name: el.name,
              groupId: el.groupId,
              semester: el.semester,
            }

            createSubgrous(updatedSubject, s, 'lectures', el.lectures)
            createSubgrous(updatedSubject, s, 'practical', el.practical)
            createSubgrous(updatedSubject, s, 'laboratory', el.laboratory)
            createSubgrous(updatedSubject, s, 'seminars', el.seminars)
            createSubgrous(updatedSubject, s, 'exams', el.exams)

            return updatedSubject
          }

          createSubjectTypes(el, 'lectures', el.lectures)
          createSubjectTypes(el, 'practical', el.practical)
          createSubjectTypes(el, 'laboratory', el.laboratory)
          createSubjectTypes(el, 'seminars', el.seminars)
          createSubjectTypes(el, 'exams', el.exams)

          return el
        })

        //

        return subject
      })

      const flutedSubjectWithSubgroups = subjectWithSubgroups.flat(2)

      // Створення Спеціалізованих груп
      const subjectWithSpecialization = flutedSubjectWithSubgroups.map((el) => {
        //
        if (!specializationSubjects.length) {
          return { ...el, specialization: null }
        }

        const specializatons = specializationSubjects.map((s) => {
          if (el.name === s.name && el.semester === s.semester) {
            return { ...el, specialization: s.specialization }
          }
          return { ...el, specialization: null }
        })

        return specializatons
        //
      })

      const flutedSubjectWithSpecialization = subjectWithSpecialization.flat(2)

      // Створення потоку
      const subjectsWithStreams = flutedSubjectWithSpecialization.map((el) => {
        if (!stream) {
          // ????????????????
          return el // ??????
        } // ????????????????

        if (!stream.details.length) {
          return el
        }

        const subjects = stream.details.map((s) => {
          if (el.name === s.name && el.semester === s.semester) {
            if (s.subgroupNumber !== null) {
              el[`${s.type}_${s.subgroupNumber}`].stream = {
                name: stream.name,
                streamId: stream._id,
                groups: stream.components.map((c) => c.groupId),
              }

              return el
            } else {
              el[s.type].stream = {
                name: stream.name,
                streamId: stream._id,
                groups: stream.components.map((c) => c.groupId),
              }
              return el
            }
          }

          return el
        })

        return subjects
      })

      const flutedSubjectsWithStreams = subjectsWithStreams.flat(2)

      // Додаю кількість студентів, що ходять на заняття
      const subjectsWithStudents = flutedSubjectsWithStreams.map((el) => {
        const keys = Object.keys(el)

        const subjectsData = {}

        keys.forEach((k) => {
          subjectTypes.forEach((type) => {
            if (k === type) {
              const newData = { ...el[k], students: group.students }

              subjectsData[k] = newData
            }
          })
        })

        const rest = {
          _id: el._id,
          groupId: el.groupId,
          institutionId: el.institutionId,
          name: el.name,
          semester: el.semester,
          specialization: el.specialization,
        }

        return { ...subjectsData, ...rest }
      })

      return subjectsWithStudents
    }

    const newDistributedLoad = createDistributedLoad(groupLoad)

    if (!!distributedLoad.length) {
      // Масив ід дисциплін, які потрібно оновити
      const updatedSubjects = []
      // Масив ід дисциплін, які були видалені
      const removedSubjects = []
      // Масив ід дисциплін, які були додані
      const addedSubjects = []

      // Копія масиву groupLoad для перевірки дисциплін, які були видалені
      const groupLoadCopy = JSON.parse(JSON.stringify(groupLoad))

      // Перетворення масиву groupLoad, щоб можна було порівняти семестр дисциплін
      const load = groupLoadCopy.load.map((el) => {
        const semestersKeys = Object.keys(el).filter((k) => k.includes('semester'))

        const subject = semestersKeys
          .map((k) => {
            if (el[k] !== null) {
              const semesterNumber = k.split('_')[1]

              return {
                ...el[k],
                groupId: el.groupId,
                name: el.name,
                semester: semesterNumber,
              }
            }
          })
          .filter((ks) => ks !== undefined)

        return subject
      })

      // Дисципліни старого плану
      const flatedLoad = load.flat(2)

      const maxLength = Math.max(distributedLoad[0].load.length, flatedLoad.length)

      // Пошук ід дисципліни, яка була видалена

      for (let i = 0; i < maxLength; i++) {
        if (distributedLoad[0].load[i] !== undefined) {
          const some = flatedLoad.some(
            (s) => s.name === distributedLoad[0].load[i].name && s.semester === distributedLoad[0].load[i].semester,
          )

          if (!some) {
            removedSubjects.push(distributedLoad[0].load[i]._id)
          } else {
            // Перевіряю чи немає обє'кта в масиві updatedSubjects
            const findedSubject = updatedSubjects.find((el) => {
              return el._id === String(distributedLoad[0].load[i]._id)
            })

            // Якщо цього елемента немає - додаю його до масиву
            if (!findedSubject) {
              updatedSubjects.push(distributedLoad[0].load[i])
              // updatedSubjects.push(flatedLoad[i]._id)
            }
          }
        }
      }

      // Пошук дисциплін, що були додані
      for (let i = 0; i < maxLength; i++) {
        if (flatedLoad[i] !== undefined) {
          const some = distributedLoad[0].load.some(
            (s) => s.name === flatedLoad[i].name && s.semester === flatedLoad[i].semester,
          )

          if (!some) {
            addedSubjects.push(flatedLoad[i]._id)
          }
        }
      }

      // Оновлюю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // Оновлюю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // Оновлюю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!

      // Масив дисциплін, які потрібно оновити
      const updatedSubjectsList = []

      updatedSubjects.forEach((el) => {
        const findedObj = newDistributedLoad.find((loadItem) => {
          return (
            String(loadItem.institutionId) === String(el.institutionId) &&
            String(loadItem.groupId) === String(el.groupId) &&
            loadItem.name === el.name &&
            loadItem.semester === el.semester
          )
        })

        if (findedObj) {
          updatedSubjectsList.push(findedObj)
        }
      })

      // // // // //
      // // // // //
      // // // // //
      Promise.all(
        updatedSubjectsList.map(async (el) => {
          const { _id, ...rest } = el

          subjectTypes.map(async (subjectType) => {
            // Якщо в новому навантаженні даний вид заняття є - оновлюю години, назву дисципліни, інф про потоки, номер підгрупи
            if (rest[subjectType]) {
              const hours = `${subjectType}.hours`
              const stream = `${subjectType}.stream`
              const subgroupNumber = `${subjectType}.subgroupNumber`

              await DistributedLoadSubjects.findOneAndUpdate(
                { name: el.name, semester: el.semester, groupId: el.groupId },
                {
                  name: rest.name,
                  specialization: rest.specialization,
                  [hours]: rest[subjectType].hours,
                  [stream]: rest[subjectType].stream,
                  [subgroupNumber]: rest[subjectType].subgroupNumber,
                },
              )
            } else {
              // Якщо в новому навантаженні даного виду заняття немає - вилаляю інф про дисциплігу, яка раніше була
              await DistributedLoadSubjects.findOneAndUpdate(
                { name: el.name, semester: el.semester, groupId: el.groupId },
                {
                  $unset: { [subjectType]: '' },
                },
              )
            }
          })
        }),
      )

      // // // // //
      // // // // //
      // // // // //

      // Видаляю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // Видаляю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // Видаляю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
      const removedSubjectsList = removedSubjects.filter((el) => el !== undefined)

      Promise.all(
        removedSubjectsList.map(async (el) => {
          DistributedLoadSubjects.deleteOne({ _id: el }, async (err, doc) => {
            if (err) {
              console.log(err)
              res.status(500).json({
                message: 'Не вдалося оновити навантаження',
              })
              return
            }
            if (!doc) {
              return res.status(404).json({
                message: 'Не вдалося оновити навантаження',
              })
            }
          })
        }),
      )

      // Створюю нові дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // Створюю нові дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // Створюю нові дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!

      // Масив ід нових дисциплін
      const newDistributedSubjectsId = []

      // Шукаю дисципліни, які було додано
      const addedSubjectsList = []

      addedSubjects.forEach((el) => {
        const findedObj = newDistributedLoad.find((loadItem) => loadItem._id === el)
        if (findedObj) {
          addedSubjectsList.push(findedObj)
        }
      })

      Promise.all(
        addedSubjectsList.map(async (el) => {
          const { _id, ...rest } = el
          const doc = new DistributedLoadSubjects({ ...rest, institutionId: req.body.institutionId })

          newDistributedSubjectsId.push(doc._id)

          await doc.save()
        }),
      )

      /* Оновлюю DistributedLoad */
      /* Оновлюю DistributedLoad */
      /* Оновлюю DistributedLoad */
      const distributedSubjects = await DistributedLoadSubjects.find({ groupId: req.body.groupId })

      const distributedSubjectsId = distributedSubjects.map((el) => el._id)

      await DistributedLoadSchema.findOneAndUpdate(
        { groupId: req.body.groupId },
        { load: [...distributedSubjectsId, ...newDistributedSubjectsId] },
      )

      const newLoad = await DistributedLoadSchema.findOne({ groupId: req.body.groupId }).populate('load').exec()

      const firstSemesterLoadArray = await DistributedLoadSubjects.find({
        groupId: req.body.groupId,
        semester: req.currentSemesters.first,
      })
        .populate(populate)
        .exec()

      const secondSemesterLoadArray = await DistributedLoadSubjects.find({
        groupId: req.body.groupId,
        semester: req.currentSemesters.second,
      })
        .populate(populate)
        .exec()

      res.json({ ...newLoad._doc, load: [...firstSemesterLoadArray, ...secondSemesterLoadArray] })

      /*  */
    } else {
      // Створюю всі дисципліни в DistributedLoadSubjects
      const distributedSubjectsId = []

      Promise.all(
        newDistributedLoad.map(async (el) => {
          const { _id, ...rest } = el
          const doc = new DistributedLoadSubjects({
            ...rest,
            institutionId: req.body.institutionId,
            currentShowedYear: req.body.currentShowedYear,
          })

          distributedSubjectsId.push(doc._id)

          await doc.save()
        }),
      )

      // Створюю DistributedLoad
      const doc = new DistributedLoadSchema({
        load: distributedSubjectsId,
        planId: groupLoad.planId,
        groupId: req.body.groupId,
        institutionId: req.body.institutionId,
      })

      await doc.save()

      const distributed = await DistributedLoadSchema.findById(doc._id).populate('load').exec()

      res.json(distributed)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалося оновити навантаження',
    })
  }
}

export const getDistributedTeacherLoad = async (req, res) => {
  try {
    const distributedSemesterLoad = await DistributedLoadSubjects.find({
      currentShowedYear: req.params.currentShowedYear,
    })

    // Дисципліни в різних семестрах ??????????????????????????????????
    // Дисципліни в різних семестрах ??????????????????????????????????
    // Дисципліни в різних семестрах ??????????????????????????????????

    const teacher = await TeachersSchema.findById(req.params.teacher)

    // Отримую ід на назви груп
    const groupList = []

    await Promise.all(
      distributedSemesterLoad.map(async (el) => {
        const group = await GroupSchema.findById(el.groupId)
        groupList.push({ _id: group._id, name: group.name })
      }),
    )

    // const distributedTeacherLoad = distributedSemesterLoad.map((el) => {
    //   const currentGroup = groupList.find((g) => {
    //     return String(g._id) === String(el.groupId)
    //   })

    //   const data = {
    //     _id: el._id,
    //     groupName: currentGroup.name,
    //     groupId: el.groupId,
    //     name: el.name,
    //     semester: el.semester,
    //   }

    //   // Додавання до об'єкта data виду заняття, в якому даний викладач закріплений
    //   subjectTypes.forEach((type) => {
    //     if (el[type] && String(el[type].teacher) === req.params.teacher) {
    //       data[type] = el[type]

    //       data[type].teacher = teacher
    //     }
    //   })

    //   const dataKeys = Object.keys(data)

    //   // Перевірка чи хоча б 1 вид занять був знайдений
    //   const isIncludesSubject = dataKeys.map((el) => {
    //     return subjectTypes.some((type) => {
    //       return type === el
    //     })
    //   })

    //   const some = isIncludesSubject.some((el) => el === true)

    //   if (some) {
    //     return data
    //   }

    //   return
    // })

    const { distributedTeacherLoad } = useGetDistributedTeacherLoad(
      distributedSemesterLoad,
      groupList,
      teacher,
      req.params.teacher,
    )

    const filtredDistributedTeacherLoad = distributedTeacherLoad.filter((el) => el !== undefined)

    console.log(filtredDistributedTeacherLoad)

    res.json(filtredDistributedTeacherLoad)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати навантаження викладача',
    })
  }
}

export const attachTeacher = async (req, res) => {
  try {
    Promise.all(
      req.body.map(async (el) => {
        const { subjectType, groupId, name, semester, ...rest } = el

        await DistributedLoadSubjects.findOneAndUpdate(
          { name: name, semester: semester, groupId: groupId },
          { $set: { [subjectType]: rest } },
        )
      }),
    )

    const distributedLoadSubject = await DistributedLoadSubjects.findOne({ _id: req.params.id })

    const updatedSubject = await DistributedLoadSubjects.findOne({
      name: req.body[0].name,
      semester: req.body[0].semester,
      groupId: req.params.id,
    }).populate(populate)

    res.json(updatedSubject)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалося оновити навантаження',
    })
  }
}

export const updateStudentsCount = async (req, res) => {
  try {
    const oldSubjectData = await DistributedLoadSubjects.findOne({ _id: req.params.id })

    const subjects = await DistributedLoadSubjects.findByIdAndUpdate(
      req.params.id,
      {
        [req.body.subjectType]: {
          ...oldSubjectData._doc[req.body.subjectType]._doc,
          students: req.body.students,
        },
      },
      { new: true },
    )
      .populate(populate)
      .exec()

    await LessonsSchema.updateMany(
      {
        groupId: req.body.groupId,
        name: req.body.name,
        semester: req.body.semester,
        subjectType: req.body.subjectType,
      },
      {
        students: req.body.students,
      },
    )

    res.json(subjects)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Не вдалось оновити кількість студентів' })
  }
}

// Promise.all(
//   updatedSubjectsList.map(async (el) => {
//     const { _id, ...rest } = el

//     subjectTypes.map(async (subjectType) => {
//       const presenceOfSubgroups = subjectType.includes('_')
//       const unsetType = subjectType.split('_')[0]

//       if (rest[subjectType]) {
//         console.log(presenceOfSubgroups, unsetType)

//         const hours = `${subjectType}.hours`
//         const stream = `${subjectType}.stream`
//         const subgroupNumber = `${subjectType}.subgroupNumber`

//         if (presenceOfSubgroups) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               [hours]: rest[subjectType].hours,
//               [stream]: rest[subjectType].stream,
//               [subgroupNumber]: rest[subjectType].subgroupNumber,
//             },
//             { $unset: unsetType },
//           )
//         } else {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               [hours]: rest[subjectType].hours,
//               [stream]: rest[subjectType].stream,
//               [subgroupNumber]: rest[subjectType].subgroupNumber,
//             },
//           )
//         }
//       }
//     })
//   }),
// )

// export const updateDistributedLoad = async (req, res) => {
//   const distributedLoad = await DistributedLoadSchema.find({ groupId: req.body.groupId }).populate('load').exec()

//   const groupLoad = await GroupLoadSchema.findOne({ _id: req.body.groupLoadId }).populate('load').exec()
//   const specializationSubjects = await SpecializationSubjectSchema.find({ groupId: req.body.groupId }) // ??
//   const subgroups = await SubgroupsSchema.find({ groupId: req.body.groupId })
//   const stream = await StreamsSchema.findById(req.body.streamId)

//   const createDistributedLoad = () => {
//     const deepCopy = JSON.parse(JSON.stringify(groupLoad))

//     const load = deepCopy.load.map((el) => {
//       const semestersKeys = Object.keys(el).filter((k) => k.includes('semester'))

//       const subject = semestersKeys
//         .map((k) => {
//           if (el[k] !== null) {
//             const semesterNumber = k.split('_')[1]

//             return {
//               ...el[k],
//               groupId: el.groupId,
//               name: el.name,
//               semester: semesterNumber,
//             }
//           }
//         })
//         .filter((ks) => ks !== undefined)

//       return subject
//     })

//     const flatedLoad = load.flat(2)

//     // Створюю об'єкти дисциплін та видаляю зайві поля
//     const createSubjectTypes = (updatedSubject, type, hours) => {
//       const subjectType =
//         type === 'lectures'
//           ? 'Лекції'
//           : type === 'practical'
//           ? 'Практичні'
//           : type === 'laboratory'
//           ? 'Лабораторні'
//           : type === 'seminars'
//           ? 'Семінари'
//           : 'Екзамени'

//       updatedSubject[type] = {
//         type: subjectType,
//         hours: hours,
//         teacher: null,
//         stream: null,
//         subgroupNumber: null,
//       }

//       if (updatedSubject[type].hours <= 0) {
//         delete updatedSubject[type]
//       }

//       // delete updatedSubject._id
//       delete updatedSubject.inPlan
//       delete updatedSubject.termPaper
//       delete updatedSubject.individual
//       // delete updatedSubject.semester
//       delete updatedSubject.zalik

//       return updatedSubject
//     }

//     // Функція для додавання інформації про підгрупи
//     const createSubgrous = (updatedSubject, subgroup, type, hours) => {
//       const subjectType =
//         type === 'lectures'
//           ? 'Лекції'
//           : type === 'practical'
//           ? 'Практичні'
//           : type === 'laboratory'
//           ? 'Лабораторні'
//           : type === 'seminars'
//           ? 'Семінари'
//           : 'Екзамени'
//       if (subgroup[type] !== null) {
//         for (let i = 0; i < subgroup[type]; i++) {
//           let subject = `${type}_${i + 1}`

//           updatedSubject[subject] = {
//             type: subjectType,
//             hours: hours,
//             teacher: null,
//             stream: null,
//             subgroupNumber: i + 1,
//           }
//         }

//         delete updatedSubject[type]
//       } else {
//         createSubjectTypes(updatedSubject, type, hours)
//       }

//       return updatedSubject
//     }

//     // Створення підгруп
//     const subjectWithSubgroups = flatedLoad.map((el) => {
//       if (!subgroups.length) {
//         createSubjectTypes(el, 'lectures', el.lectures)
//         createSubjectTypes(el, 'practical', el.practical)
//         createSubjectTypes(el, 'laboratory', el.laboratory)
//         createSubjectTypes(el, 'seminars', el.seminars)
//         createSubjectTypes(el, 'exams', el.exams)

//         return el
//       }

//       const subject = subgroups.map((s) => {
//         if (el.name === s.name && el.semester === s.semester) {
//           const updatedSubject = {
//             ...el,
//             _id: el._id,
//             name: el.name,
//             groupId: el.groupId,
//             semester: el.semester,
//           }

//           createSubgrous(updatedSubject, s, 'lectures', el.lectures)
//           createSubgrous(updatedSubject, s, 'practical', el.practical)
//           createSubgrous(updatedSubject, s, 'laboratory', el.laboratory)
//           createSubgrous(updatedSubject, s, 'seminars', el.seminars)
//           createSubgrous(updatedSubject, s, 'exams', el.exams)

//           return updatedSubject
//         }

//         createSubjectTypes(el, 'lectures', el.lectures)
//         createSubjectTypes(el, 'practical', el.practical)
//         createSubjectTypes(el, 'laboratory', el.laboratory)
//         createSubjectTypes(el, 'seminars', el.seminars)
//         createSubjectTypes(el, 'exams', el.exams)

//         return el
//       })

//       //

//       return subject
//     })

//     const flutedSubjectWithSubgroups = subjectWithSubgroups.flat(2)

//     // Створення Спеціалізованих груп
//     const subjectWithSpecialization = flutedSubjectWithSubgroups.map((el) => {
//       //
//       if (!specializationSubjects.length) {
//         return { ...el, specialization: null }
//       }

//       const specializatons = specializationSubjects.map((s) => {
//         if (el.name === s.name && el.semester === s.semester) {
//           return { ...el, specialization: s.specialization }
//         }
//         return { ...el, specialization: null }
//       })

//       return specializatons
//       //
//     })

//     const flutedSubjectWithSpecialization = subjectWithSpecialization.flat(2)

//     // Створення потоку
//     const subjectsWithStreams = flutedSubjectWithSpecialization.map((el) => {
//       if (!stream) {
//         // ????????????????
//         return el // ??????
//       } // ????????????????

//       if (!stream.details.length) {
//         return el
//       }

//       const subjects = stream.details.map((s) => {
//         if (el.name === s.name && el.semester === s.semester) {
//           if (s.subgroupNumber !== null) {
//             el[`${s.type}_${s.subgroupNumber}`].stream = {
//               name: stream.name,
//               streamId: stream._id,
//               groups: stream.components.map((c) => c.groupId),
//             }

//             return el
//           } else {
//             el[s.type].stream = {
//               name: stream.name,
//               streamId: stream._id,
//               groups: stream.components.map((c) => c.groupId),
//             }
//             return el
//           }
//         }

//         return el
//       })

//       return subjects
//     })

//     const flutedSubjectsWithStreams = subjectsWithStreams.flat(2)

//     return flutedSubjectsWithStreams
//   }

//   const newDistributedLoad = createDistributedLoad(groupLoad)

//   if (!!distributedLoad.length) {
//     // Масив ід дисциплін, які потрібно оновити
//     const updatedSubjects = []
//     // Масив ід дисциплін, які були видалені
//     const removedSubjects = []
//     // Масив ід дисциплін, які були додані
//     const addedSubjects = []

//     // Копія масиву groupLoad для перевырки дисциплін, які були видалені
//     const groupLoadCopy = JSON.parse(JSON.stringify(groupLoad))

//     // Перетворення масиву groupLoad, щоб можна було порівняти семестр дисциплін
//     const load = groupLoadCopy.load.map((el) => {
//       const semestersKeys = Object.keys(el).filter((k) => k.includes('semester'))

//       const subject = semestersKeys
//         .map((k) => {
//           if (el[k] !== null) {
//             const semesterNumber = k.split('_')[1]

//             return {
//               ...el[k],
//               groupId: el.groupId,
//               name: el.name,
//               semester: semesterNumber,
//             }
//           }
//         })
//         .filter((ks) => ks !== undefined)

//       return subject
//     })

//     // Дисципліни старого плану
//     const flatedLoad = load.flat(2)

//     const maxLength = Math.max(distributedLoad[0].load.length, flatedLoad.length)

//     // Пошук ід дисципліни, яка була видалена

//     for (let i = 0; i < maxLength; i++) {
//       if (distributedLoad[0].load[i] !== undefined) {
//         const some = flatedLoad.some(
//           (s) => s.name === distributedLoad[0].load[i].name && s.semester === distributedLoad[0].load[i].semester,
//         )

//         if (!some) {
//           removedSubjects.push(distributedLoad[0].load[i]._id)
//         } else {
//           // Перевіряю чи немає обє'кта в масиві updatedSubjects
//           const findedSubject = updatedSubjects.find((el) => {
//             return el === String(distributedLoad[0].load[i]._id)
//           })

//           // Якщо цього елемента немає - додаю його до масиву
//           if (!findedSubject) {
//             updatedSubjects.push(distributedLoad[0].load[i]._id)
//             // updatedSubjects.push(flatedLoad[i]._id)
//           }
//         }
//       }
//     }

//     // Пошук дисциплін, що були додані
//     for (let i = 0; i < maxLength; i++) {
//       if (flatedLoad[i] !== undefined) {
//         const some = distributedLoad[0].load.some(
//           (s) => s.name === flatedLoad[i].name && s.semester === flatedLoad[i].semester,
//         )

//         if (!some) {
//           addedSubjects.push(flatedLoad[i]._id)
//         }
//       }
//     }

//     // Оновлюю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     // Оновлюю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     // Оновлюю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!

//     // Масив дисциплін, які потрібно оновити
//     const updatedSubjectsList = []

//     updatedSubjects.forEach((el) => {
//       const findedObj = newDistributedLoad.find((loadItem) => String(loadItem._id) === String(el))
//       if (findedObj) {
//         updatedSubjectsList.push(findedObj)
//       }
//     })

//     Promise.all(
//       updatedSubjectsList.map(async (el) => {
//         const { _id, ...rest } = el

//         if (rest.lectures) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'lectures.hours': rest.lectures.hours,
//               'lectures.stream': rest.lectures.stream,
//               'lectures.subgroupNumber': rest.lectures.subgroupNumber,
//             },
//           )
//         }
//         if (rest.lectures_1) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'lectures_1.hours': rest.lectures_1.hours,
//               'lectures_1.stream': rest.lectures_1.stream,
//               'lectures_1.subgroupNumber': rest.lectures_1.subgroupNumber,
//             },
//             { $unset: 'lectures' },
//           )
//         }
//         if (rest.lectures_2) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'lectures_2.hours': rest.lectures_2.hours,
//               'lectures_2.stream': rest.lectures_2.stream,
//               'lectures_2.subgroupNumber': rest.lectures_2.subgroupNumber,
//             },
//           )
//         }
//         if (rest.lectures_3) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'lectures_3.hours': rest.lectures_3.hours,
//               'lectures_3.stream': rest.lectures_3.stream,
//               'lectures_3.subgroupNumber': rest.lectures_3.subgroupNumber,
//             },
//           )
//         }
//         if (rest.lectures_4) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'lectures_4.hours': rest.lectures_4.hours,
//               'lectures_4.stream': rest.lectures_4.stream,
//               'lectures_4.subgroupNumber': rest.lectures_4.subgroupNumber,
//             },
//           )
//         }

//         if (rest.practical) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'practical.hours': rest.practical.hours,
//               'practical.stream': rest.practical.stream,
//               'practical.subgroupNumber': rest.practical.subgroupNumber,
//             },
//           )
//         }
//         if (rest.practical_1) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'practical_1.hours': rest.practical_1.hours,
//               'practical_1.stream': rest.practical_1.stream,
//               'practical_1.subgroupNumber': rest.practical_1.subgroupNumber,
//             },
//             { $unset: 'practical' },
//           )
//         }
//         if (rest.practical_2) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'practical_2.hours': rest.practical_2.hours,
//               'practical_2.stream': rest.practical_2.stream,
//               'practical_2.subgroupNumber': rest.practical_2.subgroupNumber,
//             },
//           )
//         }
//         if (rest.practical_3) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'practical_3.hours': rest.practical_3.hours,
//               'practical_3.stream': rest.practical_3.stream,
//               'practical_3.subgroupNumber': rest.practical_3.subgroupNumber,
//             },
//           )
//         }
//         if (rest.practical_4) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'practical_4.hours': rest.practical_4.hours,
//               'practical_4.stream': rest.practical_4.stream,
//               'practical_4.subgroupNumber': rest.practical_4.subgroupNumber,
//             },
//           )
//         }

//         if (rest.laboratory) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'laboratory.hours': rest.laboratory.hours,
//               'laboratory.stream': rest.laboratory.stream,
//               'laboratory.subgroupNumber': rest.laboratory.subgroupNumber,
//             },
//           )
//         }
//         if (rest.laboratory_1) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'laboratory_1.hours': rest.laboratory_1.hours,
//               'laboratory_1.stream': rest.laboratory_1.stream,
//               'laboratory_1.subgroupNumber': rest.laboratory_1.subgroupNumber,
//             },
//             { $unset: 'laboratory' },
//           )
//         }
//         if (rest.laboratory_2) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'laboratory_2.hours': rest.laboratory_2.hours,
//               'laboratory_2.stream': rest.laboratory_2.stream,
//               'laboratory_2.subgroupNumber': rest.laboratory_2.subgroupNumber,
//             },
//           )
//         }
//         if (rest.laboratory_3) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'laboratory_3.hours': rest.laboratory_3.hours,
//               'laboratory_3.stream': rest.laboratory_3.stream,
//               'laboratory_3.subgroupNumber': rest.laboratory_3.subgroupNumber,
//             },
//           )
//         }
//         if (rest.laboratory_4) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'laboratory_4.hours': rest.laboratory_4.hours,
//               'laboratory_4.stream': rest.laboratory_4.stream,
//               'laboratory_4.subgroupNumber': rest.laboratory_4.subgroupNumber,
//             },
//           )
//         }

//         if (rest.seminars) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'seminars.hours': rest.seminars.hours,
//               'seminars.stream': rest.seminars.stream,
//               'seminars.subgroupNumber': rest.seminars.subgroupNumber,
//             },
//           )
//         }
//         if (rest.seminars_1) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'seminars_1.hours': rest.seminars_1.hours,
//               'seminars_1.stream': rest.seminars_1.stream,
//               'seminars_1.subgroupNumber': rest.seminars_1.subgroupNumber,
//             },
//             { $unset: 'seminars' },
//           )
//         }
//         if (rest.seminars_2) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'seminars_2.hours': rest.seminars_2.hours,
//               'seminars_2.stream': rest.seminars_2.stream,
//               'seminars_2.subgroupNumber': rest.seminars_2.subgroupNumber,
//             },
//           )
//         }
//         if (rest.seminars_3) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'seminars_3.hours': rest.seminars_3.hours,
//               'seminars_3.stream': rest.seminars_3.stream,
//               'seminars_3.subgroupNumber': rest.seminars_3.subgroupNumber,
//             },
//           )
//         }
//         if (rest.seminars_4) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'seminars_4.hours': rest.seminars_4.hours,
//               'seminars_4.stream': rest.seminars_4.stream,
//               'seminars_4.subgroupNumber': rest.seminars_4.subgroupNumber,
//             },
//           )
//         }

//         if (rest.exams) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'exams.hours': rest.exams.hours,
//               'exams.stream': rest.exams.stream,
//               'exams.subgroupNumber': rest.exams.subgroupNumber,
//             },
//           )
//         }
//         if (rest.exams_1) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'exams_1.hours': rest.exams_1.hours,
//               'exams_1.stream': rest.exams_1.stream,
//               'exams_1.subgroupNumber': rest.exams_1.subgroupNumber,
//             },
//             { $unset: 'exams' },
//           )
//         }
//         if (rest.exams_2) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'exams_2.hours': rest.exams_2.hours,
//               'exams_2.stream': rest.exams_2.stream,
//               'exams_2.subgroupNumber': rest.exams_2.subgroupNumber,
//             },
//           )
//         }
//         if (rest.exams_3) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'exams_3.hours': rest.exams_3.hours,
//               'exams_3.stream': rest.exams_3.stream,
//               'exams_3.subgroupNumber': rest.exams_3.subgroupNumber,
//             },
//           )
//         }
//         if (rest.exams_4) {
//           await DistributedLoadSubjects.findOneAndUpdate(
//             { name: el.name, semester: el.semester, groupId: el.groupId },
//             {
//               name: rest.name,
//               specialization: rest.specialization,
//               'exams_4.hours': rest.exams_4.hours,
//               'exams_4.stream': rest.exams_4.stream,
//               'exams_4.subgroupNumber': rest.exams_4.subgroupNumber,
//             },
//           )
//         }
//       }),
//     )

//     // Видаляю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     // Видаляю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     // Видаляю дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     const removedSubjectsList = removedSubjects.filter((el) => el !== undefined)

//     Promise.all(
//       removedSubjectsList.map(async (el) => {
//         DistributedLoadSubjects.deleteOne({ _id: el }, async (err, doc) => {
//           if (err) {
//             console.log(err)
//             res.status(500).json({
//               message: 'Не вдалося оновити навантаження',
//             })
//             return
//           }
//           if (!doc) {
//             return res.status(404).json({
//               message: 'Не вдалося оновити навантаження',
//             })
//           }
//         })
//       }),
//     )

//     // Створюю нові дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     // Створюю нові дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     // Створюю нові дисципліни !!!!!!!!!!!!!!!!!!!!!!!!!!!!

//     // Масив ід нових дисциплін
//     const newDistributedSubjectsId = []

//     // Шукаю дисципліни, які було додано
//     const addedSubjectsList = []

//     addedSubjects.forEach((el) => {
//       const findedObj = newDistributedLoad.find((loadItem) => loadItem._id === el)
//       if (findedObj) {
//         addedSubjectsList.push(findedObj)
//       }
//     })

//     Promise.all(
//       addedSubjectsList.map(async (el) => {
//         const doc = new DistributedLoadSubjects({ ...el, institutionId: req.body.institutionId })

//         newDistributedSubjectsId.push(doc._id)

//         await doc.save()
//       }),
//     )

//     /* Оновлюю DistributedLoad */
//     /* Оновлюю DistributedLoad */
//     /* Оновлюю DistributedLoad */
//     const distributedSubjects = await DistributedLoadSubjects.find({ groupId: req.body.groupId })

//     const distributedSubjectsId = distributedSubjects.map((el) => el._id)

//     await DistributedLoadSchema.findOneAndUpdate(
//       { groupId: req.body.groupId },
//       { load: [...distributedSubjectsId, ...newDistributedSubjectsId] },
//     )

//     const newLoad = await DistributedLoadSchema.findOne({ groupId: req.body.groupId }).populate('load').exec()

//     const loadArray = await DistributedLoadSubjects.find({ groupId: req.body.groupId })
//       .populate([
//         'lectures.teacher',
//         'lectures_1.teacher',
//         'lectures_2.teacher',
//         'lectures_3.teacher',
//         'lectures_4.teacher',
//         'practical.teacher',
//         'practical_1.teacher',
//         'practical_2.teacher',
//         'practical_3.teacher',
//         'practical_4.teacher',
//         'laboratory.teacher',
//         'laboratory_1.teacher',
//         'laboratory_2.teacher',
//         'laboratory_3.teacher',
//         'laboratory_4.teacher',
//         'seminars.teacher',
//         'seminars_1.teacher',
//         'seminars_2.teacher',
//         'seminars_3.teacher',
//         'seminars_4.teacher',
//         'exams.teacher',
//         'exams_1.teacher',
//         'exams_2.teacher',
//         'exams_3.teacher',
//         'exams_4.teacher',
//       ])
//       .exec()

//     res.json({ ...newLoad._doc, load: loadArray })

//     /*  */
//   } else {
//     // Створюю всі дисципліни в DistributedLoadSubjects
//     // Створюю всі дисципліни в DistributedLoadSubjects
//     // Створюю всі дисципліни в DistributedLoadSubjects
//     const distributedSubjectsId = []

//     Promise.all(
//       newDistributedLoad.map(async (el) => {
//         const doc = new DistributedLoadSubjects({ ...el, institutionId: req.body.institutionId })

//         distributedSubjectsId.push(doc._id)

//         await doc.save()
//       }),
//     )

//     // Створюю DistributedLoad
//     const doc = new DistributedLoadSchema({
//       load: distributedSubjectsId,
//       planId: groupLoad.planId,
//       groupId: req.body.groupId,
//       institutionId: req.body.institutionId,
//     })

//     await doc.save()

//     const distributed = await DistributedLoadSchema.findById(doc._id).populate('load').exec()

//     res.json(distributed)
//   }

//   try {
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({
//       message: 'Не вдалося оновити навантаження',
//     })
//   }
// }
