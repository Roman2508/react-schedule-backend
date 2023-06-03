import mongoose from 'mongoose'

const ColorSettingsSchema = new mongoose.Schema({
  lectures: String,
  practical: String,
  laboratory: String,
  seminars: String,
  exams: String,
})

const defaultColorSettings = {
  lectures: 'rgb(232, 255, 82)',
  practical: 'rgb(24, 176, 71)',
  laboratory: 'rgb(43, 163, 185)',
  seminars: 'rgb(82, 27, 172)',
  exams: 'rgb(176, 24, 24)',
}

const UserSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    colors: {
      type: ColorSettingsSchema,
      default: defaultColorSettings,
    },
    colorMode: {
      type: String,
      default: 'light',
    },
    selectedSemester: {
      type: String,
      default: '1',
    },
  },
  { timestamps: true },
)

export default mongoose.model('UserSettings', UserSettingsSchema)
