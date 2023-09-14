const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const compression = require("compression");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const { Category
    , Department
    , Location
    , Notification
    , Service
    , Staff
    , User
    , Volunteer } = require('./models/models');
const { validateRequestBody, hashPassword, generateToken, sendError, comparePassword } = require('./utils/helper'); // Import the hashPassword function
const auth = require('./middlware/auth')

const app = express();

// Middleware
app.use(morgan("dev")); // HTTP request logger
app.use(helmet()); // Helps secure your app by setting various HTTP headers
app.use(cors()); // Enables CORS
app.use(compression()); // Compresses response bodies
app.use(bodyParser.json()); // Parses incoming request bodies

// Connect to Database
connectDB();
app.use(express.json());

const addDefaultAdmin = async () => {
    const defaultAdminEmail = "admin@cqu.com";
    const defaultAdminPassword = "adminadmin";

    try {
        await User.findOneAndUpdate(
            { email: defaultAdminEmail }, // find a document with this filter
            {
                email: defaultAdminEmail,
                password: await hashPassword(defaultAdminPassword),
                acctType: "admin"
            },
            {
                upsert: true, // if not exist, create it
                new: true, // return the updated document
                setDefaultsOnInsert: true // use the model's default values if set
            }
        );
    } catch (err) {
        console.error("Error creating default admin:", err);
    }
};

// Call the function to ensure the default admin is added/exists
addDefaultAdmin();

/** Functions for handling requests */
const signup = async (req, res) => {
    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'phone', 'preferred_categories', 'preferred_locations', 'preferred_channels'];
    const validation = validateRequestBody(req.body, requiredFields);

    if (!validation.isValid) {
        return sendError(res, 400, `Missing parameter: ${validation.missingField}`);
    }
    const { email, password, firstName, lastName, phone, preferred_categories, preferred_locations, preferred_channels } = req.body;

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
        return sendError(res, 400, 'Invalid email format');
    }

    if (password.length < 6) {
        return sendError(res, 400, 'Password should be at least 6 characters long');
    }
    // Validate if the provided categories exist
    const categories = await Category.find({ '_id': { $in: preferred_categories } });
    if (categories.length !== preferred_categories.length) {
        return sendError(res, 400, 'Some categories are invalid');
    }
    // Validate if the provided locations exist
    const locations = await Location.find({ '_id': { $in: preferred_locations } });
    if (locations.length !== preferred_locations.length) {
        return sendError(res, 400, 'Some locations are invalid');
    }

    try {
        if (await User.findOne({ email })) {
            return sendError(res, 400, 'User already exists');
        }

        const user = new User({
            email,
            password: await hashPassword(password),
            acctType: "volunteer",
            firstName,
            lastName,
            phone
        });

        await user.save();

        const volunteer = new Volunteer({
            _id: user._id,
            firstName,
            lastName,
            phone: phone,
            preferred_categories,
            preferred_locations,
            preferred_channels
        });

        await volunteer.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await comparePassword(password, user.password))) {
            return sendError(res, 400, 'Invalid credentials');
        }

        const token = generateToken({
            user: {
                id: user.id,
                acctType: user.acctType
            }
        });

        res.json({ token, user: { id: user.id, acctType: user.acctType } });
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const getVolunteerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user || user.acctType !== 'volunteer') {
            return sendError(res, 404, 'User not found or not a volunteer');
        }

        // Fetch volunteer data from the Volunteer model
        const volunteerData = await Volunteer.findById(req.userId)
            .populate('preferred_categories')  // Assuming you want detailed category info
            .populate('preferred_locations');  // Assuming you want detailed location info

        if (!volunteerData) {
            return sendError(res, 404, 'Volunteer data not found');
        }

        // Combine user and volunteer data
        const combinedData = {
            ...user._doc,  // Spread user data
            ...volunteerData._doc,  // Spread volunteer data
            password: undefined  // Ensure password is not included
        };

        res.json(combinedData);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const updateVolunteerProfile = async (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'phone', 'preferred_categories', 'preferred_locations', 'preferred_channels'];
    const validation = validateRequestBody(req.body, requiredFields);

    if (!validation.isValid) {
        return sendError(res, 400, `Missing parameter: ${validation.missingField}`);
    }

    try {
        const volunteer = await Volunteer.findById(req.userId);
        if (!volunteer) {
            return sendError(res, 404, 'Volunteer not found');
        }

        // Update fields
        const { firstName, lastName, phone, preferred_categories, preferred_locations, preferred_channels } = req.body;

        volunteer.firstName = firstName;
        volunteer.lastName = lastName;
        volunteer.phone = phone;

        // Validate if the provided categories exist
        const categories = await Category.find({ '_id': { $in: preferred_categories } });
        if (categories.length !== preferred_categories.length) {
            return sendError(res, 400, 'Some categories are invalid');
        }
        volunteer.preferred_categories = preferred_categories;

        // Validate if the provided locations exist
        const locations = await Location.find({ '_id': { $in: preferred_locations } });
        if (locations.length !== preferred_locations.length) {
            return sendError(res, 400, 'Some locations are invalid');
        }
        volunteer.preferred_locations = preferred_locations;

        volunteer.preferred_channels = preferred_channels;

        // Save the updated volunteer
        await volunteer.save();

        // Return the updated volunteer profile to the client
        res.json(volunteer);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const addCategory = async (req, res) => {
    if (req.authType !== 'admin') {
        return sendError(res, 403, 'Only admins can add categories');
    }
    const { categoryName } = req.body;

    if (!categoryName) {
        return sendError(res, 400, 'Category name is required');
    }

    try {
        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            return sendError(res, 400, 'Category already exists');
        }

        const category = new Category({ categoryName });
        await category.save();

        res.status(201).json(category);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const addLocation = async (req, res) => {
    if (req.authType !== 'admin') {
        return sendError(res, 403, 'Only admins can add locations');
    }
    const { locationName } = req.body;

    if (!locationName) {
        return sendError(res, 400, 'Location name is required');
    }

    try {
        const existingLocation = await Location.findOne({ locationName });
        if (existingLocation) {
            return sendError(res, 400, 'Location already exists');
        }

        const location = new Location({ locationName });
        await location.save();

        res.status(201).json(location);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find();
        res.json(locations);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const addDepartment = async (req, res) => {
    if (req.authType !== 'admin') {
        return sendError(res, 403, 'Only admins can add departments');
    }
    const { departmentName } = req.body;

    if (!departmentName) {
        return sendError(res, 400, 'Department name is required');
    }

    try {
        const existingDepartment = await Department.findOne({ departmentName });
        if (existingDepartment) {
            return sendError(res, 400, 'Department already exists');
        }

        const department = new Department({ departmentName });
        await department.save();

        res.status(201).json(department);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const addStaff = async (req, res) => {
    if (req.authType !== 'admin') {
        return sendError(res, 403, 'Only admins can add staff members');
    }
    const requiredFields = ['email', 'password', 'department', 'location', 'firstName', 'lastName', 'phoneNo'];
    const validation = validateRequestBody(req.body, requiredFields);
    if (!validation.isValid) {
        return sendError(res, 400, `Missing parameter: ${validation.missingField}`);
    }

    const { email, password, department, location, firstName, lastName, phoneNo } = req.body;

    try {
        // Check if user with the provided email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 400, 'User with this email already exists');
        }

        // Create a new user
        const user = new User({
            email,
            password: await hashPassword(password),
            acctType: "staff"
        });

        await user.save();

        // Create a new staff member with the user's ID
        const staff = new Staff({
            _id: user._id,
            department,
            location,
            firstName,
            lastName,
            phoneNo
        });

        await staff.save();

        res.status(201).json(staff);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const getAllStaff = async (req, res) => {
    try {
        const staffMembers = await Staff.find()
            .populate('department')
            .populate('location');
        res.json(staffMembers);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const addService = async (req, res) => {
    if (req.authType !== 'staff') {
        return sendError(res, 403, 'Only staff members can add services');
    }

    const requiredFields = ['category', 'location', 'serviceName', 'description', 'expireDate', 'status'];
    const validation = validateRequestBody(req.body, requiredFields);
    if (!validation.isValid) {
        return sendError(res, 400, `Missing parameter: ${validation.missingField}`);
    }

    const { category, location, serviceName, description, expireDate, status } = req.body;

    try {
        const service = new Service({
            category,
            location,
            serviceName,
            description,
            expireDate,
            status
        });

        await service.save();

        // Define the notification
        const notification = {
            subject: serviceName,
            message: `A new service named ${serviceName} is available in your preferred category and location.`,
            serviceId: service._id
        };

        // Add the notification to all matching volunteers in a single operation
        await Volunteer.updateMany(
            {
                preferred_categories: { $in: [category] },
                preferred_locations: { $in: [location] }
            },
            { $push: { notifications: notification } }
        );


        res.status(201).json(service);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};
const getService = async (req, res) => {
    const query = req.query.q ? new RegExp(req.query.q, 'i') : {};

    let conditions = query ? [
        { serviceName: query },
        { description: query },
        { 'category.categoryName': query },
        { 'location.locationName': query }
    ] : {};

    const baseQuery = query ? { $or: conditions } : {};

    if (req.authType === 'staff') {
        try {
            const services = await Service.find(baseQuery)
                .populate('category', 'categoryName')
                .populate('location', 'locationName');

            res.json(services);
        } catch (err) {
            sendError(res, 500, 'Server error: ' + err);
        }
    } else if (req.authType === "volunteer") {
        try {
            const services = await Service.find({ ...baseQuery, status: "online" })
                .populate('category', 'categoryName')
                .populate('location', 'locationName');

            res.json(services);
        } catch (err) {
            sendError(res, 500, 'Server error: ' + err);
        }
    }
};
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('category', 'categoryName')
            .populate('location', 'locationName');

        if (!service) {
            return sendError(res, 404, 'Service not found');
        }

        res.json(service);
    } catch (err) {
        sendError(res, 500, 'Server error: ' + err);
    }
};


const getServiceByDateRange = async (req, res) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : {};
    const endDate = req.query.endDate ? new Date(req.query.endDate) : {};

    let dateConditions = {};

    if (startDate && endDate) {
        dateConditions.expireDate = {
            $gte: startDate,
            $lte: endDate
        };
    } else if (startDate) {
        dateConditions.expireDate = {
            $gte: startDate
        };
    } else if (endDate) {
        dateConditions.expireDate = {
            $lte: endDate
        };
    }

    if (req.authType === 'staff') {
        try {
            const services = await Service.find(dateConditions)
                .populate('category', 'categoryName')
                .populate('location', 'locationName');

            res.json(services);
        } catch (err) {
            sendError(res, 500, 'Server error: ' + err);
        }
    } else if (req.authType === "volunteer") {
        try {
            const services = await Service.find({ ...dateConditions, status: "online" })
                .populate('category', 'categoryName')
                .populate('location', 'locationName');

            res.json(services);
        } catch (err) {
            sendError(res, 500, 'Server error: ' + err);
        }
    }
};
const getAllVolunteers = async (req, res) => {
    if (req.authType !== 'admin') {
        sendError(res, 403, 'Only admins can view volunteers');
    } else {
        try {
            const volunteers = await Volunteer.find();
            res.status(200).json(volunteers);
        } catch (err) {
            sendError(res, 500, 'Server error: ' + err);
        }
    }
};

// Define Routes
app.post('/signup', signup);
app.post('/login', login);
app.get('/profile', auth, getVolunteerProfile);
app.put('/profile', auth, updateVolunteerProfile);
app.post('/category', auth, addCategory);
app.get('/category', getAllCategories)
app.post('/location', auth, addLocation);
app.get('/location', getAllLocations)
app.get('/department', auth, getAllDepartments)
app.post('/department', auth, addDepartment);
app.post('/staff', auth, addStaff);
app.get('/staff', auth, getAllStaff);
app.get('/service', auth, getService);
app.get('/service/date', auth, getServiceByDateRange);
app.get('/service/:id', auth, getServiceById);
app.post('/service', auth, addService);
app.get('/volunteer', auth, getAllVolunteers);



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

