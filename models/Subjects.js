import mongoose from 'mongoose'

export const SubjectSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    // required: true,
  },
  lectures: {
    type: Number,
    required: true,
  },
  practical: {
    type: Number,
    required: true,
  },
  laboratory: {
    type: Number,
    required: true,
  },
  seminars: {
    type: Number,
    required: true,
  },
  exams: {
    type: Number,
    required: true,
  },
  zalik: {
    type: Number,
    required: true,
  },
  termPaper: {
    type: Boolean,
    required: true,
  },
  individual: {
    type: Number,
    required: true,
  },
  inPlan: {
    type: Number,
    required: true,
  },
})

const SubjectsSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationPlan',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    totalHour: {
      type: String,
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
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
  { minimize: false, timestamps: true }
)

export default mongoose.model('SubjectsList', SubjectsSchema)
