import mongoose from 'mongoose'

const BuildingsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 20,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    auditoriums: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Auditorium',
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model('Buildings', BuildingsSchema)
