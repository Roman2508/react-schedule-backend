import mongoose from 'mongoose'

const SpecializationListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxWidth: 15,
  },
})

const SpecializationSubjectSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Group',
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    specialization: SpecializationListSchema,
    name: {
      type: String,
      required: true,
      maxWidth: 70,
    },
    semester: {
      type: String,
      required: true,
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
    exams: {
      type: Number,
      required: true,
    },
    zalik: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.model('SpecializationSubject', SpecializationSubjectSchema)
