import { PrismaClient, UserRole, ContentStatus, MembershipStatus, MembershipType, BaptismStatus, ServiceAttendanceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, set, subDays } from "date-fns";

const prisma = new PrismaClient();

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const users = await Promise.all(
    [
      { name: "Admin User", email: "admin@graceharbor.org", role: UserRole.ADMIN },
      { name: "Editor User", email: "editor@graceharbor.org", role: UserRole.EDITOR },
      { name: "Staff User", email: "staff@graceharbor.org", role: UserRole.STAFF },
      { name: "Viewer User", email: "viewer@graceharbor.org", role: UserRole.VIEWER },
    ].map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { ...user, passwordHash },
        create: { ...user, passwordHash },
      }),
    ),
  );

  const today = new Date();
  const birthday = set(today, { year: 1991, month: today.getMonth(), date: today.getDate() });
  const wedding = set(today, { year: 2012, month: today.getMonth(), date: today.getDate() });
  const memorial = set(today, { year: 2015, month: today.getMonth(), date: today.getDate() });

  const members = [
    {
      memberId: "M-0001",
      firstName: "Elijah",
      lastName: "Cruz",
      gender: "MALE" as const,
      birthDate: birthday,
      civilStatus: "MARRIED" as const,
      nationality: "Filipino",
      contactNumber: "+63 900 111 2222",
      email: "elijah.cruz@example.com",
      address: "14 Harbor Street, Manila",
      spouseName: "Mara Cruz",
      weddingDate: wedding,
      childCount: 2,
      childrenNames: "Abigail Cruz, Nathan Cruz",
      parentsName: "Samuel and Lydia Cruz",
      dependents: 2,
      highestEducation: "College",
      schoolAttended: "University of Santo Tomas",
      courseOrDegree: "BS Theology",
      occupation: "Teacher",
      companyName: "Grace Harbor Academy",
      employmentStatus: "Full-time",
      workAddress: "Pasig City",
      dateJoinedChurch: subDays(today, 1600),
      membershipStatus: MembershipStatus.ACTIVE,
      membershipType: MembershipType.MEMBER,
      baptismStatus: BaptismStatus.WATER_BAPTIZED,
      baptizedDate: subDays(today, 1500),
      firstVisitDate: subDays(today, 1800),
      assignedSmallGroup: "Young Families",
      serviceAttendanceStatus: ServiceAttendanceStatus.REGULAR,
      ministriesJoined: "Worship, Ushering",
      ministryRole: "Volunteer Guitarist",
      volunteerStatus: "Active",
      leaderName: "Pastor Naomi Reyes",
      trainingCompleted: "New Members Class, Volunteer Orientation",
      notes: "Coordinates the youth worship rotation.",
      remarks: "Birthday and wedding anniversary today.",
    },
    {
      memberId: "M-0002",
      firstName: "Maria",
      lastName: "Santos",
      gender: "FEMALE" as const,
      birthDate: set(today, { year: 1984, month: 7, date: 12 }),
      civilStatus: "WIDOWED" as const,
      nationality: "Filipino",
      contactNumber: "+63 900 333 4444",
      email: "maria.santos@example.com",
      address: "88 Palm Avenue, Quezon City",
      deceasedDate: memorial,
      highestEducation: "Graduate School",
      occupation: "Counselor",
      companyName: "Hope Center",
      employmentStatus: "Part-time",
      workAddress: "Quezon City",
      dateJoinedChurch: subDays(today, 2600),
      membershipStatus: MembershipStatus.ACTIVE,
      membershipType: MembershipType.SENIOR,
      baptismStatus: BaptismStatus.BOTH,
      baptizedDate: subDays(today, 2400),
      firstVisitDate: subDays(today, 2800),
      assignedSmallGroup: "Prayer Circle",
      serviceAttendanceStatus: ServiceAttendanceStatus.REGULAR,
      ministriesJoined: "Prayer, Counseling",
      ministryRole: "Prayer Leader",
      volunteerStatus: "Active",
      leaderName: "Sis. Rowena Dela Cruz",
      trainingCompleted: "Counseling Workshop",
      notes: "Oversees the bereavement support list.",
      remarks: "Memorial date is today.",
    },
    {
      memberId: "M-0003",
      firstName: "Joshua",
      lastName: "Rivera",
      gender: "MALE" as const,
      birthDate: set(today, { year: 2001, month: 3, date: 2 }),
      civilStatus: "SINGLE" as const,
      nationality: "Filipino",
      contactNumber: "+63 900 555 6666",
      email: "joshua.rivera@example.com",
      address: "32 Faith Lane, Makati",
      highestEducation: "College",
      schoolAttended: "Ateneo de Manila University",
      courseOrDegree: "BS Communications",
      occupation: "Designer",
      companyName: "Bright Studio",
      employmentStatus: "Contract",
      workAddress: "Makati City",
      dateJoinedChurch: subDays(today, 700),
      membershipStatus: MembershipStatus.ACTIVE,
      membershipType: MembershipType.YOUTH,
      baptismStatus: BaptismStatus.NOT_BAPTIZED,
      firstVisitDate: subDays(today, 740),
      assignedSmallGroup: "Campus Connect",
      serviceAttendanceStatus: ServiceAttendanceStatus.OCCASIONAL,
      ministriesJoined: "Media",
      ministryRole: "Photographer",
      volunteerStatus: "Active",
      leaderName: "Kuya David Ong",
      trainingCompleted: "Media Bootcamp",
      notes: "Helps capture youth events.",
      remarks: "Potential media team lead.",
    },
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { memberId: member.memberId },
      update: member,
      create: member,
    });
  }

  const admin = users[0];

  const posts = [
    {
      title: "Community Prayer Night This Friday",
      excerpt: "Join the church family for an evening of worship and prayer.",
      content: "We are gathering this Friday at 7 PM for a guided prayer and worship night in the main sanctuary.",
      publishDate: subDays(today, 1),
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
    },
    {
      title: "Children's Ministry Volunteers Needed",
      excerpt: "We are opening new volunteer slots for the June rotation.",
      content: "If you have a heart for serving children, please register with the ministry desk after service.",
      publishDate: today,
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: toSlug(post.title) },
      update: { ...post, authorId: admin.id, slug: toSlug(post.title) },
      create: { ...post, authorId: admin.id, slug: toSlug(post.title) },
    });
  }

  await prisma.event.upsert({
    where: { slug: "family-sunday-service" },
    update: {
      title: "Family Sunday Service",
      description: "A church-wide worship gathering with family prayer and communion.",
      eventDate: addDays(today, 3),
      time: "9:00 AM",
      location: "Main Sanctuary",
      registrationLink: "https://example.com/register/family-sunday-service",
      createdById: admin.id,
    },
    create: {
      title: "Family Sunday Service",
      slug: "family-sunday-service",
      description: "A church-wide worship gathering with family prayer and communion.",
      eventDate: addDays(today, 3),
      time: "9:00 AM",
      location: "Main Sanctuary",
      registrationLink: "https://example.com/register/family-sunday-service",
      createdById: admin.id,
    },
  });

  await prisma.program.upsert({
    where: { slug: "midweek-prayer-service" },
    update: {
      title: "Midweek Prayer Service",
      scheduleDay: "Wednesday",
      scheduleTime: "7:00 PM",
      location: "Chapel Hall",
      description: "Weekly prayer gathering focused on church care and community needs.",
      isActive: true,
      createdById: admin.id,
    },
    create: {
      title: "Midweek Prayer Service",
      slug: "midweek-prayer-service",
      scheduleDay: "Wednesday",
      scheduleTime: "7:00 PM",
      location: "Chapel Hall",
      description: "Weekly prayer gathering focused on church care and community needs.",
      isActive: true,
      createdById: admin.id,
    },
  });

  await prisma.gallery.upsert({
    where: { slug: "easter-celebration-2026" },
    update: {
      title: "Easter Celebration 2026",
      description: "Snapshots from the Easter sunrise service and family breakfast.",
      coverImage: "/sample-gallery-1.svg",
      createdById: admin.id,
    },
    create: {
      title: "Easter Celebration 2026",
      slug: "easter-celebration-2026",
      description: "Snapshots from the Easter sunrise service and family breakfast.",
      coverImage: "/sample-gallery-1.svg",
      createdById: admin.id,
    },
  });

  const gallery = await prisma.gallery.findUnique({ where: { slug: "easter-celebration-2026" } });

  if (gallery) {
    await prisma.galleryImage.deleteMany({ where: { galleryId: gallery.id } });
    await prisma.galleryImage.createMany({
      data: [
        { galleryId: gallery.id, imageUrl: "/sample-gallery-1.svg", caption: "Sunrise worship gathering", sortOrder: 0 },
        { galleryId: gallery.id, imageUrl: "/sample-gallery-2.svg", caption: "Community breakfast", sortOrder: 1 },
        { galleryId: gallery.id, imageUrl: "/sample-gallery-3.svg", caption: "Children's choir moment", sortOrder: 2 },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });