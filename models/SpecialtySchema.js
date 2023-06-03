import mongoose from 'mongoose'

const SpecialtySchema = new mongoose.Schema(
  {
    facultieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
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
    groups: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Group',
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model('Specialty', SpecialtySchema)
