const { default: mongoose } = require("mongoose");
const { Member } = require("../models/OnboardingFormSchema.js");
const sendMail = require("../utils/mailers.js");
const Counter = require("../models/counter.js");
const { EmailOTP } = require("../models/otpSchema.js");
const updateMember = require("../services/formCrudServices/updateMember.js");

exports.testController = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Form controller is working properly",
  });
};

exports.getAllMembers = async (req, res) => {
  try {
    const { status: filterType } = req.query;
    let query = {};
    if (filterType === "unverified") {
      query = { isVerified: false };
    } else if (filterType === "verified") {
      query = { isVerified: true, status: "active" };
    } else if (filterType === "inactive") {
      query = { status: "inactive" };
    }
    const pipeline = [
      // 1. Filter documents based on your original query
      { $match: query },

      // 2. Add/Transform fields
      {
        $addFields: {
          // Extract only the titles into an array
          volunteerPrograms: {
            $map: {
              input: "$volunteerPrograms",
              as: "program",
              in: "$$program.title",
            },
          },
          // Extract the past association text dynamically from the answers
          previousAssociations: {
            $reduce: {
              input: "$volunteerPrograms",
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  {
                    $filter: {
                      input: [
                        "$$this.answers.dharmik-past-association",
                        "$$this.answers.naam-past-association",
                        "$$this.answers.finance-past-association",
                      ],
                      as: "assoc",
                      cond: { $ne: ["$$assoc", null] }, // Keep only if it exists/is not null
                    },
                  },
                ],
              },
            },
          },
        },
      },

      // 3. Exclude the fields you don't want
      {
        $project: {
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
          paymentType: 0,
        },
      },
    ];
    const members = await Member.aggregate(pipeline);

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

// exports.createMember = async (req, res) => {
//   const otpRecord = await EmailOTP.findOne({ email: req.body.email });

//   if (!otpRecord || !otpRecord.verified) {
//     return res.status(400).json({
//       success: false,
//       message: "Email not verified. Please verify email first.",
//     });
//   }
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const {
//       email,
//       fullName,
//       phone,
//       gender,
//       dateOfBirth,
//       education,
//       profession,
//       addressLine1,
//       addressLine2,
//       pincode,
//       city,
//       state,
//       country,
//       previousAssociations,
//       volunteerPrograms,
//       aadhar,
//       extraFields,
//       paymentType,
//     } = req.body;

//     const requiredFields = {
//       email,
//       fullName,
//       phone,
//       gender,
//       dateOfBirth,
//       education,
//       profession,
//       addressLine1,
//       addressLine2,
//       pincode,
//       city,
//       state,
//       country,
//       aadhar,
//     };

//     const missingFields = Object.keys(requiredFields).filter(
//       (key) => !requiredFields[key],
//     );

//     if (missingFields.length > 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: `Missing required fields: ${missingFields.join(", ")}`,
//       });
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a valid email address",
//       });
//     }

//     if (phone && !/^\d{10}$/.test(phone)) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Indian phone number",
//       });
//     }

//     const existingMember = await Member.findOne({ email }).session(session);
//     if (existingMember) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "This email is already registered",
//       });
//     }

//     const counter = await Counter.findByIdAndUpdate(
//       { _id: "member_id" },
//       { $inc: { seq: 1 }, $setOnInsert: { collectionName: "members" } },
//       { new: true, upsert: true, session },
//     );

//     const paddedId = String(counter.seq).padStart(5, "0");
//     const memberId = "AHVN" + paddedId;

//     const newMember = new Member({ _id: memberId, ...req.body });
//     const savedMember = await newMember.save({ session });

//     await session.commitTransaction();
//     session.endSession();
//     const emailSent = await sendMail(
//       email,
//       "🚩 आह्वान-धर्म रक्षा समिति में आपका स्वागत है!",
//       `<div style="text-align:center; font-family: 'Noto Sans Devanagari', sans-serif; background-color:#fff8e1; padding:20px;">
//     <img src="cid:logoImage"
//          alt="आह्वान-धर्म रक्षा समिति"
//          style="max-width:100%; border-radius:10px;"/>
//     <h2 style="color:#d32f2f; margin-top:20px;">🙏 आपका हार्दिक स्वागत है 🙏</h2>
//    <p style="font-size:16px; color:#444;">
//   <b>${fullName} जी,</b>
//   <br><br>
//   धर्म रक्षा और सेवा के इस पुनीत अभियान में स्वेच्छा से जुड़ने के लिए **हम हृदय से आपके आभारी हैं**।
//   आपका यह समर्पित सहयोग, सनातन धर्म और राष्ट्र की सेवा के हमारे सामूहिक लक्ष्य को एक नई दिशा और **अभूतपूर्व बल** प्रदान करता है। हम आपके सक्रिय योगदान की प्रतीक्षा कर रहे हैं।
// </p>
//     <p style="margin-top:20px; color:#555;">🚩 जय श्री राम!<br>— Team आह्वान-धर्म रक्षा समिति</p>
//   </div>`,
//     );

//     await EmailOTP.deleteOne({ email });

//     res.status(201).json({
//       success: true,
//       data: savedMember,
//       ...(emailSent.response
//         ? {
//             message: "Member created successfully and confirmation email sent!",
//           }
//         : {
//             message:
//               "Confirmation email NOT sent. Member created successfully!",
//           }),
//     });
//   } catch (error) {
//     console.error("Error in createMember:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating member",
//       error: error.message,
//     });
//   }
// };

exports.createMember = async (req, res) => {
  const otpRecord = await EmailOTP.findOne({ email: req.body.email });

  if (!otpRecord || !otpRecord.verified) {
    return res.status(400).json({
      success: false,
      message: "Email not verified. Please verify email first.",
    });
  }

  const maxRetries = 3;
  let attempt = 0;
  let savedMember = null;
  let memberId = "";

  // Retry loop to handle MongoDB Write Conflicts gracefully under concurrency
  while (attempt < maxRetries) {
    attempt++;
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
        paymentType,
      } = req.body;

      const requiredFields = {
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
        aadhar,
      };

      const missingFields = Object.keys(requiredFields).filter(
        (key) => !requiredFields[key],
      );

      if (missingFields.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      if (phone && !/^\d{10}$/.test(phone)) {
        await session.abortTransaction();
        session.endSession();
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
        { new: true, upsert: true, session },
      );

      const paddedId = String(counter.seq).padStart(5, "0");
      memberId = "AHVN" + paddedId;

      const newMember = new Member({ _id: memberId, ...req.body });
      savedMember = await newMember.save({ session });

      await session.commitTransaction();
      session.endSession();
      break; // Success! Break out of the retry loop.
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // If it's a Write Conflict (Code 112) and we haven't maxed out retries, try again
      if (error.code === 112 && attempt < maxRetries) {
        console.warn(
          `Write conflict detected on attempt ${attempt}. Retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
        continue;
      }

      // If it's any other error or retries are exhausted, throw it to the outer catch
      throw error;
    }
  }

  try {
    const emailSent = await sendMail(
      "welcomeEmail",
      req.body.email,
      "🚩 आह्वान-धर्म रक्षा समिति में आपका स्वागत है!",
      { fullName: req.body.fullName },
    );

    await EmailOTP.deleteOne({ email: req.body.email });

    res.status(201).json({
      success: true,
      data: savedMember,
      ...(emailSent.response
        ? {
            message: "Member created successfully and confirmation email sent!",
          }
        : {
            message:
              "Confirmation email NOT sent. Member created successfully!",
          }),
    });
  } catch (error) {
    console.error("Error in createMember post-processing (email/otp):", error);
    res.status(500).json({
      success: false,
      message: "Member created, but post-processing failed",
      error: error.message,
    });
  }
};
exports.deactivateMember = async (req, res) => {
  try {
    const memberId = req.query.id;
    const deletedMember = await Member.findOneAndUpdate(
      { _id: memberId },
      { status: "inactive" },
      { new: true },
    ).select("-__v -createdAt -updatedAt");

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

exports.updateMemberController = async (req, res) => {
  const memberId = req.query.id;
  const updateData = req.body;
  const userEmail = req.user.email;
  const result = await updateMember(memberId, updateData, userEmail);
  return result;
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
