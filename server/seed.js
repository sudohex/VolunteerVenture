require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const {User, Volunteer, Department, Location, Category, Service} = require('./src/models/models');


mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas!');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

const saltRounds = 10;

//ChatGPT: Write complete data here
const users = [
  new User({
    email: 'staff@cqu.com',
    password: bcrypt.hashSync('staffstaff', saltRounds),
    acctType: 'staff',
  }),
];
const departments = [
  new Department({ departmentName: 'Hair & Beauty' }),
  new Department({ departmentName: 'Hospitality' }),
  new Department({ departmentName: 'Health Care' }),
];

const locations = [
  new Location({ locationName: 'Gladstone', abbreviation: 'GTN' }),
  new Location({ locationName: 'Mackay', abbreviation: 'MKY' }),
  new Location({ locationName: 'Rockhampton', abbreviation: 'RKH' }),
  new Location({ locationName: 'Brisbane', abbreviation: 'BNE' }),
];

const categories = [
  new Category({ categoryName: 'Hairdressing' }),
  new Category({ categoryName: 'Beauty' }),
  new Category({ categoryName: 'Catering' }),
  new Category({ categoryName: 'Restaurant' }),
  new Category({ categoryName: 'Chiropractic' }),
  new Category({ categoryName: 'Physiotherapy' }),
  new Category({ categoryName: 'Oral Health' }),
  new Category({ categoryName: 'Occupational Therapy' }),
  new Category({ categoryName: 'Speech Pathology' }),
  new Category({ categoryName: 'Podiatry' }),
];

const services = [
  // Hair & Beauty - Gladstone
  new Service({ serviceName: 'Colour', category: categories[0]._id, location: locations[0]._id }),
  new Service({ serviceName: 'Cut', category: categories[0]._id, location: locations[0]._id }),
  new Service({ serviceName: 'Permanant Wave', category: categories[0]._id, location: locations[0]._id }),
  new Service({ serviceName: 'Straightening', category: categories[0]._id, location: locations[0]._id }),

  // Hair & Beauty - Mackay
  new Service({ serviceName: 'Waxing', category: categories[1]._id, location: locations[1]._id }),
  new Service({ serviceName: 'Tinting', category: categories[1]._id, location: locations[1]._id }),
  new Service({ serviceName: 'Nail Treatments', category: categories[1]._id, location: locations[1]._id }),
  new Service({ serviceName: 'Facials', category: categories[1]._id, location: locations[1]._id }),
  new Service({ serviceName: 'Massage', category: categories[1]._id, location: locations[1]._id }),
  new Service({ serviceName: 'Tanning', category: categories[1]._id, location: locations[1]._id }),

  // Hospitality - Mackay
  new Service({ serviceName: 'Event Management', category: categories[2]._id, location: locations[1]._id }),

  // Hospitality - Rockhampton
  new Service({ serviceName: 'Dine-in Reservation', category: categories[3]._id, location: locations[2]._id }),

  // Health Care - Mackay
  new Service({ serviceName: 'Initial Diagnosis Session', category: categories[4]._id, location: locations[1]._id }),
  new Service({ serviceName: 'Treatment Session', category: categories[4]._id, location: locations[1]._id }),

  // Health Care - Rockhampton
  new Service({ serviceName: 'Taping', category: categories[5]._id, location: locations[2]._id }),
  new Service({ serviceName: 'Sports injuries', category: categories[5]._id, location: locations[2]._id }),
  new Service({ serviceName: 'Headahes', category: categories[5]._id, location: locations[2]._id }),
  new Service({ serviceName: 'Exercise classes', category: categories[5]._id, location: locations[2]._id }),
  new Service({ serviceName: 'Strength Programs', category: categories[5]._id, location: locations[2]._id }),
  new Service({ serviceName: 'Gait assessments', category: categories[5]._id, location: locations[2]._id }),

  // Health Care - Brisbane
  new Service({ serviceName: 'Hygiene Advice', category: categories[6]._id, location: locations[3]._id }),
  new Service({ serviceName: 'Examination', category: categories[6]._id, location: locations[3]._id }),
  new Service({ serviceName: 'Flouride Treatment', category: categories[6]._id, location: locations[3]._id }),
  new Service({ serviceName: 'Scaling and Clen', category: categories[6]._id, location: locations[3]._id }),
  new Service({ serviceName: 'Mouthgaurds', category: categories[6]._id, location: locations[3]._id }),
  new Service({ serviceName: 'Fillings', category: categories[6]._id, location: locations[3]._id }),

  // Health Care - General (not location specific)
  new Service({ serviceName: 'Paediatric Services', category: categories[7]._id }),
  new Service({ serviceName: 'Adult Support', category: categories[7]._id }),
  new Service({ serviceName: 'Individual Session', category: categories[8]._id }),
  new Service({ serviceName: 'Group Sessions', category: categories[8]._id }),
  new Service({ serviceName: 'Outreach visits', category: categories[8]._id }),
  new Service({ serviceName: 'Orthotic therapy', category: categories[9]._id }),
  new Service({ serviceName: 'Nail Surgey', category: categories[9]._id }),
  new Service({ serviceName: 'Biomechanical assessment', category: categories[9]._id }),
];




async function cleanDB() {
  try {
    await User.deleteMany({});
    await Department.deleteMany({});
    await Location.deleteMany({});
    await Category.deleteMany({});
    await Service.deleteMany({});
    await Volunteer.deleteMany({});
    
    console.log('Database cleaned!');
  } catch (err) {
    console.error('Error cleaning database:', err);
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
    
    console.log('Sample data seeded!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding data:', err);
    mongoose.connection.close();
  }
}

seedDB();
