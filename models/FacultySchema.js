import mongoose from 'mongoose'

const FacultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 70,
    },
    shortName: {
      type: String,
      required: true,
      maxLength: 10,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    specialties: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Specialty',
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model('Faculty', FacultySchema)
