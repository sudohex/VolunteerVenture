const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * Hashes a plain text password.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} - The hashed password.
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
};

/**
 * Compares a plain text password with a hash.
 * @param {string} password - The plain text password.
 * @param {string} hashedPassword - The hashed password.
 * @returns {Promise<boolean>} - True if they match, false otherwise.
 */
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

/**
 * Generates a JWT token for a user.
 * @param {object} payload - The payload to include in the token.
 * @param {number} expiresIn - The number of seconds until the token expires.
 * @returns {string} - The JWT token.
 */
const generateToken = (payload, expiresIn = 36000) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid token');
    }
};

const sendError = (res, status, message) => {
    console.error(message);
    res.status(status).json({ errors: [{ msg: message }] });
};

const validateRequestBody = (body, requiredFields) => {
    for (let field of requiredFields) {
        if (!body.hasOwnProperty(field)) {
            return { isValid: false, missingField: field };
        }
    }
    return { isValid: true };
};


module.exports = {
    validateRequestBody,
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    sendError
};
