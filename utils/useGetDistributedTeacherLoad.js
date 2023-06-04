import { subjectTypes } from '../controllers/DistributedLoadController.js'

export const useGetDistributedTeacherLoad = (distributedSemesterLoad, groupList, teacher, teacherId) => {
  const distributedTeacherLoad = distributedSemesterLoad.map((el) => {
    const currentGroup = groupList.find((g) => {
      return String(g._id) === String(el.groupId)
    })

    const data = {
      _id: el._id,
      groupName: currentGroup.name,
      groupId: el.groupId,
      name: el.name,
      semester: el.semester,
      specialization: el.specialization,
    }

    // Додавання до об'єкта data виду заняття, в якому даний викладач закріплений
    subjectTypes.forEach((type) => {
      if (el[type] && String(el[type].teacher) === teacherId) {
        data[type] = el[type]

        data[type].teacher = teacher
      }
    })

    const dataKeys = Object.keys(data)

    // Перевірка чи хоча б 1 вид занять був знайдений
    const isIncludesSubject = dataKeys.map((el) => {
      return subjectTypes.some((type) => {
        return type === el
      })
    })

    const some = isIncludesSubject.some((el) => el === true)

    if (some) {
      return data
    }

    return
  })

  return { distributedTeacherLoad }
}
