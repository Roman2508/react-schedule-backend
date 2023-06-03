import mongoose from 'mongoose'

const EducationPlanSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      rel: 'EducationPlansGroup',
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    name: {
      type: String,
      maxlength: 70,
      required: true,
    },
    subjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'SubjectsList',
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model('EducationPlan', EducationPlanSchema)
