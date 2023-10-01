require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {
  User,
  Volunteer,
  Department,
  Location,
  Category,
  Service,
  Notification,
  Staff
} = require("./src/models/models");

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const saltRounds = 10;

const users = [
  new User({
    email: "staff@cqu.com",
    password: bcrypt.hashSync("staffstaff", saltRounds),
    acctType: "staff",
  }),
];

const departments = [
  new Department({ departmentName: "Hair & Beauty" }),
  new Department({ departmentName: "Hospitality" }),
  new Department({ departmentName: "Health Care" }),
];

const locations = [
  new Location({ locationName: "Gladstone", abbreviation: "GTN" }),
  new Location({ locationName: "Mackay", abbreviation: "MKY" }),
  new Location({ locationName: "Rockhampton", abbreviation: "RKH" }),
  new Location({ locationName: "Brisbane", abbreviation: "BNE" }),
];
const staffs = [
  new Staff({
    _id: users[0]._id,
    department: departments[0]._id,
    location: locations[0]._id,
    firstName: "Staff",
    lastName: "Staff",
    phoneNo: "0400000000",
  }),
];

const categories = [
  new Category({ categoryName: "Hairdressing", bookingLink: "https://www.cqu.edu.au/engage/hair-and-beauty" }),
  new Category({ categoryName: "Beauty", bookingLink: "https://www.cqu.edu.au/engage/hair-and-beauty" }),
  new Category({ categoryName: "Catering", bookingLink: "https://www.cqu.edu.au/engage/restaurants-catering-canteens" }),
  new Category({ categoryName: "Restaurant", bookingLink: "https://www.cqu.edu.au/engage/restaurants-catering-canteens" }),
  new Category({ categoryName: "Chiropractic", bookingLink: "https://www.cqu.edu.au/engage/health-clinics" }),
  new Category({ categoryName: "Physiotherapy", bookingLink: "https://www.cqu.edu.au/engage/health-clinics" }),
  new Category({ categoryName: "Oral Health", bookingLink: "https://www.cqu.edu.au/engage/health-clinics" }),
  new Category({ categoryName: "Occupational Therapy", bookingLink: "https://www.cqu.edu.au/engage/health-clinics" }),
  new Category({ categoryName: "Speech Pathology", bookingLink: "https://www.cqu.edu.au/engage/health-clinics" }),
  new Category({ categoryName: "Podiatry", bookingLink: "https://www.cqu.edu.au/engage/health-clinics" }),
];




const services = [
  // Hair & Beauty - Gladstone
  new Service({
    serviceName: "Colour",
    description: "A complete hair coloring service to give you a fresh look.",
    category: categories[0]._id,
    location: locations[0]._id,
    expireDate: new Date("2023-09-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Cut",
    description: "Professional hair cutting and styling.",
    category: categories[0]._id,
    location: locations[0]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Permanant Wave",
    description: "Get those perfect waves for a lasting impression.",
    category: categories[0]._id,
    location: locations[0]._id,
    expireDate: new Date("2023-11-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Straightening",
    description: "Straighten your hair for a sleek look.",
    category: categories[0]._id,
    location: locations[0]._id,
    expireDate: new Date("2023-12-01"),
    status: "online",
  }),

  // Hair & Beauty - Mackay
  new Service({
    serviceName: "Waxing",
    description: "Smooth skin with professional waxing services.",
    category: categories[1]._id,
    location: locations[1]._id,
    expireDate: new Date("2023-11-15"),
    status: "online",
  }),
  new Service({
    serviceName: "Tinting",
    description: "Enhance your lashes and brows with our tinting service.",
    category: categories[1]._id,
    location: locations[1]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Nail Treatments",
    description: "Get your nails looking their best.",
    category: categories[1]._id,
    location: locations[1]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Facials",
    description: "Rejuvenate your skin with our range of facials.",
    category: categories[1]._id,
    location: locations[1]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Massage",
    description: "Relax and unwind with our therapeutic massages.",
    category: categories[1]._id,
    location: locations[1]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Tanning",
    description: "Get a sun-kissed glow with our tanning services.",
    category: categories[1]._id,
    location: locations[1]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),

  // Hospitality - Mackay
  new Service({
    serviceName: "Event Management",
    description: "Professional event planning and management.",
    category: categories[2]._id,
    location: locations[1]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),

  // Hospitality - Rockhampton
  new Service({
    serviceName: "Dine-in Reservation",
    description: "Reserve a table for a delightful dining experience.",
    category: categories[3]._id,
    location: locations[2]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),

  // Health Care - Mackay
  new Service({
    serviceName: "Initial Diagnosis Session",
    description: "First-time chiropractic assessment.",
    category: categories[4]._id,
    location: locations[1]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Treatment Session",
    description: "Chiropractic treatment based on your diagnosis.",
    category: categories[4]._id,
    location: locations[1]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),

  // Health Care - Rockhampton
  new Service({
    serviceName: "Taping",
    description: "Supportive taping for injuries.",
    category: categories[5]._id,
    location: locations[2]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Sports injuries",
    description: "Treatment for various sports-related injuries.",
    category: categories[5]._id,
    location: locations[2]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Headahes",
    description: "Physiotherapy treatments for headaches.",
    category: categories[5]._id,
    location: locations[2]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Exercise classes",
    description: "Guided exercise sessions for strength and flexibility.",
    category: categories[5]._id,
    location: locations[2]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Strength Programs",
    description: "Customized strength training programs.",
    category: categories[5]._id,
    location: locations[2]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Gait assessments",
    description: "Analysis and assessment of walking patterns.",
    category: categories[5]._id,
    location: locations[2]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),

  // Health Care - Brisbane
  new Service({
    serviceName: "Hygiene Advice",
    description: "Guidance on maintaining oral hygiene.",
    category: categories[6]._id,
    location: locations[3]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Examination",
    description: "Comprehensive oral examination.",
    category: categories[6]._id,
    location: locations[3]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Flouride Treatment",
    description: "Treatment to prevent tooth decay.",
    category: categories[6]._id,
    location: locations[3]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Scaling and Clen",
    description: "Deep cleaning of teeth and gums.",
    category: categories[6]._id,
    location: locations[3]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Mouthgaurds",
    description: "Custom-made mouthguards for protection.",
    category: categories[6]._id,
    location: locations[3]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),
  new Service({
    serviceName: "Fillings",
    description: "Treatment to restore damaged teeth.",
    category: categories[6]._id,
    location: locations[3]._id,
    expireDate: new Date("2023-10-30"),
    status: "online",
  }),

  // Health Care - General (not location specific)
  new Service({
    serviceName: "Paediatric Services",
    description: "Specialized care for children.",
    category: categories[7]._id,
  }),
  new Service({
    serviceName: "Adult Support",
    description: "Occupational therapy for adults.",
    category: categories[7]._id,
  }),
  new Service({
    serviceName: "Individual Session",
    description: "One-on-one speech therapy.",
    category: categories[8]._id,
  }),
  new Service({
    serviceName: "Group Sessions",
    description: "Group speech therapy sessions.",
    category: categories[8]._id,
  }),
  new Service({
    serviceName: "Outreach visits",
    description: "On-site speech therapy sessions.",
    category: categories[8]._id,
  }),
  new Service({
    serviceName: "Orthotic therapy",
    description: "Custom orthotic solutions for foot issues.",
    category: categories[9]._id,
  }),
  new Service({
    serviceName: "Nail Surgey",
    description: "Surgical solutions for nail problems.",
    category: categories[9]._id,
  }),
  new Service({
    serviceName: "Biomechanical assessment",
    description: "Analysis of movement and posture.",
    category: categories[9]._id,
  }),
];

async function cleanDB() {
  try {
    await User.deleteMany({});
    await Department.deleteMany({});
    await Location.deleteMany({});
    await Category.deleteMany({});
    await Service.deleteMany({});
    await Volunteer.deleteMany({});
    await Staff.deleteMany({});
    await Notification.deleteMany({});

    console.log("Database cleaned!");
  } catch (err) {
    console.error("Error cleaning database:", err);
  }
}

async function seedDB() {
  // First, clean the database
  await cleanDB();

  try {
    await User.insertMany(users);
    await Department.insertMany(departments);
    await Location.insertMany(locations);
    await Category.insertMany(categories);
    await Service.insertMany(services);
    await Staff.insertMany(staffs);

    console.log("Sample data seeded!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding data:", err);
    mongoose.connection.close();
  }
}

seedDB();
