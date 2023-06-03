import SubjectSchema from '../models/Subjects.js'
import GroupSchema from '../models/GroupSchema.js'
import StreamsSchema from '../models/StreamsSchema.js'
import SpecialtySchema from '../models/SpecialtySchema.js'
import SubgroupsSchema from '../models/SubgroupsSchema.js'
import GroupLoadSchema from '../models/GroupLoadSchema.js'
import EducationPlanSchema from '../models/EducationPlans.js'
import { subjectTypes } from './DistributedLoadController.js'
import GroupLoadSubjectSchema from '../models/GroupLoadSubjectSchema.js'
import { DistributedLoadSubjects } from '../models/DistributedLoadSchema.js'
import SpecializationSubjectSchema from '../models/SpecializationSubjectSchema.js'
import LessonsSchema from '../models/LessonsSchema.js'

export const getGroups = async (req, res) => {
  try {
    const groups = await GroupSchema.find({
      specialtyId: req.params.specialtyId,
    })

    res.json(groups)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати групи',
    })
  }
}

export const getAllFacultyGroups = async (req, res) => {
  try {
    const specialties = await SpecialtySchema.find({ facultieId: req.params.facultieId })

    let groupsList = []

    await Promise.all(
      specialties.map(async (el) => {
        const group = await GroupSchema.find({
          specialtyId: el._id,
        })

        if (group.length > 0) {
          groupsList = [...groupsList, ...group]
        }
      }),
    )

    res.json(groupsList)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати групи',
    })
  }
}

export const getGroupById = async (req, res) => {
  try {
    const group = await GroupSchema.findById(req.params.id)
      .populate(['specializationsSubjects', 'subgroups', 'streams'])
      .exec()

    const groupLoad = await GroupLoadSchema.findOne({ groupId: req.params.id }).populate('load').exec()

    res.json({ ...group._doc, groupLoad })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати групу',
    })
  }
}

export const createGroup = async (req, res) => {
  try {
    const educationalPlan = await EducationPlanSchema.findById(req.body.EducationPlanId)

    /* створення групи */
    const doc = new GroupSchema({
      name: req.body.name,
      students: req.body.students,
      specialtyId: req.body.specialtyId,
      courseNumber: req.body.courseNumber,
      institutionId: req.body.institutionId,
      EducationPlanId: req.body.EducationPlanId,
      yearOfAdmission: req.body.yearOfAdmission,
      formOfEducations: req.body.formOfEducations,
    })

    /* додавання ід групи в масив груп спеціальності */

    const specialty = await SpecialtySchema.findById(req.body.specialtyId)

    if (specialty) {
      specialty.groups.push(doc._id)
      await specialty.save()
    } else {
      res.status(500).json({
        message: 'some error',
      })
      return
    }

    await doc.save()

    /* створення навантаження групи відповідно до обраного навчального плану */
    const subjectArrays = educationalPlan.subjects.map((el) => el)

    const loadDoc = new GroupLoadSchema({
      groupId: doc._id,
      planId: req.body.EducationPlanId,
      load: subjectArrays,
    })

    /* створення списку дисциплін, що знаходились в вибраному плані */
    const groupLoad = await loadDoc.save()

    await Promise.all(
      groupLoad.load.map(async (el) => {
        const subject = await SubjectSchema.findById(el)

        const { _id, ...rest } = subject._doc

        if (subject) {
          const loadDoc = new GroupLoadSubjectSchema({ ...rest, groupId: doc._id })
          loadDoc.isNew = true
          await loadDoc.save()
        }
      }),
    )
    /* оновлення групи актуальним навантаженням  */

    await GroupSchema.updateOne(
      { _id: doc._id },
      {
        groupLoad,
      },
    )

    /* оновлення масиву навантаження   */
    const groupSubjectsList = await GroupLoadSubjectSchema.find({ groupId: doc._id })

    const groupsIdArray = groupSubjectsList.map((el) => el._id)

    await GroupLoadSchema.updateOne(
      { groupId: doc._id },
      {
        load: groupsIdArray,
      },
    )

    /* повернення об'єкту групи разом з загальним навантаженням на фронтенд */

    const finalGroup = await GroupSchema.findById(doc._id).populate('groupLoad').exec()

    const finalGroupLoad = await GroupLoadSchema.findById(groupLoad._id).populate('load').exec()

    res.json({ ...finalGroup._doc, groupLoad: finalGroupLoad })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось створити групу',
    })
  }
}

export const removeGroup = async (req, res) => {
  try {
    GroupSchema.findByIdAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити групу',
        })
        return
      }

      if (!doc) {
        console.log(err)
        res.status(404).json({
          message: 'Не вдалось знайти групу',
        })
        return
      }

      res.json({
        id: req.params.id,
      })
    })

    GroupLoadSchema.findOneAndDelete({ groupId: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити навантаження групи',
        })
        return
      }

      if (!doc) {
        console.log(err)
        res.status(404).json({
          message: 'Не вдалось знайти навантаження групи',
        })
        return
      }

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
    })

    // StreamsSchema.findById('')
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити групу',
    })
  }
}

export const updateGroupInfo = async (req, res) => {
  try {
    const group = await GroupSchema.findOneAndUpdate(
      { _id: req.params.id },
      {
        name: req.body.name,
        specialtyId: req.body.specialtyId,
        yearOfAdmission: req.body.yearOfAdmission,
        courseNumber: req.body.courseNumber,
        students: req.body.students,
        formOfEducations: req.body.formOfEducations,
      },
    )

    // Оновлюю ім'я групи в потоці
    Promise.all(
      group.streams.map(async (el) => {
        const stream = await StreamsSchema.findOne({ _id: el })

        if (stream) {
          const updatedStreamComponent = stream.components.map((component) => {
            if (String(component.groupId) === String(group._id)) {
              return { ...component._doc, name: req.body.name }
            } else {
              return component
            }
          })

          await StreamsSchema.updateOne(
            { _id: el },
            {
              components: updatedStreamComponent,
            },
          )
        }
      }),
    )

    // Онолюю кількість студентів
    const distrubutedLoadSubjects = await DistributedLoadSubjects.find({ groupId: req.params.id })

    Promise.all(
      distrubutedLoadSubjects.map(async (el) => {
        // Якщо до дисципліни не прикріплена спец. підгрупа - оновлюю к-ть студентів
        if (el.specialization === null) {
          const currentElement = el._doc

          const keys = Object.keys(currentElement)

          const subjectsData = {}

          keys.map(async (k) => {
            subjectTypes.map(async (type) => {
              if (k === type) {
                // Якщо до дисципліна не об'єднана в потік та не має підгруп - оновлюю к-ть студентів
                if (currentElement[k].stream === null && currentElement[k].subgroupNumber === null) {
                  const newData = { ...currentElement[k]._doc, students: req.body.students }

                  await DistributedLoadSubjects.updateOne({ _id: currentElement._id }, { [k]: newData })

                  subjectsData[k] = newData

                  //
                  //
                  // Оновлюю к-ть студентів в виставлених дисциплінах
                  //
                  //
                  let semester

                  if (Number(req.body.courseNumber) === 1) {
                    semester = [1, 2]
                  }
                  if (Number(req.body.courseNumber) === 2) {
                    semester = [3, 4]
                  }
                  if (Number(req.body.courseNumber) === 3) {
                    semester = [5, 6]
                  }
                  if (Number(req.body.courseNumber) === 4) {
                    semester = [7, 8]
                  }

                  // Оновлюю к-ть студентів в виставлених дисциплінах 1 семестру
                  await LessonsSchema.updateMany(
                    {
                      groupId: req.params.id,
                      name: el.name,
                      semester: semester[0],
                      subjectType: k,
                    },
                    {
                      students: req.body.students,
                    },
                  )

                  // Оновлюю к-ть студентів в виставлених дисциплінах 2 семестру
                  await LessonsSchema.updateMany(
                    {
                      groupId: req.params.id,
                      name: el.name,
                      semester: semester[1],
                      subjectType: k,
                    },
                    {
                      students: req.body.students,
                    },
                  )

                  //
                  //
                  //
                }
              }
            })
          })
        }
      }),
    )

    const newGroup = await GroupSchema.findById(req.params.id)

    const groupLoad = await GroupLoadSchema.findOne({ groupId: req.params.id }).populate('load').exec()

    res.json({ ...newGroup._doc, groupLoad })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити групу',
    })
  }
}

export const updateGroupLoad = async (req, res) => {
  try {
    const groupLoad = await GroupLoadSchema.findOne({ groupId: req.params.id })

    if (req.body.planId !== groupLoad.planId) {
      GroupLoadSubjectSchema.deleteMany({ groupId: req.body.groupId }, (err, doc) => {
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

      if (req.body.load) {
        const subjectIdList = []

        await Promise.all(
          req.body.load.map(async (el) => {
            const subject = await SubjectSchema.findById(el)
            if (subject) {
              const { _id, ...rest } = subject._doc

              const doc = new GroupLoadSubjectSchema({ ...rest, groupId: req.body.groupId })
              doc.isNew = true

              subjectIdList.push(doc._id)
              await doc.save()
            }
          }),
        )

        await GroupLoadSchema.updateOne(
          { groupId: req.params.id },
          {
            planId: req.body.planId,
            load: subjectIdList,
          },
        )
      } else {
        console.log(`req.body.load довжина масиву === 0 або дані передано не коректно`)
      }

      const finalGroulLoad = await GroupLoadSchema.findOne({ groupId: req.body.groupId }).populate('load').exec()

      await GroupSchema.updateOne(
        { _id: req.params.id },
        {
          EducationPlanId: req.body.planId,
          groupLoad: finalGroulLoad._id,
        },
      )

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

/* specialization list */
export const addGroupSpecialization = async (req, res) => {
  const group = await GroupSchema.findById(req.params.id)

  await GroupSchema.updateOne(
    { _id: req.params.id },
    {
      specializationsList: [...group.specializationsList, { name: req.body.name }],
    },
  )

  const newGroup = await GroupSchema.findById(req.params.id)

  res.json(newGroup.specializationsList)

  try {
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось створити спеціалізацію',
    })
  }
}

export const updateGroupSpecialization = async (req, res) => {
  try {
    const group = await GroupSchema.findById(req.params.id)
    if (group) {
      const newSpecialization = group.specializationsList.map((el) => {
        if (String(el._id) === req.body._id) {
          return {
            name: req.body.name,
            _id: el._id,
          }
        }
        return el
      })

      await GroupSchema.updateOne(
        { _id: req.params.id },
        {
          specializationsList: newSpecialization,
        },
      )
    }

    const updatedGroup = await GroupSchema.findById(req.params.id)

    res.json(updatedGroup.specializationsList)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити спеціалізацію',
    })
  }
}

export const removeGroupSpecialization = async (req, res) => {
  try {
    const group = await GroupSchema.findById(req.params.id)

    if (group) {
      const newSpecialization = group.specializationsList.filter((el) => String(el._id) !== String(req.body._id))

      await GroupSchema.updateOne(
        { _id: req.params.id },
        {
          specializationsList: newSpecialization,
        },
      )
    }

    const updatedGroup = await GroupSchema.findById(req.params.id)

    res.json(updatedGroup.specializationsList)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити спеціалізацію',
    })
  }
}
/* //specialization list */

/* specialization subjects */
export const addSpecializationSubjects = async (req, res) => {
  try {
    const doc = new SpecializationSubjectSchema({
      groupId: req.body.groupId,
      institutionId: req.body.institutionId,
      specialization: req.body.specialization,
      name: req.body.name,
      semester: req.body.semester,
      lectures: req.body.lectures,
      practical: req.body.practical,
      laboratory: req.body.laboratory,
      seminars: req.body.seminars,
      termPaper: req.body.termPaper,
      individual: req.body.individual,
      inPlan: req.body.inPlan,
      exams: req.body.exams,
      zalik: req.body.zalik,
    })

    const findedGroup = await GroupSchema.findById(req.params.id)

    if (findedGroup) {
      findedGroup.specializationsSubjects.push(doc._id)

      await findedGroup.save()
    }

    const specializationSubject = await doc.save()

    res.json(specializationSubject)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось додати спеціалізацію',
    })
  }
}

export const removeSpecializationSubject = async (req, res) => {
  try {
    SpecializationSubjectSchema.findByIdAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити спеціалізацію',
        })
        return
      }

      if (!doc) {
        console.log(err)
        res.status(404).json({
          message: 'Не вдалось знайти спеціалізацію',
        })
        return
      }
    })

    const group = await GroupSchema.findById(req.params.groupId)
    if (group) {
      const newSpecializationSubject = group.specializationsSubjects.filter((el) => String(el) !== req.params.id)

      await GroupSchema.updateOne(
        { _id: req.params.groupId },
        {
          specializationsSubjects: newSpecializationSubject,
        },
      )
    }

    res.json({
      _id: req.params.id,
      groupId: req.params.groupId,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити спеціалізацію',
    })
  }
}

export const updateSpecializationSubjects = async (req, res) => {
  await SpecializationSubjectSchema.updateOne(
    { _id: req.params.id },
    {
      specialization: req.body,
    },
  )

  res.json({
    specializationId: req.params.id,
    _id: req.body._id,
    name: req.body.name,
  })

  try {
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити спеціалізацію',
    })
  }
}
/* //specialization subjects */

/* subgroups */
export const getSubgroups = async (req, res) => {
  try {
    const subgroups = await SubgroupsSchema.find({ groupId: req.params.groupId })

    res.json(subgroups)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось отримати підгрупи',
    })
  }
}

export const addSubgroups = async (req, res) => {
  try {
    /*  */
    const group = await GroupSchema.findById(req.params.id)

    // Якщо обрано 1 дисципліну, що потрібно розбити на підгрупи
    if (req.body.length === 1) {
      const { _id, ...rest } = req.body[0]

      const doc = new SubgroupsSchema({ ...rest })
      // Замінив new SubgroupsSchema({ ...req.body[0] }) на new SubgroupsSchema({ ...rest })

      if (group) {
        await GroupSchema.updateOne(
          { _id: req.params.id },
          {
            subgroups: [...group.subgroups, doc._id],
          },
        )
      }

      const subgroups = await doc.save()

      res.json([subgroups])
      /*  */
    } else {
      // Якщо було обрано декілька дисциплін, що потрібно розбити на підгрупи
      /*  */
      let subgroups = []

      await Promise.all(
        req.body.map(async (el) => {
          const doc = new SubgroupsSchema({ ...el })

          const subgroupItem = await doc.save()

          subgroups.push(subgroupItem)
        }),
      )

      if (group) {
        await GroupSchema.updateOne(
          { _id: req.params.id },
          {
            subgroups: [...group.subgroups, ...subgroups],
          },
        )
      }

      res.json(subgroups)
      /*  */
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось розбити дисципліну на підгрупи :(',
    })
  }
}

export const removeSubgroups = async (req, res) => {
  try {
    const group = await GroupSchema.findById(req.params.id)

    if (group) {
      const newSubgroups = group.subgroups.filter((el) => String(el) !== req.params.subgroupId)

      await GroupSchema.updateOne(
        { _id: req.params.id },
        {
          subgroups: newSubgroups,
        },
      )
    } else {
      return
    }

    SubgroupsSchema.findByIdAndDelete({ _id: req.params.subgroupId }, async (err, doc) => {
      if (err) {
        res.status(500).json({
          message: 'Не вдалось видалити підгрупу',
        })
        return
      } else if (!doc) {
        res.status(404).json({
          message: 'Не вдалось знайти підгрупу',
        })
        return
      } else {
        res.json({ _id: req.params.id, subgroupId: req.params.subgroupId })
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Не вдалось видалити підгрупи :(',
    })
  }
}

export const updateSubgroups = async (req, res) => {
  try {
    if (req.body.length === 1) {
      await SubgroupsSchema.updateOne(
        { _id: req.body[0]._id },
        {
          ...req.body[0],
        },
      )

      const subgroup = await SubgroupsSchema.findById(req.body[0]._id)

      res.json(subgroup)
    } else {
      await Promise.all(
        req.body.map(async (el) => {
          await SubgroupsSchema.updateOne(
            { _id: el._id },
            {
              ...el,
            },
          )
        }),
      )

      let subgroups = []

      await Promise.all(
        req.body.map(async (el) => {
          const item = await SubgroupsSchema.findById(el._id)
          subgroups.push(item)
        }),
      )

      res.json(subgroups)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити підгрупи :(',
    })
  }
}
/* // subgroups */
