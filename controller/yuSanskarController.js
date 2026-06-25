const YuSanskar = require("../models/yuSanskarSchema");

exports.testController = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Yu Sanskar controller is working properly",
  });
};

exports.getAllYuSanskarForms = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const total = await YuSanskar.countDocuments();

    const forms = await YuSanskar.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: forms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch forms",
      error: error.message,
    });
  }
};

exports.createYuSanskarForm = async (req, res) => {
  try {
    const {
      email,
      fullName,
      fatherName,
      varna,
      motherVarna,
      gotra,
      motherGotra,
      age,
      address,
      isUpaneet,
      fatherUpanayanDone,
      fatherSandhya,
      generationDetails,
      fatherUpanayanAge,
      underAcharyaRamshankar,
      acharyaDetails,
      mobileNumber,
      aadhaarPhoto,
      aadhaarNumber,
      aadhaarLinkedMobile,
    } = req.body;

    const allFields = {
      email,
      fullName,
      fatherName,
      varna,
      motherVarna,
      gotra,
      motherGotra,
      age,
      address,
      isUpaneet,
      fatherUpanayanDone,
      fatherSandhya,
      generationDetails,
      fatherUpanayanAge,
      underAcharyaRamshankar,
      acharyaDetails,
      mobileNumber,
      aadhaarPhoto,
      aadhaarNumber,
      aadhaarLinkedMobile,
    };

    const missingFields = Object.keys(allFields).filter(
      (key) => !allFields[key]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const existingForm = await YuSanskar.findOne({ email });

    if (existingForm) {
      return res.status(400).json({
        success: false,
        message: "This email has already submitted the form",
      });
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number must be exactly 12 digits",
      });
    }

    const savedForm = await YuSanskar.create(req.body);

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      data: savedForm,
    });
  } catch (error) {
    console.error("Error in createYuSanskarForm:", error);

    res.status(500).json({
      success: false,
      message: "Error creating form",
      error: error.message,
    });
  }
};

exports.updateYuSanskarForm = async (req, res) => {
  try {
    const formId = req.params.id;
    const updateData = req.body;

    const restrictedFields = ["_id", "createdAt", "email"];

    restrictedFields.forEach((field) => {
      delete updateData[field];
    });

    const updatedForm = await YuSanskar.findByIdAndUpdate(formId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Form updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update form",
      error: error.message,
    });
  }
};

exports.deleteYuSanskarForm = async (req, res) => {
  try {
    const formId = req.params.id;

    const deletedForm = await YuSanskar.findByIdAndDelete(formId);

    if (!deletedForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Form deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete form",
      error: error.message,
    });
  }
};

exports.getYuSanskarFormById = async (req, res) => {
  try {
    const formId = req.params.id;

    const form = await YuSanskar.findById(formId);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Form fetched successfully",
      data: form,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch form",
      error: error.message,
    });
  }
};
