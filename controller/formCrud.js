const { Member } = require("../models/OnboardingFormSchema.js");
const sendMail = require("../utils/mailers.js");

// ✅ Test Controller
exports.testController = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Form controller is working properly",
  });
};

// ✅ Fetch All Members
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

// ✅ Create New Member + Send Email
exports.createMember = async (req, res) => {
  try {
    const { email, name , fullName} = req.body;

    const newMember = new Member(req.body);
    const savedMember = await newMember.save();

    // Send Welcome Email
    await sendMail(
      email,
      "Welcome ! Your Onboarding is Complete",
      `Namaste ${name || fullName},\n\nThank you for completing Registration your onboarding form. We are excited to have you as a member !\n\nOur team will review your details and contact you soon.\n\n🚩 Jai Shri Ram!\n— Team Ahvaan-धर्म रक्षा समिति`
    );

    res.status(201).json({
      success: true,
      message: "Member created successfully and confirmation email sent!",
      data: savedMember,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating member",
      error: error.message,
    });
  }
};

// ✅ Delete Member
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

// ✅ Update Member
exports.updateMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const updateData = req.body;

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

// ✅ Contact Form + Email Reply
exports.submitForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Send confirmation mail
    await sendMail(
      email,
      "🚩 आह्वान-धर्म रक्षा समिति में आपका स्वागत है!",
      `जय श्रीमन्नारायण! ${name},\n\nधर्म रक्षा के इस अभियान में आपका स्वागत है 🙏\nहमारे WhatsApp समूह से जुड़ें:\n👉 https://chat.whatsapp.com/GrJzFHfKwYR0kcHyeHObs3?mode=wwt\n\n🚩 जय श्री राम!\n— Team Ahvaan-धर्म रक्षा समिति`
    );

    res.status(200).json({
      success: true,
      message: "Form submitted successfully and email sent!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error while sending email",
    });
  }
};
