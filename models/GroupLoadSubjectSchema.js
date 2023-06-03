import mongoose from 'mongoose'
import { SubjectSchema } from './Subjects.js'

const SpecialitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subjectsType: {
    lectures: {
      type: Boolean,
      required: true,
    },
    practical: {
      type: Boolean,
      required: true,
    },
    laboratory: {
      type: Boolean,
      required: true,
    },
    seminars: {
      type: Boolean,
      required: true,
    },
    exams: {
      type: Boolean,
      required: true,
    },
    zalik: {
      type: Boolean,
      required: true,
    },
  },
})

const GroupLoadSubjectSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationPlan',
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    // ???????????????? Додавання назви групи до distributedLoad в createSelectedDistributedLoad.ts
    // ???????????????? Додавання назви групи до distributedLoad в createSelectedDistributedLoad.ts
    // ???????????????? Додавання назви групи до distributedLoad в createSelectedDistributedLoad.ts
    // ???????????????? Додавання назви групи до distributedLoad в createSelectedDistributedLoad.ts
    // ???????????????? Додавання назви групи до distributedLoad в createSelectedDistributedLoad.ts
    /* groupName: {
      type: String,
      required: true,
    }, */
    name: {
      type: String,
      required: true,
    },
    totalHour: {
      type: String,
      required: true,
    },
    speciality: {
      type: SpecialitySchema,
      default: null,
    },
    subgroups: {
      type: String,
      default: null,
    },
    stream: {
      type: String,
      default: null,
    },
    semester_1: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_2: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_3: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_4: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_5: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_6: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_7: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_8: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_9: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_10: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_11: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
    semester_12: {
      type: SubjectSchema,
      required: false,
      default: null,
    },
  },
  { timestamps: true },
)

export default mongoose.model('GroupLoadSubjects', GroupLoadSubjectSchema)
