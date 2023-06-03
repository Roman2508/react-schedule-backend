import mongoose from 'mongoose'

const AuditoriumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 20,
    },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buildings',
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    seatsNumber: {
      type: Number,
      required: true,
      maxLength: 4,
    },
  },
  { timestamps: true },
)

export default mongoose.model('Auditorium', AuditoriumSchema)
