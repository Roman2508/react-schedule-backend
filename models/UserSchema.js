import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    access: {
      // type: 'user' | 'admin' | 'owner',
      type: String,
      default: 'user',
    },
    settings: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserSettings',
      // default: null,
      // required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.model('User', UserSchema)
