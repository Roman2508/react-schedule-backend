import mongoose from 'mongoose'

const SubgroupsSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    name: {
      type: String,
      maxWidth: 70,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    lectures: {
      type: Number,
      default: null,
      required: false,
    },
    practical: {
      type: Number,
      default: null,
      required: false,
    },
    laboratory: {
      type: Number,
      default: null,
      required: false,
    },
    seminars: {
      type: Number,
      default: null,
      required: false,
    },
    exams: {
      type: Number,
      default: null,
      required: false,
    },
  },
  { timeseries: true },
)

export default mongoose.model('Subgroups', SubgroupsSchema)
