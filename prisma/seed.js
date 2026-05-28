const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clean the database
  await prisma.review.deleteMany();
  await prisma.savedCollege.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.course.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleaned.");

  // Create Users
  const hashedPassword1 = await bcrypt.hash("password123", 10);
  const hashedPassword2 = await bcrypt.hash("student2026", 10);

  const user1 = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex@example.com",
      password: hashedPassword1,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@example.com",
      password: hashedPassword2,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&fit=crop",
    },
  });

  console.log("Users created.");

  // 1. IIT Bombay
  const iitbombay = await prisma.college.create({
    data: {
      name: "Indian Institute of Technology Bombay",
      description: "Established in 1958, IIT Bombay is a premier public engineering and research institution located in Powai, Mumbai. Renowned for its cutting-edge tech research, globally acclaimed alumni base, and exceptional campus placements.",
      location: "Mumbai",
      state: "Maharashtra",
      rating: 4.8,
      averageFees: 220000,
      type: "Public",
      established: 1958,
      logoUrl: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=120&fit=crop", // standard college building photo placeholder
      imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&fit=crop",
      facilities: ["High-speed Wifi", "Central Library", "Hostel", "Sports Complex", "Olympic Swimming Pool", "Advanced Labs", "Gymnasium"],
      courses: {
        create: [
          { name: "B.Tech Computer Science & Engineering", duration: 4, fees: 220000, stream: "Engineering", description: "Flagship program focused on algorithms, systems, AI, and computer engineering." },
          { name: "B.Tech Electrical Engineering", duration: 4, fees: 220000, stream: "Engineering", description: "Covers power systems, microelectronics, signals, and control engineering." },
          { name: "M.Tech Microelectronics & VLSI", duration: 2, fees: 150000, stream: "Engineering", description: "Specialized postgraduate program in semiconductor physics and hardware designs." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 120.0, averagePackage: 23.5, placementRate: 98.2, topRecruiters: ["Google", "Microsoft", "Apple", "Rubrik", "Qualcomm", "Goldman Sachs"] },
          { year: 2024, highestPackage: 150.0, averagePackage: 21.8, placementRate: 97.5, topRecruiters: ["Google", "Microsoft", "Uber", "Sony", "Morgan Stanley"] }
        ]
      },
      reviews: {
        create: [
          { userId: user1.id, rating: 5, comment: "Exceptional peer group. The coding culture is outstanding and placements are world-class." },
          { userId: user2.id, rating: 4.6, comment: "Superb campus life right next to Powai lake. Academic pressure can be high but worth the effort." }
        ]
      }
    }
  });

  // 2. Stanford University
  const stanford = await prisma.college.create({
    data: {
      name: "Stanford University",
      description: "Located in the heart of Silicon Valley, Stanford is one of the world's leading research and teaching institutions. It is renowned for its entrepreneurial spirit, academic excellence, and close ties to the technology sector.",
      location: "Stanford",
      state: "California",
      rating: 4.9,
      averageFees: 4800000,
      type: "Private",
      established: 1891,
      logoUrl: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=120&fit=crop",
      imageUrl: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=1200&fit=crop",
      facilities: ["State-of-the-art Research Labs", "Multiple Dining Halls", "Vast Campus Shuttles", "Golf Course", "Stanford Hospital", "Innovations Hub"],
      courses: {
        create: [
          { name: "B.S. Computer Science", duration: 4, fees: 4800000, stream: "Engineering", description: "World-famous undergraduate program bridging theoretical foundations and startup application." },
          { name: "MBA (Master of Business Administration)", duration: 2, fees: 6200000, stream: "Management", description: "Premier business degree focused on entrepreneurial leadership, change-making, and venture capital." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 350.0, averagePackage: 145.0, placementRate: 99.1, topRecruiters: ["OpenAI", "Stripe", "Google", "Meta", "Sequoia Capital", "NVIDIA"] }
        ]
      },
      reviews: {
        create: [
          { userId: user1.id, rating: 5.0, comment: "An absolute dream. If you want to start a technology company, there is no place on Earth that compares to Stanford." }
        ]
      }
    }
  });

  // 3. IIM Ahmedabad
  const iimahmedabad = await prisma.college.create({
    data: {
      name: "Indian Institute of Management Ahmedabad",
      description: "Indian Institute of Management Ahmedabad is India's leading business school. Established in 1961, it has consistently been ranked as the top MBA college in the country, featuring the iconic Louis Kahn campus.",
      location: "Ahmedabad",
      state: "Gujarat",
      rating: 4.8,
      averageFees: 1250000,
      type: "Public",
      established: 1961,
      logoUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=120&fit=crop",
      imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&fit=crop",
      facilities: ["Louis Kahn Plaza Library", "Case-study Lecture Halls", "Syndicate Rooms", "Student Hostels", "Modern Gym", "Sports Arena"],
      courses: {
        create: [
          { name: "PGP in Management (MBA Equivalent)", duration: 2, fees: 1250000, stream: "Management", description: "Consistently ranked #1 in India. Employs case-study based pedagogy for real-world analytical training." },
          { name: "PGPX (One Year Executive MBA)", duration: 1, fees: 1800000, stream: "Management", description: "Intensive MBA program designed specifically for experienced professionals." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 85.0, averagePackage: 34.2, placementRate: 100.0, topRecruiters: ["McKinsey & Co", "Boston Consulting Group", "Bain & Company", "Goldman Sachs", "HUL", "Tata Group"] }
        ]
      },
      reviews: {
        create: [
          { userId: user2.id, rating: 4.9, comment: "Extremely rigorous curriculum. The WAC (Written Analysis and Communication) courses are brutal but teach you corporate survival skills like nothing else." }
        ]
      }
    }
  });

  // 4. BITS Pilani
  const bitspilani = await prisma.college.create({
    data: {
      name: "Birla Institute of Technology and Science Pilani",
      description: "BITS Pilani is a distinguished private deemed university in India. Famous for its Zero Attendance policy, massive student-driven coding ecosystem, and a robust startup-supporting alumni network.",
      location: "Pilani",
      state: "Rajasthan",
      rating: 4.5,
      averageFees: 450000,
      type: "Private",
      established: 1964,
      logoUrl: "https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?q=80&w=120&fit=crop",
      imageUrl: "https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?q=80&w=1200&fit=crop",
      facilities: ["No Attendance Rule", "Student Activity Center", "Supercomputer Facility", "Hostels", "Cricket Ground", "Startup Incubator Hub"],
      courses: {
        create: [
          { name: "B.E. Computer Science", duration: 4, fees: 450000, stream: "Engineering", description: "Prestigious engineering stream with massive focus on systems, software development, and AI." },
          { name: "B.E. Electronics & Instrumentation", duration: 4, fees: 420000, stream: "Engineering", description: "Covers sensor technologies, microprocessors, signal systems, and embedded hardware." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 60.5, averagePackage: 18.2, placementRate: 96.8, topRecruiters: ["Microsoft", "Google", "Amazon", "JPMorgan Chase", "Cisco", "Nvidia"] }
        ]
      },
      reviews: {
        create: [
          { userId: user1.id, rating: 4.5, comment: "The freedom here is unmatched. The 'Zero-attendance' rule means you have complete flexibility to build side projects and work on startups." }
        ]
      }
    }
  });

  // 5. Delhi Technological University
  const dtu = await prisma.college.create({
    data: {
      name: "Delhi Technological University",
      description: "DTU (formerly Delhi College of Engineering - DCE) is one of India's oldest and most prestigious engineering colleges. Located in Rohini, Delhi, it has shaped pioneers in tech and research.",
      location: "Delhi",
      state: "Delhi",
      rating: 4.3,
      averageFees: 200000,
      type: "Public",
      established: 1941,
      logoUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=120&fit=crop",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&fit=crop",
      facilities: ["Sports Complex", "Auditorium", "Digital Library", "Labs", "Boys & Girls Hostels", "Canteen"],
      courses: {
        create: [
          { name: "B.Tech Software Engineering", duration: 4, fees: 200000, stream: "Engineering", description: "Core computing concepts along with software engineering methodologies." },
          { name: "B.Tech Information Technology", duration: 4, fees: 200000, stream: "Engineering", description: "Focuses on cloud systems, cybersecurity, network architecture, and databases." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 82.0, averagePackage: 15.6, placementRate: 94.0, topRecruiters: ["Adobe", "Salesforce", "Atlassian", "Microsoft", "Paytm", "Flipkart"] }
        ]
      },
      reviews: {
        create: [
          { userId: user2.id, rating: 4.2, comment: "Huge campus and great legacy. The tech clubs are highly active and placement packages are outstanding." }
        ]
      }
    }
  });

  // 6. NIT Trichy
  const nitt = await prisma.college.create({
    data: {
      name: "National Institute of Technology Tiruchirappalli",
      description: "NIT Trichy is ranked #1 among all NITs in India. It is a premier government-funded technology institution in Tamil Nadu, recognized for academic excellence, state-of-the-art infrastructure, and strong research output.",
      location: "Tiruchirappalli",
      state: "Tamil Nadu",
      rating: 4.4,
      averageFees: 150000,
      type: "Public",
      established: 1964,
      logoUrl: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=120&fit=crop",
      imageUrl: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&fit=crop",
      facilities: ["High-speed Wifi", "Central Library", "Sports Complex", "Research Laboratories", "Hostels", "Incubation Center"],
      courses: {
        create: [
          { name: "B.Tech Computer Science & Engineering", duration: 4, fees: 150000, stream: "Engineering", description: "Focused on computation, theory, networks, and advanced engineering modules." },
          { name: "B.Tech Mechanical Engineering", duration: 4, fees: 150000, stream: "Engineering", description: "Offers thermodynamics, fluid mechanics, design engineering, and robotics labs." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 52.8, averagePackage: 16.5, placementRate: 96.5, topRecruiters: ["Qualcomm", "Intel", "Texas Instruments", "Microsoft", "Goldman Sachs", "L&T"] }
        ]
      },
      reviews: {
        create: [
          { userId: user1.id, rating: 4.4, comment: "Ranked 1st among NITs for a reason. Great campus culture, active student festivals (Festember, Pragyan), and very reliable placements." }
        ]
      }
    }
  });

  // 7. Shailesh J. Mehta School of Management (SJSOM), IIT Bombay
  const sjsom = await prisma.college.create({
    data: {
      name: "Shailesh J. Mehta School of Management",
      description: "SJSOM is the business school of IIT Bombay, established in 1995. It offers management education designed to nurture technological leaders who can drive global businesses.",
      location: "Mumbai",
      state: "Maharashtra",
      rating: 4.5,
      averageFees: 600000,
      type: "Public",
      established: 1995,
      logoUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=120&fit=crop",
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&fit=crop",
      facilities: ["IIT Bombay Campus Access", "Exclusive Management Labs", "Seminar Hall", "Lakeside views", "Academic Library"],
      courses: {
        create: [
          { name: "Master of Business Administration (MBA)", duration: 2, fees: 600000, stream: "Management", description: "Bridges the gap between engineering analytical mindsets and strategic management capability." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 54.0, averagePackage: 28.0, placementRate: 100.0, topRecruiters: ["PwC", "Accenture Strategy", "ICICI Bank", "Amazon", "GEP", "Johnson & Johnson"] }
        ]
      },
      reviews: {
        create: [
          { userId: user2.id, rating: 4.5, comment: "High ROI because fees are comparatively low for a top-tier MBA, and you get all of IIT Bombay's amenities." }
        ]
      }
    }
  });

  // 8. Harvard University
  const harvard = await prisma.college.create({
    data: {
      name: "Harvard University",
      description: "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636, it is the oldest institution of higher learning in the United States and among the most prestigious in the world.",
      location: "Cambridge",
      state: "Massachusetts",
      rating: 4.9,
      averageFees: 5200000,
      type: "Private",
      established: 1636,
      logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=120&fit=crop",
      imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1200&fit=crop",
      facilities: ["Widener Library", "Harvard Yard", "Art Museums", "Athletic Fields", "Residential Houses", "Innovation Labs"],
      courses: {
        create: [
          { name: "A.B. in Computer Science", duration: 4, fees: 5200000, stream: "Engineering", description: "Rigorous computing fundamentals with broad liberal arts integration." },
          { name: "MBA (Harvard Business School)", duration: 2, fees: 6800000, stream: "Management", description: "The definitive business degree. Employs the case-study methodology to groom global executives." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 420.0, averagePackage: 155.0, placementRate: 98.8, topRecruiters: ["Goldman Sachs", "McKinsey", "Blackstone", "Google", "Meta", "Bridgewater"] }
        ]
      },
      reviews: {
        create: [
          { userId: user1.id, rating: 4.9, comment: "The network you build here lasts a lifetime. The sheer caliber of speakers, professors, and peers is unmatched." }
        ]
      }
    }
  });

  // 9. Massachusetts Institute of Technology (MIT)
  const mit = await prisma.college.create({
    data: {
      name: "Massachusetts Institute of Technology",
      description: "MIT is a world-renowned private research university in Cambridge, Massachusetts. Dedicated to advancement in science, engineering, and technology since 1861, MIT is home to top researchers and entrepreneurs.",
      location: "Cambridge",
      state: "Massachusetts",
      rating: 4.95,
      averageFees: 5000000,
      type: "Private",
      established: 1861,
      logoUrl: "https://images.unsplash.com/photo-1564981797816-1043d01ad096?q=80&w=120&fit=crop",
      imageUrl: "https://images.unsplash.com/photo-1564981797816-1043d01ad096?q=80&w=1200&fit=crop",
      facilities: ["Infinite Corridor", "MIT Media Lab", "Nuclear Reactor Lab", "Supercomputing Clusters", "Student Center", "Athletic Facilities"],
      courses: {
        create: [
          { name: "B.S. in Electrical Engineering & Computer Science (EECS)", duration: 4, fees: 5000000, stream: "Engineering", description: "MIT's legendary EECS program covering theory, architectures, AI, and systems engineering." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 380.0, averagePackage: 160.0, placementRate: 99.5, topRecruiters: ["NVIDIA", "DeepMind", "SpaceX", "Jane Street", "Apple", "OpenAI"] }
        ]
      },
      reviews: {
        create: [
          { userId: user2.id, rating: 5.0, comment: "Mind-bending intellects all around you. The hack culture, research output, and industrial recognition are absolute peak." }
        ]
      }
    }
  });

  // 10. AIIMS Delhi
  const aiims = await prisma.college.create({
    data: {
      name: "All India Institute of Medical Sciences Delhi",
      description: "AIIMS Delhi is the pinnacle of medical education, research, and patient care in India. Established in 1956, it is consistently ranked #1 in the National Institutional Ranking Framework (NIRF) for medical schools.",
      location: "Delhi",
      state: "Delhi",
      rating: 4.9,
      averageFees: 1500, // AIIMS is notoriously low cost!
      type: "Public",
      established: 1956,
      logoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=120&fit=crop",
      imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&fit=crop",
      facilities: ["AIIMS Hospital Access", "Advanced Medical Labs", "Resident Doctor Hostels", "Medical Library", "Anatomy Museums"],
      courses: {
        create: [
          { name: "MBBS (Bachelor of Medicine & Bachelor of Surgery)", duration: 5.5, fees: 1628, stream: "Medical", description: "Ranked #1 medical course in India, featuring clinical exposure inside India's busiest research hospitals." }
        ]
      },
      placements: {
        create: [
          { year: 2025, highestPackage: 35.0, averagePackage: 18.0, placementRate: 100.0, topRecruiters: ["Apollo Hospitals", "Max Healthcare", "Fortis Healthcare", "AIIMS Residency", "Global Med-Centers"] }
        ]
      },
      reviews: {
        create: [
          { userId: user1.id, rating: 4.9, comment: "The best clinical exposure you can get in India. The sheer volume of cases is massive. Super low fees and highly prestigious." }
        ]
      }
    }
  });

  console.log("Colleges seeded successfully.");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
