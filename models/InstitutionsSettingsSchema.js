import mongoose from 'mongoose'

const termsSchema = new mongoose.Schema({
  start: {
    type: Number,
    default: null,
  },
  end: {
    type: Number,
    default: null,
  },
})

const termsOfStudySchema = new mongoose.Schema({
  currentYear: {
    type: termsSchema,
    // required: true,
  },
  firstSemester: {
    type: termsSchema,
    // required: true,
  },
  secondSemester: {
    type: termsSchema,
    // required: true,
  },
})

const callSubjectSchema = new mongoose.Schema({
  start: {
    type: String,
    default: null,
  },
  end: {
    type: String,
    default: null,
  },
})

const callScheduleSchema = new mongoose.Schema({
  1: {
    type: callSubjectSchema,
    required: true,
  },
  2: {
    type: callSubjectSchema,
    required: true,
  },
  3: {
    type: callSubjectSchema,
    required: true,
  },
  4: {
    type: callSubjectSchema,
    required: true,
  },
  5: {
    type: callSubjectSchema,
    required: true,
  },
  6: {
    type: callSubjectSchema,
    required: true,
  },
  7: {
    type: callSubjectSchema,
    required: true,
  },
})

const defaultSettingsObject = {
  callSchedule: {
    1: { start: '08:30', end: '09:50' },
    2: { start: '08:30', end: '09:50' },
    3: { start: '08:30', end: '09:50' },
    4: { start: '08:30', end: '09:50' },
    5: { start: '08:30', end: '09:50' },
    6: { start: '08:30', end: '09:50' },
    7: { start: '08:30', end: '09:50' },
  },
  termsOfStudy: {
    currentYear: { start: 1640988000, end: 1641247200 },
    firstSemester: { start: 1640988000, end: 1641074400 },
    secondSemester: { start: 1641160800, end: 1641247200 },
  },
}

const institutionsSettingsSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institutions',
    },
    callSchedule: {
      type: callScheduleSchema,
      default: defaultSettingsObject.callSchedule,
    },
    termsOfStudy: {
      type: termsOfStudySchema,
      default: defaultSettingsObject.termsOfStudy,
    },
    currentShowedYear: {
      type: String,
      default: (new Date().getFullYear()),
    },
  },
  { timestamps: true },
)

export default mongoose.model('InstitutionSettings', institutionsSettingsSchema)

/*   
    "_id": "565664465",
    "institutionId": "21213123132132",
    "callSchedule": {
        "1": { "start": "08:30", "end": "09:50" },
        "2": { "start": "08:30", "end": "09:50" },
        "3": { "start": "08:30", "end": "09:50" },
        "4": { "start": "08:30", "end": "09:50" },
        "5": { "start": "08:30", "end": "09:50" },
        "6": { "start": "08:30", "end": "09:50" },
        "7": { "start": "08:30", "end": "09:50" }
      },
    "termsOfStudy": {
        "currentYear": { "start": "35554554354544", "end": "35554554354544" },
        "firstSemester": { "start": "35554554354544", "end": "35554554354544" },
        "secondSemester": { "start": "35554554354544", "end": "35554554354544" }
      }
*/
