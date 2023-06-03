import mongoose from 'mongoose'

const LessonsSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  name: {
    // було subjectName
    type: String,
    required: true,
  },
  groupName: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  students: {
    type: String,
    required: true,
  },
  subjectType: {
    // було typeOfSubject
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  auditory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auditorium',
    required: true,
  },
  remark: {
    type: String,
    required: true,
  },
  stream: {
    type: mongoose.Schema.Types.ObjectId || null,
    ref: 'Streams',
  },
  semester: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  subjectNumber: {
    type: Number,
    required: true,
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institutions',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

export default mongoose.model('Lessons', LessonsSchema)
