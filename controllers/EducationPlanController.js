import EducationPlansModel from '../models/EducationPlans.js'
import EducationPlanGroupModel from '../models/EducationPlansGroup.js'

/* EducationPlansGroup */

export const getAllEducationPlansGroup = async (req, res) => {
  try {
    const educationPlansGroup = await EducationPlanGroupModel.find({ institutionId: req.params.institutionId })
      .populate('plans')
      .exec()

    res.json(educationPlansGroup)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалося отримати структурні підрозділи',
    })
  }
}

export const createEducationPlansGroup = async (req, res) => {
  try {
    const doc = new EducationPlanGroupModel({
      name: req.body.name,
      institutionId: req.body.institutionId,
    })

    const educationPlan = await doc.save()

    res.json(educationPlan)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалося створити структурний підрозділ',
    })
  }
}

export const updateEducationPlansGroup = async (req, res) => {
  try {
    await EducationPlanGroupModel.updateOne({ _id: req.params.id }, { name: req.body.name })

    const educationPlansGroup = await EducationPlanGroupModel.findById(req.params.id)

    res.json(educationPlansGroup)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалося оновити структурний підрозділ',
    })
  }
}

export const removeEducationPlansGroup = async (req, res) => {
  try {
    EducationPlanGroupModel.findOneAndDelete(
      {
        _id: req.params.id,
      },
      (err, doc) => {
        if (err) {
          console.log(err)
          res.status(500).json({
            message: 'Не вдалось видалити структурний підрозділ',
          })
          return
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Не вдалось знайти структурний підрозділ',
          })
        }

        res.json({
          id: req.params.id,
        })
      },
    )
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось видалити структурний підрозділ',
    })
  }
}

/* EducationPlans */

export const getEducationPlanById = async (req, res) => {
  try {
    const planId = req.params.id

    const educationPlan = await EducationPlansModel.findById(planId).populate('subjects').exec()

    res.json(educationPlan)
  } catch (error) {
    console.log(error)
    res.json({
      message: 'Не вдалось знайти план :(',
    })
  }
}

export const createEducationPlan = async (req, res) => {
  try {
    const doc = new EducationPlansModel({
      categoryId: req.body.categoryId,
      institutionId: req.body.institutionId,
      name: req.body.name,
    })

    const educationPlanGroup = await EducationPlanGroupModel.findOne({ _id: doc.categoryId })

    if (educationPlanGroup) {
      educationPlanGroup.plans.push(doc._id)
      await educationPlanGroup.save()
    } else {
      res.status(500).json({
        message: 'some error',
      })
      return
    }
    const educationPlan = await doc.save()

    res.json(educationPlan)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалося створити навчальний план',
    })
  }
}

/* GroupLoad and educationPlans !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */

export const updateEducationPlan = async (req, res) => {
  try {
    const oldEducationPlans = await EducationPlansModel.findById(req.params.id)

    await EducationPlansModel.updateOne(
      { _id: req.params.id },
      { name: req.body.name, categoryId: req.body.categoryId },
    )

    if (String(oldEducationPlans.categoryId) !== req.body.categoryId) {
      const educationPlanGroup = await EducationPlanGroupModel.findOne({ _id: oldEducationPlans.categoryId })

      const newPlan = educationPlanGroup.plans.filter((el) => String(el._id) !== String(oldEducationPlans._id))
      educationPlanGroup.plans = newPlan

      await educationPlanGroup.save()

      const EducationPlanGroup = await EducationPlanGroupModel.findOne({ _id: req.body.categoryId })

      if (EducationPlanGroup) {
        EducationPlanGroup.plans.push(req.params.id)
        await EducationPlanGroup.save()
      } else {
        res.status(500).json({
          message: 'some error',
        })
        return
      }
    }

    const newEducationalPlan = await EducationPlansModel.findById(req.params.id)

    res.json(newEducationalPlan)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити навчальний план',
    })
  }
}

export const removeEducationPlan = async (req, res) => {
  try {
    const plan = await EducationPlansModel.findById(req.params.id)

    const planGroup = await EducationPlanGroupModel.findById(plan.categoryId)

    const newPlans = planGroup.plans.filter((el) => String(el) !== req.params.id)

    await EducationPlanGroupModel.updateOne({ _id: plan.categoryId }, { plans: newPlans })

    EducationPlansModel.findOneAndDelete({ _id: req.params.id }, async (err, doc) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          message: 'Не вдалось видалити навчальний план',
        })
        return
      }
      if (!doc) {
        return res.status(404).json({
          message: 'Не вдалось знайти навчальний план',
        })
      }

      res.json({
        id: req.params.id,
        categoryId: plan.categoryId,
        success: true,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не вдалось оновити навчальний план',
    })
  }
}
