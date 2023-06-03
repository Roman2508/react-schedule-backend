import mongoose from 'mongoose'

const DepartmentsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxWidth: 50,
    },
    departmentNumber: {
      type: Number,
      required: true,
      maxWidth: 10,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    teachers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Teacher',
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model('Department', DepartmentsSchema)
