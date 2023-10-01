const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const compression = require("compression");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const {
    Category,
    Department,
    Location,
    Notification,
    Service,
    Staff,
    User,
    Volunteer,
} = require("./models/models");
const {
    validateRequestBody,
    hashPassword,
    generateToken,
    sendError,
    comparePassword,
} = require("./utils/helper"); // Import the hashPassword function
const auth = require("./middlware/auth");

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

const addDefaultAdmin = async() => {
    const defaultAdminEmail = "admin@cqu.com";
    const defaultAdminPassword = "adminadmin";

    try {
        await User.findOneAndUpdate({ email: defaultAdminEmail }, // find a document with this filter
            {
                email: defaultAdminEmail,
                password: await hashPassword(defaultAdminPassword),
                acctType: "admin",
            }, {
                upsert: true, // if not exist, create it
                new: true, // return the updated document
                setDefaultsOnInsert: true, // use the model's default values if set
            }
        );
    } catch (err) {
        console.error("Error creating default admin:", err);
    }
};

// Call the function to ensure the default admin is added/exists
addDefaultAdmin();

/** Functions for handling requests */
const signup = async(req, res) => {
    const requiredFields = [
        "email",
        "password",
        "firstName",
        "lastName",
        "phone",
        "preferred_categories",
        "preferred_locations",
        "preferred_channels",
    ];
    const validation = validateRequestBody(req.body, requiredFields);

    if (!validation.isValid) {
        return sendError(res, 400, `Missing parameter: ${validation.missingField}`);
    }
    const {
        email,
        password,
        firstName,
        lastName,
        phone,
        preferred_categories,
        preferred_locations,
        preferred_channels,
    } = req.body;

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
        return sendError(res, 400, "Invalid email format");
    }

    if (password.length < 6) {
        return sendError(res, 400, "Password should be at least 6 characters long");
    }
    // Validate if the provided categories exist
    const categories = await Category.find({
        _id: { $in: preferred_categories },
    });
    if (categories.length !== preferred_categories.length) {
        return sendError(res, 400, "Some categories are invalid");
    }
    // Validate if the provided locations exist
    const locations = await Location.find({ _id: { $in: preferred_locations } });
    if (locations.length !== preferred_locations.length) {
        return sendError(res, 400, "Some locations are invalid");
    }

    try {
        if (await User.findOne({ email })) {
            return sendError(res, 400, "User already exists");
        }

        const user = new User({
            email,
            password: await hashPassword(password),
            acctType: "volunteer",
            firstName,
            lastName,
            phone,
        });

        await user.save();

        const volunteer = new Volunteer({
            _id: user._id,
            firstName,
            lastName,
            phone: phone,
            preferred_categories,
            preferred_locations,
            preferred_channels,
        });

        await volunteer.save();

        res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const login = async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await comparePassword(password, user.password))) {
            return sendError(res, 400, "Invalid credentials");
        }
        const token = generateToken({
            user: {
                id: user.id,
                acctType: user.acctType, //authType: user.authType
            },
        });
        res.json({ token, user: { id: user.id, acctType: user.acctType } }); //authType: user.authType
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const getVolunteerProfile = async(req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user || user.acctType !== "volunteer") {
            return sendError(res, 404, "User not found or not a volunteer");
        }

        // Fetch volunteer data from the Volunteer model
        const volunteerData = await Volunteer.findById(req.userId)
            .populate("preferred_categories")
            .populate("preferred_locations");

        if (!volunteerData) {
            return sendError(res, 404, "Volunteer data not found");
        }

        // Combine user and volunteer data
        const combinedData = {
            ...user._doc, // Spread user data
            ...volunteerData._doc, // Spread volunteer data
            password: undefined, // Ensure password is not included
        };

        res.json(combinedData);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};

const updateVolunteerProfile = async(req, res) => {
    if (req.authType !== "volunteer") {
        return res
            .status(403)
            .json({ error: "Only volunteers can update their profiles" });
    }

    const volunteerId = req.userId;
    try {
        // Validation for categories and locations, if they are provided in the request
        if (req.body.preferred_categories) {
            const categories = await Category.find({
                _id: { $in: req.body.preferred_categories },
            });
            if (categories.length !== req.body.preferred_categories.length) {
                return res.status(400).json({ error: "Some categories are invalid" });
            }
        }

        if (req.body.preferred_locations) {
            const locations = await Location.find({
                _id: { $in: req.body.preferred_locations },
            });
            if (locations.length !== req.body.preferred_locations.length) {
                return res.status(400).json({ error: "Some locations are invalid" });
            }
        }

        // Update the volunteer profile
        const updatedVolunteer = await Volunteer.findByIdAndUpdate(
            volunteerId,
            req.body, { new: true, runValidators: true }
        );

        if (!updatedVolunteer) {
            return res.status(404).json({ error: "Volunteer not found" });
        }

        res.status(200).json(updatedVolunteer);
    } catch (err) {
        res.status(500).json({ error: "Server error: " + err });
    }
};

const addCategory = async(req, res) => {
    if (req.authType !== "admin") {
        return sendError(res, 403, "Only admins can add categories");
    }
    const { categoryName } = req.body;

    if (!categoryName) {
        return sendError(res, 400, "Category name is required");
    }

    try {
        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            return sendError(res, 400, "Category already exists");
        }

        const category = new Category({ categoryName });
        await category.save();

        res.status(201).json(category);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const getAllCategories = async(req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const addLocation = async(req, res) => {
    if (req.authType !== "admin") {
        return sendError(res, 403, "Only admins can add locations");
    }
    const { locationName } = req.body;

    if (!locationName) {
        return sendError(res, 400, "Location name is required");
    }

    try {
        const existingLocation = await Location.findOne({ locationName });
        if (existingLocation) {
            return sendError(res, 400, "Location already exists");
        }

        const location = new Location({ locationName });
        await location.save();

        res.status(201).json(location);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const getAllLocations = async(req, res) => {
    try {
        const locations = await Location.find();
        res.json(locations);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const addDepartment = async(req, res) => {
    if (req.authType !== "admin") {
        return sendError(res, 403, "Only admins can add departments");
    }
    const { departmentName } = req.body;

    if (!departmentName) {
        return sendError(res, 400, "Department name is required");
    }

    try {
        const existingDepartment = await Department.findOne({ departmentName });
        if (existingDepartment) {
            return sendError(res, 400, "Department already exists");
        }

        const department = new Department({ departmentName });
        await department.save();

        res.status(201).json(department);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const getAllDepartments = async(req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const addStaff = async(req, res) => {
    if (req.authType !== "admin") {
        return sendError(res, 403, "Only admins can add staff members");
    }
    const requiredFields = [
        "email",
        "password",
        "department",
        "location",
        "firstName",
        "lastName",
        "phoneNo",
    ];
    const validation = validateRequestBody(req.body, requiredFields);
    if (!validation.isValid) {
        return sendError(res, 400, `Missing parameter: ${validation.missingField}`);
    }

    const {
        email,
        password,
        department,
        location,
        firstName,
        lastName,
        phoneNo,
    } = req.body;

    try {
        // Check if user with the provided email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 400, "User with this email already exists");
        }

        // Create a new user
        const user = new User({
            email,
            password: await hashPassword(password),
            authType: "staff",
        });

        await user.save();

        // Create a new staff member with the user's ID
        const staff = new Staff({
            _id: user._id,
            department,
            location,
            firstName,
            lastName,
            phoneNo,
        });

        await staff.save();

        res.status(201).json(staff);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const getAllStaff = async(req, res) => {
    try {
        const staffMembers = await Staff.find()
            .populate("department")
            .populate("location");
        res.json(staffMembers);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};
const addService = async(req, res) => {
    if (req.authType !== "staff") {
        return sendError(res, 403, "Only staff members can add services");
    }

    const requiredFields = [
        "category",
        "location",
        "serviceName",
        "description",
        "expireDate",
        "status",
    ];
    const validation = validateRequestBody(req.body, requiredFields);
    if (!validation.isValid) {
        return sendError(res, 400, `Missing parameter: ${validation.missingField}`);
    }

    const { category, location, serviceName, description, expireDate, status } =
    req.body;

    try {
        const service = new Service({
            category,
            location,
            serviceName,
            description,
            expireDate,
            status,
        });

        await service.save();

        // Fetch all the volunteers who have the added service's category and location in their preferences.
        const matchedVolunteers = await Volunteer.find({
            preferred_categories: { $in: [category] },
            preferred_locations: { $in: [location] },
        });

        // Loop through each matched volunteer and create a notification for them.
        for (const volunteer of matchedVolunteers) {
            const notification = new Notification({
                sender: req.userId,
                recipient: volunteer._id,
                subject: `New Service: ${serviceName}`,
                message: `A new service named ${serviceName} is available in your preferred category and location.`,
                relatedService: service._id,
            });

            await notification.save();
        }

        res.status(201).json(service);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};

const getPreferredServicesForVolunteer = async(volunteerId) => {
    const volunteerData = await Volunteer.findById(volunteerId);
    if (!volunteerData) {
        throw new Error("Volunteer data not found");
    }

    const preferredServices = await Service.find({
        category: { $in: volunteerData.preferred_categories },
        location: { $in: volunteerData.preferred_locations },
    });

    return preferredServices;
};

const getService = async(req, res) => {
    let conditions = [];
    if (req.query.q) {
        const query = new RegExp(req.query.q, "i");
        conditions = [
            { serviceName: query },
            { description: query },
            { "category.categoryName": query },
            { "location.locationName": query },
        ];
    }

    const baseQuery = conditions.length ? { $or: conditions } : {};

    if (req.authType === "staff") {
        try {
            const services = await Service.find(baseQuery)
                .populate("category", "categoryName bookingLink")
                .populate("location", "locationName");

            res.json(services);
        } catch (err) {
            sendError(res, 500, "Server error: " + err);
        }
    } else if (req.authType === "volunteer") {
        try {
            // Get preferred services for the volunteer
            const services = await getPreferredServicesForVolunteer(req.userId);

            // Now, filter out the ones that are not online and then populate necessary fields
            const onlinePreferredServices = await Service.find({
                    _id: { $in: services.map((service) => service._id) },
                    ...baseQuery,
                    status: "online",
                })
                .populate("category", "categoryName bookingLink")
                .populate("location", "locationName");

            res.json(onlinePreferredServices);
        } catch (err) {
            sendError(res, 500, "Server error: " + err);
        }
    }
};
const getServiceByDateRange = async(req, res) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    let dateConditions = {};

    if (startDate && endDate) {
        dateConditions.expireDate = {
            $gte: startDate,
            $lte: endDate,
        };
    } else if (startDate) {
        dateConditions.expireDate = {
            $gte: startDate,
        };
    } else if (endDate) {
        dateConditions.expireDate = {
            $lte: endDate,
        };
    }

    if (req.authType === "staff") {
        try {
            const services = await Service.find({
                    ...dateConditions,
                    status: "online",
                })
                .populate("category", "categoryName bookingLink")
                .populate("location", "locationName");

            res.json(services);
        } catch (err) {
            sendError(res, 500, "Server error: " + err);
        }
    } else if (req.authType === "volunteer") {
        try {
            // Get volunteer preferences
            const volunteer = await Volunteer.findById(req.userId);
            if (!volunteer) {
                return sendError(res, 404, "Volunteer not found");
            }

            // Combine preferred categories, locations, date conditions, and online status
            const conditions = {
                ...dateConditions,
                status: "online",
                category: { $in: volunteer.preferred_categories },
                location: { $in: volunteer.preferred_locations },
            };

            const services = await Service.find(conditions)
                .populate("category", "categoryName bookingLink")
                .populate("location", "locationName");

            res.json(services);
        } catch (err) {
            sendError(res, 500, "Server error: " + err);
        }
    }
};

const getServiceById = async(req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate("category", "categoryName bookingLink")
            .populate("location", "locationName");

        if (!service) {
            return sendError(res, 404, "Service not found");
        }

        res.json(service);
    } catch (err) {
        sendError(res, 500, "Server error: " + err);
    }
};

const getFilteredVolunteers = async(req, res) => {

    if (req.authType !== 'admin' && req.authType !== 'staff') {
        sendError(res, 403, 'Only admins can view volunteers');

    } else {
        try {
            const category = req.body.category;
            const location = req.body.location;
            const filteQuery = {};

            if (category.length > 0) {
                filteQuery.preferred_categories = { $in: category }
            }

            if (category.length > 0) {
                filteQuery.preferred_locations = { $in: location }
            }
            const volunteers = await Volunteer.find(filteQuery);
            res.status(200).json(volunteers);

        } catch (err) {
            sendError(res, 500, 'Server error: ' + err);
        }
    }

};

const getAllVolunteers = async(req, res) => {
    if (req.authType !== "staff" && req.authType !== "admin") {
        sendError(res, 403, "Only staff or admins can view volunteers");
    } else {
        try {
            const volunteers = await Volunteer.find();
            res.status(200).json(volunteers);
        } catch (err) {
            sendError(res, 500, "Server error: " + err);
        }
    }
};

const deleteCategory = async(req, res) => {
    try {
        const categoryId = req.params.id;
        const result = await Category.findByIdAndRemove(categoryId);
        if (!result) {
            return res.status(404).send({ message: "Category not found" });
        }
        res.status(200).send({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting category: " + error });
    }
};
const deleteLocation = async(req, res) => {
    try {
        const locationId = req.params.id;
        const result = await Location.findByIdAndRemove(locationId);
        if (!result) {
            return res.status(404).send({ message: "Location not found" });
        }
        res.status(200).send({ message: "Location deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting location: " + error });
    }
};

const deleteDepartment = async(req, res) => {
    try {
        const departmentId = req.params.id;
        const result = await Department.findByIdAndRemove(departmentId);
        if (!result) {
            return res.status(404).send({ message: "Department not found" });
        }
        res.status(200).send({ message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting department: " + error });
    }
};

const deleteStaff = async(req, res) => {
    try {
        const staffId = req.params.id;
        const result = await Staff.findByIdAndRemove(staffId);
        if (!result) {
            return res.status(404).send({ message: "Staff not found" });
        }
        res.status(200).send({ message: "Staff deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting staff: " + error });
    }
};

const deleteService = async(req, res) => {
    try {
        const serviceId = req.params.id;
        const result = await Service.findByIdAndRemove(serviceId);
        if (!result) {
            return res.status(404).send({ message: "Service not found" });
        }
        res.status(200).send({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting service: " + error });
    }
};

const deleteVolunteer = async(req, res) => {
    try {
        const volunteerId = req.params.id;
        const result = await Volunteer.findByIdAndRemove(volunteerId);
        if (!result) {
            return res.status(404).send({ message: "Volunteer not found" });
        }
        res.status(200).send({ message: "Volunteer deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting volunteer: " + error });
    }
};

const getNotifications = async(req, res) => {
    if (req.authType === "volunteer") {
        try {
            const notifications = await Notification.find({ recipient: req.userId })
                .populate("sender", "firstName lastName")
                .populate("relatedService", "serviceName description expireDate status")
                .populate("recipient", "firstName lastName phone"); // Populate volunteer data
            res.status(200).json(notifications);
        } catch (err) {
            res.status(500).json({ error: "Server error: " + err });
        }
    } else if (req.authType === "staff") {
        try {
            const notifications = await Notification.aggregate([
                {
                    $match: { sender: new mongoose.Types.ObjectId(req.userId) },
                },
                {
                    $lookup: {
                        from: "volunteers",
                        localField: "recipient",
                        foreignField: "_id",
                        as: "volunteerInfo",
                    },
                },
                {
                    $unwind: "$volunteerInfo",
                },
                {
                    $group: {
                        _id: "$subject", // Group by subject
                        readStatus: { $first: "$readStatus" },
                        message: { $first: "$message" },
                        relatedService: { $first: "$relatedService" },
                        createdAt: { $first: "$createdAt" }, // Include createdAt field
                        volunteers: { $push: "$volunteerInfo" }, // Push each volunteer into the array
                    },
                },
            ]);
        
            res.status(200).json(notifications);
        } catch (err) {
            res.status(500).json({ error: "Server error: " + err });
        }
        
    } else {
        res.status(403).json({ error: "Unauthorized" });
    }
};

const sendNotification = async(req, res) => {
    if (req.authType !== "staff") {
        return res
            .status(403)
            .json({ error: "Only staff members can send notifications" });
    }

    const { volunteerIds, subject, message, relatedService } = req.body;

    // Validate required fields
    if (!volunteerIds || !Array.isArray(volunteerIds) || !subject || !message) {
        return res
            .status(400)
            .json({ error: "Required fields: volunteerIds, subject, message" });
    }

    const notifications = volunteerIds.map((volunteerId) => ({
        sender: req.userId, // assuming staff's user ID is stored in req.userId
        recipient: volunteerId,
        subject,
        message,
        relatedService,
    }));

    try {
        await Notification.insertMany(notifications);

        res.status(201).json({ message: "Notifications sent successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
};

const updateService = async(req, res) => {
    if (req.authType !== "staff") {
        return res
            .status(403)
            .json({ error: "Only staff members can update services" });
    }

    const serviceId = req.params.id; // Assuming you'll pass the service ID as a route parameter

    if (!serviceId) {
        return res.status(400).json({ error: "Service ID is required" });
    }

    try {
        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            req.body, { new: true }
        );

        if (!updatedService) {
            return res.status(404).json({ error: "Service not found" });
        }

        res.status(200).json(updatedService);
    } catch (err) {
        res.status(500).json({ error: "Server error: " + err });
    }
};

const updateCategory = async(req, res) => {
    console.log(req.authType)
    if (req.authType !== "staff" && req.authType !== "admin") {
        return res.status(403).json({ error: "Only staff or admin can update categories" });
    }

    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }

        return res.status(200).json(updatedCategory);
    } catch (err) {
        return res.status(500).json({ error: "Server error: " + err });
    }
};
const updateLocation = async(req, res) => {
    if (req.authType !== "staff" && req.authType !== "admin") {
        return res.status(403).json({ error: "Only staff can update locations" });
    }

    try {
        const updatedLocation = await Location.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedLocation) {
            return res.status(404).json({ error: "Location not found" });
        }

        return res.status(200).json(updatedLocation);
    } catch (err) {
        return res.status(500).json({ error: "Server error: " + err });
    }
};
const updateDepartment = async(req, res) => {
    if (req.authType !== "staff" && req.authType !== "admin") {
        return res.status(403).json({ error: "Only staff can update departments" });
    }

    try {
        const updatedDepartment = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedDepartment) {
            return res.status(404).json({ error: "Department not found" });
        }

        return res.status(200).json(updatedDepartment);
    } catch (err) {
        return res.status(500).json({ error: "Server error: " + err });
    }
};
const updateStaff = async(req, res) => {
    if (req.authType !== "staff" && req.authType !== "admin") {
        return res.status(403).json({ error: "Only staff can update staff details" });
    }

    try {
        const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedStaff) {
            return res.status(404).json({ error: "Staff not found" });
        }

        return res.status(200).json(updatedStaff);
    } catch (err) {
        return res.status(500).json({ error: "Server error: " + err });
    }
};



// Define Routes
app.post("/signup", signup);
app.post("/login", login);
app.get("/profile", auth, getVolunteerProfile);
app.put("/profile", auth, updateVolunteerProfile);
// Categories
app.post("/category", auth, addCategory);
app.get("/category", getAllCategories);
app.delete("/category/:id", auth, deleteCategory); // Delete route for category
app.put("/category/:id", auth, updateCategory);

// Locations
app.post("/location", auth, addLocation);
app.get("/location", getAllLocations);
app.delete("/location/:id", auth, deleteLocation); // Delete route for location
app.put("/location/:id", auth, updateLocation);

// Departments
app.get("/department", auth, getAllDepartments);
app.post("/department", auth, addDepartment);
app.delete("/department/:id", auth, deleteDepartment); // Delete route for department
app.put("/department/:id", auth, updateDepartment);

// Staff
app.post("/staff", auth, addStaff);
app.get("/staff", auth, getAllStaff);
app.delete("/staff/:id", auth, deleteStaff); // Delete route for staff
app.put("/staff/:id", auth, updateStaff);

// Services
app.get("/service", auth, getService);
app.get("/service/date", auth, getServiceByDateRange);
app.get("/service/:id", auth, getServiceById);
app.post("/service", auth, addService);
app.delete("/service/:id", auth, deleteService); // Delete route for service
app.put("/service/:id", auth, updateService);

// Volunteers
app.get("/volunteer", auth, getAllVolunteers);
app.post('/volunteer', auth, getFilteredVolunteers); //NEW
app.delete("/volunteer/:id", auth, deleteVolunteer); // Delete route for volunteer

// Notifications
app.get("/notification", auth, getNotifications);
app.post("/notification", auth, sendNotification);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
