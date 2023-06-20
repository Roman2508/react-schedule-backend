import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import 'dotenv/config'

import * as EducationPlanController from './controllers/EducationPlanController.js'
import * as SubjectListController from './controllers/SubjectListController.js'
import * as DepartmentsController from './controllers/DepartmentController.js'
import * as TeachersController from './controllers/TeachersController.js'
import * as BuildingsController from './controllers/BuildingsController.js'
import * as AuditoriumsController from './controllers/AuditoriumsController.js'
import * as FacultiesController from './controllers/FacultyController.js'
import * as SpecialtyConrtoller from './controllers/SpecialtyController.js'
import * as GroupsController from './controllers/GropsController.js'
import * as GroupLoadController from './controllers/GroupLoadController.js' // ??????
import * as StreamsController from './controllers/StreamsController.js'
import * as LessonsController from './controllers/LessonsController.js'
import {
  educationPlanCreateValidation,
  educationPlanGroupCreateValidation,
} from './validations/EducationPlanValidations.js'
import * as DistributedLoadController from './controllers/DistributedLoadController.js'
import * as InstitutionsController from './controllers/InstitutionsController.js'
import * as UserController from './controllers/UserController.js'

import checkAuth from './utils/checkAuth.js'

/* validators */
import { loginUserValidation, registerInstitutionValidation } from './validations/RegisterValidation.js'
/* // validators */

mongoose
  .connect(process.env.MONGODB_CONNECT_URL)
  .then(() => console.log('DB OK'))
  .catch((err) => console.log('DB error', err))

const app = express()

app.use(express.json())
app.use(cors())

app.get('/educationPlansGroup/:institutionId', EducationPlanController.getAllEducationPlansGroup)
app.post('/educationPlansGroup', educationPlanGroupCreateValidation, EducationPlanController.createEducationPlansGroup)
app.patch(
  '/educationPlansGroup/:id',
  educationPlanGroupCreateValidation,
  EducationPlanController.updateEducationPlansGroup
)
app.delete('/educationPlansGroup/:id', EducationPlanController.removeEducationPlansGroup)

app.get('/educationPlans/:id', EducationPlanController.getEducationPlanById)
app.post('/educationPlans', educationPlanCreateValidation, EducationPlanController.createEducationPlan)
app.patch('/educationPlans/:id', educationPlanCreateValidation, EducationPlanController.updateEducationPlan)
app.delete('/educationPlans/:id', EducationPlanController.removeEducationPlan)

app.post('/subjectsList', SubjectListController.createNewSubject)
app.patch('/subjectsList/:id', SubjectListController.updateSubjectHours)
app.delete('/subjectsList/:id', SubjectListController.removeSubject)
app.patch('/subjectsList/:id/semester', SubjectListController.removeSemester)
app.patch('/subjectsList/:id/name', SubjectListController.updateSubjectName)

app.get('/departments/:institutionId', DepartmentsController.getAllDepartments)
app.post('/departments', DepartmentsController.createDepartment)
app.patch('/departments/:id', DepartmentsController.updateDepartment)
app.delete('/departments/:id', DepartmentsController.removeDepartment)

app.post('/teachers', TeachersController.createTeacher)
app.patch('/teachers/:id', TeachersController.updateTeacher)
app.delete('/teachers/:departmentId/:id', TeachersController.removeTeacher)

app.get('/buildings/:institutionId', BuildingsController.getAllBuildings)
app.post('/buildings', BuildingsController.createBuildings)
app.patch('/buildings/:id', BuildingsController.updateBuilding)
app.delete('/buildings/:id', BuildingsController.removeBuilding)

app.post('/auditoriums', AuditoriumsController.createAuditorium)
app.delete('/auditoriums/:buildingId/:id', AuditoriumsController.removeAuditorium)
app.patch('/auditoriums/:id', AuditoriumsController.updateAuditorium)

app.get('/faculties/:institutionId', FacultiesController.getAllFaculties)
app.post('/faculties', FacultiesController.createFaculty)
app.delete('/faculties/:id', FacultiesController.removeFaculty)
app.patch('/faculties/:id', FacultiesController.updateFaculty)

app.get('/specialties/:id', SpecialtyConrtoller.getActiveSpecialty)
app.post('/specialties', SpecialtyConrtoller.createSpecialty)
app.delete('/specialties/:facultieId/:id', SpecialtyConrtoller.removeSpecialty)
app.patch('/specialties/:id', SpecialtyConrtoller.updateSpecialty)

app.get('/groups/:specialtyId', GroupsController.getGroups)
app.get('/groups/all/:facultieId', GroupsController.getAllFacultyGroups)
app.get('/groups/one/:id', GroupsController.getGroupById)
app.post('/groups', GroupsController.createGroup)
app.delete('/groups/:id', GroupsController.removeGroup)
app.patch('/groups/info/:id', GroupsController.updateGroupInfo)
app.patch('/groups/load/:id', GroupsController.updateGroupLoad)

app.post('/groups/specialization-list/:id', GroupsController.addGroupSpecialization)
app.patch('/groups/specialization-list/:id', GroupsController.updateGroupSpecialization)
app.delete('/groups/specialization-list/:id', GroupsController.removeGroupSpecialization)

app.post('/groups/specialization-subjects/:id', GroupsController.addSpecializationSubjects)
app.patch('/groups/specialization-subjects/:id', GroupsController.updateSpecializationSubjects)
app.delete('/groups/specialization-subjects/:groupId/:id', GroupsController.removeSpecializationSubject)

app.get('/groups/subgroups/:groupId', GroupsController.getSubgroups)
app.post('/groups/subgroups/:id', GroupsController.addSubgroups)
app.delete('/groups/subgroups/:id/:subgroupId', GroupsController.removeSubgroups)
app.patch('/groups/subgroups', GroupsController.updateSubgroups)

app.get('/streams/:institutionId', StreamsController.getStreams)
app.post('/streams', StreamsController.createStream)
app.patch('/streams/:id', StreamsController.updateStream)
app.delete('/streams/:id', StreamsController.removeStream)

app.patch('/streams/details/:id', StreamsController.updateStreamDetails)
app.delete('/streams/details/:streamId/:id', StreamsController.removeStreamDetails)

app.post('/streams/components/:id', StreamsController.createStreamComponent)
app.delete('/streams/components/:streamId/:id', StreamsController.removeStreamComponent)

app.get('/group-load/:id', GroupLoadController.getGroupLoad)
app.get(
  '/distributed-load/:userId/:id',
  DistributedLoadController.createCurrentSemesters,
  DistributedLoadController.getDistributedLoad
)
app.get(
  '/distributed-semester-load/:sortType/:selectedSemester/:id',
  DistributedLoadController.getDistributedLoadBySemester
)
app.get('/distributed-load/teacher/:currentShowedYear/:teacher', DistributedLoadController.getDistributedTeacherLoad)
app.patch(
  '/distributed-load',
  DistributedLoadController.createCurrentSemesters,
  DistributedLoadController.updateDistributedLoad
)
app.patch('/distributed-load/attach-teacher/:id', DistributedLoadController.attachTeacher)
app.patch('/distributed-load/students-count/:id', DistributedLoadController.updateStudentsCount)

app.get('/lessons/:institutionId/:type/:id', LessonsController.getLessonsById)
app.get('/lessons/:institutionId/:semester/:subjectNumber/:date', LessonsController.checkAuditoryOverlay)
app.post('/lessons', LessonsController.createLesson)
app.post('/lessons/several', LessonsController.createSeveralLessons)
app.patch('/lessons/:id', LessonsController.updateLessons)
app.patch('/lessons/update-streams/:groupId', LessonsController.updateStreamLessons) // ???????????????????
app.delete('/lessons/:id', LessonsController.removeLesson)
app.post('/lessons/remove-streams', LessonsController.removeStreamLesson)

app.get('/institutions/:id', InstitutionsController.getInstitutions)
app.patch('/institutions/termsOfStudy/:institutionId', InstitutionsController.updateTermsOfStudy)
app.patch('/institutions/currentShowedYear/:institutionId', InstitutionsController.updateCurrentShowedYear)
app.post('/auth/register', registerInstitutionValidation, InstitutionsController.createInstitutions) // Реєстрація

app.post('/auth/me', checkAuth, UserController.getMe)
app.post('/auth/login', loginUserValidation, UserController.loginUser)
app.patch('/user/colors/:userId', UserController.updateColorSettings)
app.patch('/user/semester/:userId', UserController.updateSelectedSemester)

/* Потрібно видалити??? */
// app.post('/groupLoad', GroupLoadController.createGroupLoad)
// app.patch('/groupLoad/:id', GroupLoadController.updateGroupLoad)

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    console.log(err)
  }
  console.log('SERVER OK')
})
