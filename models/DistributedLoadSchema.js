import mongoose from 'mongoose'

const DistributedStreamSchema = new mongoose.Schema({
  streamId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Streams',
  },
  name: {
    type: String,
    required: true,
    maxWidth: 20,
  },
  groups: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Group',
  },
})

const DistributedSpecializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxWidth: 15,
  },
})

const DistributedSubjectType = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Teacher',
    default: null,
  },
  hours: {
    type: Number,
    required: false,
    default: 0,
  },
  students: {
    type: String,
    required: false,
    default: '1',
  },
  stream: {
    type: DistributedStreamSchema,
    required: false,
    default: null,
  },
  subgroupNumber: {
    type: Number,
    required: false,
    default: null,
  },
})

const DistributedLoadSubjectsSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Group',
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institutions',
    required: true,
  },
  // departmentId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Department',
  //   required: true,
  // },
  currentShowedYear: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxWidth: 70,
  },
  semester: {
    type: String,
    required: true,
  },
  specialization: {
    type: DistributedSpecializationSchema,
    required: false,
    default: null,
  },
  lectures: {
    type: DistributedSubjectType,
    required: false,
  },
  lectures_1: {
    type: DistributedSubjectType,
    required: false,
  },
  lectures_2: {
    type: DistributedSubjectType,
    required: false,
  },
  lectures_3: {
    type: DistributedSubjectType,
    required: false,
  },
  lectures_4: {
    type: DistributedSubjectType,
    required: false,
  },
  practical: {
    type: DistributedSubjectType,
    required: false,
  },
  practical_1: {
    type: DistributedSubjectType,
    required: false,
  },
  practical_2: {
    type: DistributedSubjectType,
    required: false,
  },
  practical_3: {
    type: DistributedSubjectType,
    required: false,
  },
  practical_4: {
    type: DistributedSubjectType,
    required: false,
  },
  /*  */
  laboratory: {
    type: DistributedSubjectType,
    required: false,
  },
  laboratory_1: {
    type: DistributedSubjectType,
    required: false,
  },
  laboratory_2: {
    type: DistributedSubjectType,
    required: false,
  },
  laboratory_3: {
    type: DistributedSubjectType,
    required: false,
  },
  laboratory_4: {
    type: DistributedSubjectType,
    required: false,
  },
  /*  */
  seminars: {
    type: DistributedSubjectType,
    required: false,
  },
  seminars_1: {
    type: DistributedSubjectType,
    required: false,
  },
  seminars_2: {
    type: DistributedSubjectType,
    required: false,
  },
  seminars_3: {
    type: DistributedSubjectType,
    required: false,
  },
  seminars_4: {
    type: DistributedSubjectType,
    required: false,
  },
  /*  */
  exams: {
    type: DistributedSubjectType,
    required: false,
  },
  exams_1: {
    type: DistributedSubjectType,
    required: false,
  },
  exams_2: {
    type: DistributedSubjectType,
    required: false,
  },
  exams_3: {
    type: DistributedSubjectType,
    required: false,
  },
  exams_4: {
    type: DistributedSubjectType,
    required: false,
  },
})

export const DistributedLoadSubjects = mongoose.model('DistributedLoadSubjects', DistributedLoadSubjectsSchema)

const DistributedLoadSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Group',
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institutions',
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'EducationPlan',
  },
  load: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'DistributedLoadSubjects',
    default: [],
  },
  // load: { type: Schema.Types.ObjectId, ref: 'DistributedLoadSubjects' },
})

export default mongoose.model('DistributedLoad', DistributedLoadSchema)
