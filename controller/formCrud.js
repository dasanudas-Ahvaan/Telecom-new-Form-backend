const { Member } = require("../models/OnboardingFormSchema.js");

// Test controller (for basic testing)
exports.testController = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Form controller is working properly ",
  });
};

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json({
      success: true,
    //   count: members.length,
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

// Add a new member
exports.createMember = async (req, res) => {
  try {
    const newMember = new Member(req.body);
    const savedMember = await newMember.save();
    res.status(201).json({
      success: true,
      message: "Member created successfully",
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

// Delete a member by ID
exports.deleteMember = async (req, res) => {
    try {
        // URL से सदस्य की ID प्राप्त करें
        const memberId = req.params.id; 

        // Mongoose का उपयोग करके सदस्य को ID से खोजें और हटाएँ
        const deletedMember = await Member.findByIdAndDelete(memberId);

        // जाँच करें कि सदस्य मिला और हटाया गया या नहीं
        if (!deletedMember) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        // सफलता का संदेश भेजें
        res.status(200).json({
            success: true,
            message: "Member deleted successfully",
            data: deletedMember,
        });
    } catch (error) {
        // सर्वर या डेटाबेस एरर को संभालें
        res.status(500).json({
            success: false,
            message: "Failed to delete member",
            error: error.message,
        });
    }
};

// Update a member by ID
exports.updateMember = async (req, res) => {
    try {
        const memberId = req.params.id; // URL से ID प्राप्त करें
        const updateData = req.body;    // बॉडी (body) से अपडेट किया जाने वाला डेटा प्राप्त करें

        // Mongoose का उपयोग करके सदस्य को ID से खोजें और अपडेट करें
        // new: true सुनिश्चित करता है कि response में अपडेटेड दस्तावेज़ (document) वापस मिले
        const updatedMember = await Member.findByIdAndUpdate(
            memberId,
            updateData,
            { new: true, runValidators: true } // Validators यह सुनिश्चित करते हैं कि स्कीमा नियम लागू हों
        );

        // जाँच करें कि सदस्य मिला या नहीं
        if (!updatedMember) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        // सफलता का संदेश भेजें
        res.status(200).json({
            success: true,
            message: "Member updated successfully",
            data: updatedMember,
        });
    } catch (error) {
        // सर्वर या डेटाबेस एरर को संभालें (जैसे validation error)
        res.status(500).json({
            success: false,
            message: "Failed to update member",
            error: error.message,
        });
    }
};