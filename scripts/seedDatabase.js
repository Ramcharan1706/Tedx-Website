const mongoose = require('mongoose');
const Speaker = require('../models/Speaker');
const Ticket = require('../models/Ticket');
const Contact = require('../models/Contact');
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tedxkprit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    await Speaker.deleteMany({});
    await Ticket.deleteMany({});
    await Contact.deleteMany({});

    // Seed speakers
    const speakers = [
      {
        name: "Dr. Sarah Chen",
        title: "AI Researcher",
        bio: "Leading researcher in artificial intelligence and machine learning, focusing on ethical AI development.",
        topic: "The empathy of machines",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=480&fit=crop",
        socialMedia: {
          twitter: "@sarahchen_ai",
          linkedin: "linkedin.com/in/sarahchen"
        },
        order: 1
      },
      {
        name: "Maria Rodriguez",
        title: "Social Innovation Expert",
        bio: "Award-winning social entrepreneur working on sustainable solutions for underserved communities.",
        topic: "Designing dignity",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=480&fit=crop",
        socialMedia: {
          twitter: "@mariarod",
          website: "mariarodriguez.org"
        },
        order: 2
      },
      {
        name: "James Liu",
        title: "Classical Musician",
        bio: "Renowned violinist exploring the intersection of music, memory, and human emotion.",
        topic: "Sound as memory",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=480&fit=crop",
        socialMedia: {
          instagram: "@jamesliu_violin"
        },
        order: 3
      },
      {
        name: "Priya Patel",
        title: "Sustainability Entrepreneur",
        bio: "Founder of multiple green tech startups, pioneering circular economy solutions.",
        topic: "Circular cities",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=480&fit=crop",
        socialMedia: {
          linkedin: "linkedin.com/in/priyapatel"
        },
        order: 4
      },
      {
        name: "David Kim",
        title: "Startup Founder",
        bio: "Serial entrepreneur building technology solutions for emerging markets.",
        topic: "Building for Bharat",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=480&fit=crop",
        socialMedia: {
          twitter: "@davidkim",
          website: "davidkim.io"
        },
        order: 5
      },
      {
        name: "Dr. Emily Watson",
        title: "Neuroscientist",
        bio: "Researching the neuroscience of habits and identity formation.",
        topic: "Habits and identity",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=480&fit=crop",
        socialMedia: {
          linkedin: "linkedin.com/in/emilywatson"
        },
        order: 6
      }
    ];

    await Speaker.insertMany(speakers);
    console.log('✅ Speakers seeded successfully');

    // Seed sample tickets
    const tickets = [
      {
        ticketType: 'general',
        price: 699,
        buyerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          college: 'KPRIT'
        },
        paymentStatus: 'completed',
        ticketId: 'TEDX2024001'
      },
      {
        ticketType: 'student',
        price: 499,
        buyerInfo: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '9123456789',
          college: 'KPRIT',
          studentId: 'KPRIT2021001'
        },
        paymentStatus: 'completed',
        ticketId: 'TEDX2024002'
      }
    ];

    await Ticket.insertMany(tickets);
    console.log('✅ Sample tickets seeded successfully');

    // Seed sample contact messages
    const contacts = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        subject: 'Partnership Inquiry',
        message: 'We would like to explore partnership opportunities for our organization.',
        category: 'partnership'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        subject: 'Volunteer Application',
        message: 'I am interested in volunteering for the TEDx event. How can I get involved?',
        category: 'volunteer'
      }
    ];

    await Contact.insertMany(contacts);
    console.log('✅ Sample contact messages seeded successfully');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
