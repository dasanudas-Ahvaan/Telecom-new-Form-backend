const aggregateForFrontend = (after) => {
  const finalData = after.toObject();

  // 1. Transform volunteerPrograms to match your aggregation pipeline (extract titles)
  if (Array.isArray(finalData.volunteerPrograms)) {
    finalData.volunteerPrograms = finalData.volunteerPrograms.map(
      (program) => program.title,
    );
  }

  // 2. Extract previousAssociations in JavaScript equivalent to your $reduce / $filter pipeline
  finalData.previousAssociations = [];
  if (Array.isArray(after.volunteerPrograms)) {
    after.volunteerPrograms.forEach((program) => {
      if (program.answers) {
        const possibleAssocs = [
          program.answers.get("dharmik-past-association"),
          program.answers.get("naam-past-association"),
          program.answers.get("finance-past-association"),
        ];
        // Filter out null / undefined values
        const validAssocs = possibleAssocs.filter(
          (assoc) => assoc !== null && assoc !== undefined,
        );
        finalData.previousAssociations.push(...validAssocs);
      }
    });
  }

  // 3. Remove fields excluded in your $project stage
  delete finalData.__v;
  delete finalData.createdAt;
  delete finalData.updatedAt;
  delete finalData.paymentType;
  return finalData;
};

module.exports = aggregateForFrontend;
