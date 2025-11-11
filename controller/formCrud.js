const { Member } = require("../models/OnboardingFormSchema.js");
const sendMail = require("../utils/mailers.js");



// Test Controller
exports.testController = (req, res) => {
  
  res.status(200).json({
    success: true,
    message: "Form controller is working properly",
  });
};

// Fetch All Members
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
//create Member
exports.createMember = async (req, res) => {
  try {
    const { email,fullName, phone } = req.body;

    //Field Validation
    if (!email ||!fullName) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required fields",
      });
    }

    //Email Format Validation (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    //Optional: Phone number validation
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Indian phone number",
      });
    }

    //Check for Duplicate Email
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered",
      });
    }

    // Create New Member
    const newMember = new Member(req.body);
    const savedMember = await newMember.save();

    //Send Welcome Email
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

    //Success Response
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


//Delete Member
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

//Update Member
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


// Get Member by ID
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



