const { default: mongoose } = require("mongoose");
const { Member } = require("../models/OnboardingFormSchema.js");
const sendMail = require("../utils/mailers.js");
const Counter = require("../models/counter.js");
const { EmailOTP } = require("../models/otpSchema.js");

exports.testController = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Form controller is working properly",
  });
};

exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch members",
      error: error.message,
    });
  }
};

exports.createMember = async (req, res) => {
  const otpRecord = await EmailOTP.findOne({ email: req.body.email });

  if (!otpRecord || !otpRecord.verified) {
    return res.status(400).json({
      success: false,
      message: "Email not verified. Please verify email first.",
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      email,
      fullName,
      phone,
      gender,
      dateOfBirth,
      education,
      profession,
      addressLine1,
      addressLine2,
      pincode,
      city,
      state,
      country,
      previousAssociations,
      volunteerPrograms,
      aadhar,
      extraFields,
    } = req.body;

    const allFields = {
      email,
      fullName,
      phone,
      gender,
      dateOfBirth,
      education,
      profession,
      addressLine1,
      addressLine2,
      pincode,
      city,
      state,
      country,
      previousAssociations,
      volunteerPrograms,
      aadhar,
      extraFields,
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Indian phone number",
      });
    }

    const existingMember = await Member.findOne({ email }).session(session);
    if (existingMember) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const counter = await Counter.findByIdAndUpdate(
      { _id: "member_id" },
      { $inc: { seq: 1 }, $setOnInsert: { collectionName: "members" } },
      { new: true, upsert: true, session }
    );

    const paddedId = String(counter.seq).padStart(5, "0");
    const memberId = "AHVN" + paddedId;

    const newMember = new Member({ _id: memberId, ...req.body });
    const savedMember = await newMember.save({ session });

    await session.commitTransaction();
    session.endSession();
    await sendMail(
      email,
      "🚩 आह्वान-धर्म रक्षा समिति में आपका स्वागत है!",
      `<div style="text-align:center; font-family: 'Noto Sans Devanagari', sans-serif; background-color:#fff8e1; padding:20px;">
    <img src="cid:logoImage"
         alt="आह्वान-धर्म रक्षा समिति"
         style="max-width:100%; border-radius:10px;"/>
    <h2 style="color:#d32f2f; margin-top:20px;">🙏 आपका हार्दिक स्वागत है 🙏</h2>
   <p style="font-size:16px; color:#444;">
  <b>${fullName} जी,</b>
  <br><br>
  धर्म रक्षा और सेवा के इस पुनीत अभियान में स्वेच्छा से जुड़ने के लिए **हम हृदय से आपके आभारी हैं**।
  आपका यह समर्पित सहयोग, सनातन धर्म और राष्ट्र की सेवा के हमारे सामूहिक लक्ष्य को एक नई दिशा और **अभूतपूर्व बल** प्रदान करता है। हम आपके सक्रिय योगदान की प्रतीक्षा कर रहे हैं।
</p>
    <p style="margin-top:20px; color:#555;">🚩 जय श्री राम!<br>— Team आह्वान-धर्म रक्षा समिति</p>
  </div>`
    );

    await EmailOTP.deleteOne({ email });

    res.status(201).json({
      success: true,
      message: "Member created successfully and confirmation email sent!",
      data: savedMember,
    });
  } catch (error) {
    console.error("Error in createMember:", error);
    res.status(500).json({
      success: false,
      message: "Error creating member",
      error: error.message,
    });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const deletedMember = await Member.findByIdAndDelete(memberId);

    if (!deletedMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Member deleted successfully",
      data: deletedMember,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete member",
      error: error.message,
    });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const updateData = req.body;

    const restrictedFields = ["_id", "createdAt", "memberId"];
    for (let field of restrictedFields) {
      if (updateData[field]) delete updateData[field];
    }

    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const existingMember = await Member.findOne({ email: updateData.email });
      if (existingMember && existingMember._id.toString() !== memberId) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another member",
        });
      }
    }

    if (updateData.phone && !/^[6-9]\d{9}$/.test(updateData.phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Indian phone number",
      });
    }

    const updatedMember = await Member.findByIdAndUpdate(memberId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update member",
      error: error.message,
    });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const memberId = req.params.id;

    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Member fetched successfully",
      data: member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch member",
      error: error.message,
    });
  }
};
