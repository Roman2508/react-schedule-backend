import mongoose from 'mongoose'

const SpecializationsListSchema = new mongoose.Schema(
  {
    name: String,
  },
  { timeseries: true },
)

const GroupSchema = new mongoose.Schema(
  {
    specialtyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxWidth: 20,
    },
    yearOfAdmission: {
      type: String,
      required: true,
      maxWidth: 4,
    },
    courseNumber: {
      type: String,
      required: true,
      maxWidth: 2,
    },
    students: {
      type: String,
      required: true,
      maxWidth: 4,
    },
    formOfEducations: {
      type: String,
      required: true,
      maxWidth: 4,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
      required: true,
    },
    groupLoad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupLoad',
      default: null,
    },
    EducationPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationPlan',
      required: true,
    },
    streams: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Streams',
      default: [],
    },
    subgroups: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Subgroups',
      default: [],
    },
    specializationsList: {
      type: [SpecializationsListSchema],
      default: [],
    },
    specializationsSubjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'SpecializationSubject',
      default: [],
    },
  },
  { timeseries: true },
)

export default mongoose.model('Group', GroupSchema)
