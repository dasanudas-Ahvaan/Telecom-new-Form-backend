const getDiff = (before, after) => {
  const diff = {};
  for (const key in after) {
    // Only compare keys present in the 'after' object
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff[key] = {
        from: before[key],
        to: after[key],
      };
    }
  }
  return diff;
};

module.exports = { getDiff };
