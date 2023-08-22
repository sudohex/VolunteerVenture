require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Volunteer = require('./models/volunteer');
const Service = require('./models/service');
const Location = require('./models/location');
const Notification = require('./models/notification');
const Staff = require('./models/staff');
const Department = require('./models/department');
const Category = require('./models/category')

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas!');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

const users = [
  new User({
    email: 'john@example.com',
    password: 'john1234',
    acctType: 'admin',
    lastLogin: new Date(),
    acctCreationDate: new Date()
  }),
  new User({
    email: 'jane@example.com',
    password: 'jane1234',
    acctType: 'user',
    lastLogin: new Date(),
    acctCreationDate: new Date()
  }),
  // ... Add more users as needed...
];

const departments = [
  new Department({
    departmentName: 'Human Resources'
  }),
  new Department({
    departmentName: 'Operations'
  }),
  // ... Add more departments as needed...
];

const locations = [
  new Location({
    locationName: 'Headquarters',
    locationDetails: '123 Main St, City, Country'
  }),
  new Location({
    locationName: 'Branch Office',
    locationDetails: '456 Side St, City, Country'
  }),
  // ... Add more locations as needed...
];

const staffs = [
  new Staff({
    department: departments[0]._id,
    location: locations[0]._id,
    user: users[1]._id,
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNo: '987-654-3210',
    isAdmin: false
  }),
  // ... Add more staff as needed...
];

const categories = [
  new Category({
    categoryName: 'Medical'
  }),
  new Category({
    categoryName: 'Teaching'
  }),
  // ... Add more categories as needed...
];

const services = [
  new Service({
    catID: categories[0]._id,
    serviceName: 'First Aid',
    inDisplay: true,
    description: 'First aid services for events.'
  }),
  new Service({
    catID: categories[1]._id,
    serviceName: 'Math Tutoring',
    inDisplay: true,
    description: 'Tutoring services for high school students.'
  }),
  // ... Add more services as needed...
];

const volunteers = [
  new Volunteer({
    user: users[0]._id,
    firstName: 'John',
    lastName: 'Doe',
    phoneNo: '123-456-7890',
    isSMSOn: true,
    isEmailOn: true
  }),
  // ... Add more volunteers as needed...
];

const notifications = [
  new Notification({
    volunteer: volunteers[0]._id,
    staff: staffs[0]._id,
    subject: 'Welcome to our platform',
    message: 'Thank you for joining us!',
    dateSent: new Date(),
    channelType: 'Email'
  }),
  // ... Add more notifications as needed...
];

async function seedDB() {
  try {
    await User.insertMany(users);
    await Department.insertMany(departments);
    await Location.insertMany(locations);
    await Staff.insertMany(staffs);
    await Category.insertMany(categories);
    await Service.insertMany(services);
    await Volunteer.insertMany(volunteers);
    await Notification.insertMany(notifications);
    
    console.log('Sample data seeded!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding data:', err);
    mongoose.connection.close();
  }
}

seedDB();
