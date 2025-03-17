import crypto from "node:crypto";

const hashedToken = (token) => {
    // hash the token using sha256
    return crypto.createHash("sha256").update(token.toString()).digest("hex");
};

export default hashedToken;