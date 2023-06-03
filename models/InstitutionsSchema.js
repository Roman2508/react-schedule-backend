import mongoose from 'mongoose'

const institutionsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId], // ????????????????
      default: [],
    },
    settings: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstitutionSettings',
      // required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.model('Institutions', institutionsSchema)
