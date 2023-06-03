import mongoose from 'mongoose'

const StreamComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxWidth: 20,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Group',
  },
  groupLoad: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'GroupLoad',
  },
})

const StreamDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxWidth: 70,
  },
  semester: {
    type: String,
    required: true,
    maxWidth: 2,
  },
  type: {
    type: String,
    required: true,
    maxWidth: 10,
  },
  subgroupNumber: {
    type: String,
    required: false,
    default: null,
  },
})

const StreamsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxWidth: 20,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    components: {
      type: [StreamComponentSchema],
      default: [],
    },
    details: {
      type: [StreamDetailsSchema],
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model('Streams', StreamsSchema)
