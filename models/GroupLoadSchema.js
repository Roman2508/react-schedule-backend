import mongoose from 'mongoose'

const GroupLoadSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationPlan',
      required: true,
    },
    load: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'GroupLoadSubjects',
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model('GroupLoad', GroupLoadSchema)
