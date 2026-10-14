import { db } from "./index";
import { users, applications, documents, jobs, notifications, chatMessages } from "./schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if user already exists
    const existingUsers = await db.select().from(users).limit(1);
    let defaultUserId = 1;

    if (existingUsers.length === 0) {
      const [insertedUser] = await db.insert(users).values({
        fullName: "Tanvir Hasan",
        email: "tanvir.hasan@worldvision.com",
        phone: "+880 1712 345678",
        country: "Bangladesh",
        avatarUrl: "https://images.pexels.com/photos/6285147/pexels-photo-6285147.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
        isVerified: true,
        biometricEnabled: true,
        role: "applicant",
      }).returning();
      defaultUserId = insertedUser.id;
    } else {
      defaultUserId = existingUsers[0].id;
    }

    // Check applications
    const existingApps = await db.select().from(applications).limit(1);
    let app1Id: number | undefined;
    let app2Id: number | undefined;

    if (existingApps.length === 0) {
      const insertedApps = await db.insert(applications).values([
        {
          applicationNumber: "WV-AU-2025-8842",
          userId: defaultUserId,
          country: "Australia",
          visaType: "Work Visa",
          status: "under_review",
          progressPct: 45,
          feeAmount: 1850,
          paymentStatus: "paid",
          currentStep: 6,
          details: {
            personal: { fullName: "Tanvir Hasan", nationality: "Bangladeshi", dob: "1994-05-12" },
            passport: { passportNumber: "EA0894215", expiryDate: "2031-10-18" },
            employment: { occupation: "Civil Project Engineer", experienceYears: "6" },
          },
          nextAction: "Skills assessment under review with Australian Engineers Board",
        },
        {
          applicationNumber: "WV-SG-2025-3129",
          userId: defaultUserId,
          country: "Singapore",
          visaType: "Business Visa",
          status: "documents_verified",
          progressPct: 70,
          feeAmount: 950,
          paymentStatus: "paid",
          currentStep: 8,
          details: {
            personal: { fullName: "Tanvir Hasan", nationality: "Bangladeshi" },
            passport: { passportNumber: "EA0894215" },
          },
          nextAction: "MOM Singapore reviewing sponsorship documentation",
        },
        {
          applicationNumber: "WV-RS-2025-1087",
          userId: defaultUserId,
          country: "Serbia",
          visaType: "Work Visa",
          status: "processing",
          progressPct: 60,
          feeAmount: 1200,
          paymentStatus: "paid",
          currentStep: 7,
          details: {
            personal: { fullName: "Tanvir Hasan" },
          },
          nextAction: "Labor market opinion cleared by Serbian Ministry of Labor",
        }
      ]).returning();

      app1Id = insertedApps[0]?.id;
      app2Id = insertedApps[1]?.id;
    } else {
      app1Id = existingApps[0].id;
    }

    // Documents
    const existingDocs = await db.select().from(documents).limit(1);
    // Demo documents are no longer seeded: documents must be real uploaded files.
    if (false && existingDocs.length === 0) {
      await db.insert(documents).values([
        {
          userId: defaultUserId,
          applicationId: app1Id,
          docType: "passport",
          title: "International Passport Copy",
          fileName: "Tanvir_Passport_BioPage.pdf",
          fileSize: "2.4 MB",
          fileUrl: "/sample-doc.pdf",
          status: "verified",
        },
        {
          userId: defaultUserId,
          applicationId: app1Id,
          docType: "photo",
          title: "Passport Size Photograph (35x45mm)",
          fileName: "Tanvir_Studio_Photo.jpg",
          fileSize: "840 KB",
          fileUrl: "/sample-photo.jpg",
          status: "verified",
        },
        {
          userId: defaultUserId,
          applicationId: app1Id,
          docType: "education",
          title: "B.Sc. in Civil Engineering Degree & Transcripts",
          fileName: "BUET_CivilEng_Degree.pdf",
          fileSize: "4.1 MB",
          fileUrl: "/sample-degree.pdf",
          status: "verified",
        },
        {
          userId: defaultUserId,
          applicationId: app1Id,
          docType: "experience",
          title: "Employment Experience Letter (6 Years)",
          fileName: "Work_Experience_Certificates.pdf",
          fileSize: "3.2 MB",
          fileUrl: "/sample-exp.pdf",
          status: "under_review",
        },
        {
          userId: defaultUserId,
          applicationId: app1Id,
          docType: "bank_statement",
          title: "Bank Statement (Last 6 Months Solvency)",
          fileName: "Standard_Chartered_Solvency.pdf",
          fileSize: "1.9 MB",
          fileUrl: "/sample-bank.pdf",
          status: "verified",
        },
        {
          userId: defaultUserId,
          applicationId: app1Id,
          docType: "police_clearance",
          title: "Police Clearance Certificate",
          fileName: "Police_Clearance_DMP.pdf",
          fileSize: "1.1 MB",
          fileUrl: "/sample-pcc.pdf",
          status: "under_review",
        },
        {
          userId: defaultUserId,
          applicationId: app1Id,
          docType: "medical",
          title: "Medical Fitness Certificate",
          fileName: "Panel_Clinic_Medical_Check.pdf",
          fileSize: "2.8 MB",
          fileUrl: "/sample-med.pdf",
          status: "uploaded",
        },
      ]);
    }

    // Jobs strictly for the 6 primary countries:
    // Australia, Singapore, Serbia, Turkey, Malaysia, Russia
    const existingJobs = await db.select().from(jobs).limit(1);
    if (existingJobs.length === 0) {
      await db.insert(jobs).values([
        {
          title: "Senior Civil Infrastructure Engineer",
          company: "Multiplex Australia Ltd",
          country: "Australia",
          flag: "🇦🇺",
          location: "Sydney & Melbourne, Australia",
          salary: "$115,000 - $140,000 AUD / Year",
          experience: "4-7 Years",
          jobType: "Full-time / PR Pathway",
          category: "Engineering",
          vacancies: 8,
          description: "Leading Australian tier-1 builder seeking skilled Civil Infrastructure and Structural Engineers for major urban transit and stadium projects.",
          requirements: ["Degree in Civil/Structural Engineering", "IELTS 6.5+ or PTE 65+", "Experience in AutoCAD/Revit", "Eligible for TSS 482 / 186 PR sponsorship"],
          benefits: ["Relocation assistance $8,000 AUD", "Health insurance covered", "Employer Superannuation 11.5%", "Fast-track permanent residency pathway"],
          isFeatured: true,
          imageUrl: "https://images.pexels.com/photos/6285137/pexels-photo-6285137.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          deadline: "30 Apr 2026",
        },
        {
          title: "Full Stack Cloud Solutions Architect",
          company: "Apex Global Technologies",
          country: "Singapore",
          flag: "🇸🇬",
          location: "Raffles Place, Singapore",
          salary: "$8,500 - $12,000 SGD / Month",
          experience: "3-6 Years",
          jobType: "Full-time Employment Pass",
          category: "IT",
          vacancies: 6,
          description: "Vibrant fintech institution in central Singapore hiring enterprise software engineers and cloud architects to build high-concurrency payment gateways.",
          requirements: ["Node.js, React, PostgreSQL or Go", "AWS/GCP Certified", "Bachelor degree in CS or related field", "English fluency"],
          benefits: ["Employment Pass (EP) guaranteed sponsorship", "Annual performance bonus", "Comprehensive regional medical insurance", "Hybrid work flexibility"],
          isFeatured: true,
          imageUrl: "https://images.pexels.com/photos/15480459/pexels-photo-15480459.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          deadline: "15 May 2026",
        },
        {
          title: "Industrial Manufacturing & CNC Specialist",
          company: "Belgrade Heavy Industries",
          country: "Serbia",
          flag: "🇷🇸",
          location: "Belgrade & Novi Sad, Serbia",
          salary: "€2,200 - €2,900 EUR / Month",
          experience: "2-5 Years",
          jobType: "Contract (3 Years Renewable)",
          category: "Manufacturing",
          vacancies: 15,
          description: "European automotive components plant in Serbia hiring skilled CNC machinists, industrial electricians, and assembly supervisors with visa and housing provided.",
          requirements: ["Vocational Diploma or Technical Degree", "CNC programming or industrial maintenance", "Physical stamina and teamwork", "Valid passport"],
          benefits: ["Free employer-provided furnished apartment", "Daily meal allowance", "Serbian Work & Residence Permit sponsored", "Annual return flight ticket"],
          isFeatured: true,
          imageUrl: "https://images.pexels.com/photos/17853059/pexels-photo-17853059.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          deadline: "20 May 2026",
        },
        {
          title: "International Supply Chain & Logistics Officer",
          company: "Bosphorus Global Freight",
          country: "Turkey",
          flag: "🇹🇷",
          location: "Istanbul & Izmir, Turkey",
          salary: "$2,200 - $3,200 USD / Month",
          experience: "3+ Years",
          jobType: "Full-time Work Permit",
          category: "Logistics",
          vacancies: 10,
          description: "Maritime shipping and air freight logistics hub connecting Europe and Asia seeking supply chain coordinators, freight customs handlers, and operations leads.",
          requirements: ["Degree in Supply Chain, Business or Logistics", "Working English proficiency", "Experience with ERP / SAP software", "Clean background verification"],
          benefits: ["Turkish Work Visa & Ikamet residence permit", "Private health insurance", "Transportation subsidy", "Performance commissions"],
          isFeatured: false,
          imageUrl: "https://images.pexels.com/photos/28142008/pexels-photo-28142008.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          deadline: "10 Jun 2026",
        },
        {
          title: "Digital Systems Engineer & Cyber Analyst",
          company: "Petronas Digital Partner Hub",
          country: "Malaysia",
          flag: "🇲🇾",
          location: "Cyberjaya / Kuala Lumpur, Malaysia",
          salary: "RM 9,500 - RM 14,000 MYR / Month",
          experience: "3-5 Years",
          jobType: "Full-time (Employment Pass Cat I/II)",
          category: "IT",
          vacancies: 12,
          description: "Malaysia Digital Economy Corporation (MDEC) tech hub recruiting IT systems analysts, database administrators, and network security specialists.",
          requirements: ["Degree in Computer Science or IT", "Knowledge of Linux, Cisco, or Cloud DevOps", "Strong problem-solving capability", "Good communication skills"],
          benefits: ["Malaysia Tech Employment Pass sponsor", "Flight ticket and relocation allowance", "Family visa dependent pass support", "Medical coverage"],
          isFeatured: true,
          imageUrl: "https://images.pexels.com/photos/11719269/pexels-photo-11719269.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          deadline: "28 May 2026",
        },
        {
          title: "Petroleum Extraction & Heavy Equipment Operator",
          company: "Nordic-Eurasia Energy Corp",
          country: "Russia",
          flag: "🇷🇺",
          location: "Tyumen & Moscow, Russia",
          salary: "200,000 - 280,000 RUB / Month",
          experience: "3+ Years",
          jobType: "Rotation Contract (60/30)",
          category: "Energy",
          vacancies: 20,
          description: "Energy consortium recruiting qualified heavy equipment operators, high-pressure pipeline welders, and petroleum plant maintenance technicians.",
          requirements: ["Certified Technical Trade qualification", "Experience in oil & gas or mining installations", "Medical fitness clearance", "Passport valid 2+ years"],
          benefits: ["Employer-sponsored Russian Work Visa (HQS/Standard)", "Full room & board on rotation", "Winter gear & safety kits supplied", "Emergency medical & life insurance"],
          isFeatured: false,
          imageUrl: "https://images.pexels.com/photos/6214466/pexels-photo-6214466.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          deadline: "15 Jun 2026",
        },
        {
          title: "Registered Clinical Nurse / Healthcare Specialist",
          company: "St. Vincent Health Network",
          country: "Australia",
          flag: "🇦🇺",
          location: "Brisbane & Gold Coast, Australia",
          salary: "$88,000 - $105,000 AUD / Year",
          experience: "2+ Years",
          jobType: "Full-time Permanent",
          category: "Healthcare",
          vacancies: 14,
          description: "Queensland hospital network seeking registered nurses across emergency, intensive care, and aged-care services with Australian visa sponsorship.",
          requirements: ["B.Sc. in Nursing", "OET Grade B or IELTS 7.0+", "AHPRA registration assistance provided", "Minimum 2 years hospital experience"],
          benefits: ["Subclass 186/482 Employer Sponsorship", "$10,000 AUD relocation grant", "Flexible shift penalties", "Superannuation + medical perks"],
          isFeatured: true,
          imageUrl: "https://images.pexels.com/photos/8470777/pexels-photo-8470777.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          deadline: "30 May 2026",
        },
        {
          title: "Hospitality Operations Manager",
          company: "Marina Bay Luxury Resorts",
          country: "Singapore",
          flag: "🇸🇬",
          location: "Sentosa / Marina Bay, Singapore",
          salary: "$6,800 - $9,200 SGD / Month",
          experience: "4+ Years",
          jobType: "Full-time S-Pass / EP",
          category: "Hospitality",
          vacancies: 5,
          description: "World-renowned luxury resort in Singapore hiring food & beverage managers, guest relations leads, and banquet directors.",
          requirements: ["Hospitality Management Degree", "Proven luxury 5-star hotel experience", "Fluency in English", "Customer excellence mindset"],
          benefits: ["S-Pass / Employment Pass Visa", "Duty meals and uniforms provided", "Performance incentives", "Career acceleration program"],
          isFeatured: false,
          imageUrl: "https://images.pexels.com/photos/18662417/pexels-photo-18662417.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          deadline: "05 Jun 2026",
        }
      ]);
    }

    // Notifications
    const existingNotifs = await db.select().from(notifications).limit(1);
    if (existingNotifs.length === 0) {
      await db.insert(notifications).values([
        {
          userId: defaultUserId,
          title: "Application Status Updated",
          message: "Your Australia Work Visa (WV-AU-2025-8842) has advanced to Document Review by the Australian Immigration Assessment Board.",
          type: "application",
          isRead: false,
        },
        {
          userId: defaultUserId,
          title: "Document Verified Successfully",
          message: "Your International Passport Bio-page has been verified and cleared for Singapore Employment Pass processing.",
          type: "document",
          isRead: false,
        },
        {
          userId: defaultUserId,
          title: "New High-Demand Job in Serbia",
          message: "Belgrade Heavy Industries posted 15 new Industrial CNC and Electrician positions with full work permit sponsorship.",
          type: "job",
          isRead: true,
        },
        {
          userId: defaultUserId,
          title: "Consultation Reminder",
          message: "Your 1-on-1 Visa Consultation with Senior Officer Mr. Christopher is scheduled for tomorrow at 3:00 PM.",
          type: "consultation",
          isRead: false,
        },
        {
          userId: defaultUserId,
          title: "Payment Receipt Issued",
          message: "Payment receipt for Application WV-SG-2025-3129 ($950 SGD) has been archived in your profile.",
          type: "payment",
          isRead: true,
        }
      ]);
    }

    // Chat messages
    const existingChat = await db.select().from(chatMessages).limit(1);
    if (existingChat.length === 0) {
      await db.insert(chatMessages).values([
        {
          userId: defaultUserId,
          sender: "ai",
          senderName: "World Vision AI",
          message: "Hello Tanvir! Welcome to World Vision Consultancy. I am your global migration and recruitment advisor. How may I assist your international journey today?",
        },
        {
          userId: defaultUserId,
          sender: "user",
          senderName: "Tanvir Hasan",
          message: "Hi! I am interested in applying for skilled engineering jobs in Australia and Serbia. What are the key requirements?",
        },
        {
          userId: defaultUserId,
          sender: "ai",
          senderName: "World Vision AI",
          message: "For Australia, you will need a verified Engineering degree, minimum 3 years of work experience, and an English score (IELTS 6.0+). For Serbia, employers provide work permits and accommodation directly with technical vocational certificates. Would you like me to start your assessment or connect you with our Australia senior counselor?",
        }
      ]);
    }

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Seeding error:", error);
  }
}
