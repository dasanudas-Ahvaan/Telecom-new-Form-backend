const { Member } = require("../../models/OnboardingFormSchema");
const aggregateForFrontend = require("../../utils/aggregateForFrontend");
const { getDiff } = require("../../utils/getDiff");

const updateMember = async (memberId, updatedData, userEmail) => {
  try {
    if (!memberId) {
      throw new Error("Missing credential: memberId");
    }
    if (!updatedData) {
      throw new Error("Bad request");
    }
    const restrictedFields = ["_id", "createdAt", "memberId", "email"];
    for (let field of restrictedFields) {
      if (updatedData[field]) delete updatedData[field];
    }
    //temporary disabled for India phone numbers
    // if (updatedData.phone && !/^[6-9]\d{9}$/.test(updatedData.phone)) {
    //   throw new Error("Invalid india phone number");
    // }
    let member = await Member.findById(memberId);
    if (!member) {
      throw new Error("Member not found");
    }
    const before = member.toObject();
    member.set(updatedData);
    const after = await member.save();

    if (!after) {
      throw new Error("update failed");
    }

    const changes = getDiff(before, after.toObject());
    // console.log("CHANGES", changes);
    const finalData = aggregateForFrontend(after);

    return {
      response: {
        success: true,
        message: "Member updated successfully",
        data: finalData,
      },
      metadata: `Member data was changed for ${after.fullName} by ${userEmail}`,
      changes,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = updateMember;
