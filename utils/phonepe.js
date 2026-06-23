const crypto = require("crypto");

function generateChecksum(payload, apiEndPoint, saltKey, saltIndex) {

 const hash = crypto
  .createHash("sha256")
  .update(payload + apiEndPoint + saltKey)
  .digest("hex");

 return `${hash}###${saltIndex}`;
}

module.exports = {
 generateChecksum
};