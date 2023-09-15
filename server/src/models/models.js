const mongoose = require('mongoose');

const options = { timestamps: true };

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
}, options);

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        unique: true
    },
}, options);

const locationSchema = new mongoose.Schema({
    locationName: {
        type: String,
        required: true,
        unique: true
    },
}, options);

const serviceSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    serviceName: String,
    description: String,
    expireDate: Date,
    status: {
        type: String,
        enum: ['online', 'offline']
    }
}, options);

const staffSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Override the default _id with user reference
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    firstName: String,
    lastName: String,
    phoneNo: String
}, options);

const volunteerSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Override the default _id with user reference
    firstName: String,
    lastName: String,
    phone: String,
    preferred_categories: [{ type: mongoose.Schema.ObjectId, ref: "Category" }],
    preferred_locations: [{ type: mongoose.Schema.ObjectId, ref: "Location" }],
    preferred_channels: [{
        type: String,
        enum: ['SMS', 'EMAIL', 'PUSH']
    }],
    notifications: [
        {
            subject: String,
            message: String,
            serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
            sentOn: Date,
        }
    ]

}, options);


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    acctType: { type: String, required: true, enum: ['volunteer', 'staff', 'admin'] },
}, options);

module.exports = {
    Category: mongoose.model('Category', categorySchema),
    Department: mongoose.model('Department', departmentSchema),
    Location: mongoose.model('Location', locationSchema),
    Service: mongoose.model('Service', serviceSchema),
    Staff: mongoose.model('Staff', staffSchema),
    User: mongoose.model('User', userSchema),
    Volunteer: mongoose.model('Volunteer', volunteerSchema)
};
