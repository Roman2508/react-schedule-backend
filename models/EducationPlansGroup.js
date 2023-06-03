import mongoose from 'mongoose'

const EducationPlanGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 70,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    plans: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'EducationPlan',
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model('EducationPlansGroup', EducationPlanGroupSchema)
