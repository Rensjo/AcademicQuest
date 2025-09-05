// Sample data for Academic Quest Demo
// This represents a student's progress over 2 academic terms

export const DEMO_ACADEMIC_YEARS = [
  {
    id: "demo-year-1",
    label: "AY 2024–2025",
    terms: [
      {
        id: "fall-2024",
        name: "Fall 2024",
        startDate: "2024-08-26",
        endDate: "2024-12-15",
        slots: [
          // CS 101 - MWF 9:00-10:30
          { id: "cs101-mwf-1", title: "CS 101", courseCode: "CS 101", room: "Room 201", day: 1 as const, start: "09:00", end: "10:30", color: "#3B82F6" },
          { id: "cs101-mwf-2", title: "CS 101", courseCode: "CS 101", room: "Room 201", day: 3 as const, start: "09:00", end: "10:30", color: "#3B82F6" },
          { id: "cs101-mwf-3", title: "CS 101", courseCode: "CS 101", room: "Room 201", day: 5 as const, start: "09:00", end: "10:30", color: "#3B82F6" },
          
          // MATH 201 - TR 11:00-12:30
          { id: "math201-tr-1", title: "MATH 201", courseCode: "MATH 201", room: "Math 105", day: 2 as const, start: "11:00", end: "12:30", color: "#EF4444" },
          { id: "math201-tr-2", title: "MATH 201", courseCode: "MATH 201", room: "Math 105", day: 4 as const, start: "11:00", end: "12:30", color: "#EF4444" },
          
          // ENG 102 - MW 2:00-3:30
          { id: "eng102-mw-1", title: "ENG 102", courseCode: "ENG 102", room: "LA 250", day: 1 as const, start: "14:00", end: "15:30", color: "#10B981" },
          { id: "eng102-mw-2", title: "ENG 102", courseCode: "ENG 102", room: "LA 250", day: 3 as const, start: "14:00", end: "15:30", color: "#10B981" },
          
          // PHYS 101 - TR 1:00-2:30, F 1:00-2:00 (lab)
          { id: "phys101-tr-1", title: "PHYS 101", courseCode: "PHYS 101", room: "Science 301", day: 2 as const, start: "13:00", end: "14:30", color: "#8B5CF6" },
          { id: "phys101-tr-2", title: "PHYS 101", courseCode: "PHYS 101", room: "Science 301", day: 4 as const, start: "13:00", end: "14:30", color: "#8B5CF6" },
          { id: "phys101-lab", title: "PHYS 101 Lab", courseCode: "PHYS 101", room: "Science Lab 302", day: 5 as const, start: "13:00", end: "14:00", color: "#8B5CF6" }
        ]
      },
      {
        id: "spring-2025",
        name: "Spring 2025",
        startDate: "2025-01-15",
        endDate: "2025-05-15",
        slots: [
          // CS 201 - MWF 10:00-11:30, F 10:00-11:00 (lab)
          { id: "cs201-mwf-1", title: "CS 201", courseCode: "CS 201", room: "CS 150", day: 1 as const, start: "10:00", end: "11:30", color: "#3B82F6" },
          { id: "cs201-mwf-2", title: "CS 201", courseCode: "CS 201", room: "CS 150", day: 3 as const, start: "10:00", end: "11:30", color: "#3B82F6" },
          { id: "cs201-lab", title: "CS 201 Lab", courseCode: "CS 201", room: "CS Lab 155", day: 5 as const, start: "10:00", end: "11:00", color: "#3B82F6" },
          
          // MATH 301 - TR 9:00-10:30
          { id: "math301-tr-1", title: "MATH 301", courseCode: "MATH 301", room: "Math 210", day: 2 as const, start: "09:00", end: "10:30", color: "#EF4444" },
          { id: "math301-tr-2", title: "MATH 301", courseCode: "MATH 301", room: "Math 210", day: 4 as const, start: "09:00", end: "10:30", color: "#EF4444" },
          
          // STAT 201 - MW 1:00-2:30
          { id: "stat201-mw-1", title: "STAT 201", courseCode: "STAT 201", room: "Stats 101", day: 1 as const, start: "13:00", end: "14:30", color: "#F59E0B" },
          { id: "stat201-mw-2", title: "STAT 201", courseCode: "STAT 201", room: "Stats 101", day: 3 as const, start: "13:00", end: "14:30", color: "#F59E0B" },
          
          // PHYS 201 - TR 2:00-3:30, F 2:00-3:00 (lab)
          { id: "phys201-tr-1", title: "PHYS 201", courseCode: "PHYS 201", room: "Science 301", day: 2 as const, start: "14:00", end: "15:30", color: "#8B5CF6" },
          { id: "phys201-tr-2", title: "PHYS 201", courseCode: "PHYS 201", room: "Science 301", day: 4 as const, start: "14:00", end: "15:30", color: "#8B5CF6" },
          { id: "phys201-lab", title: "PHYS 201 Lab", courseCode: "PHYS 201", room: "Physics Lab 305", day: 5 as const, start: "14:00", end: "15:00", color: "#8B5CF6" }
        ]
      },
      {
        id: "summer-2025",
        name: "Summer 2025",
        startDate: "2025-06-01",
        endDate: "2025-09-30",
        slots: [
          // CS 301 - MWF 9:00-11:00, F 9:00-10:00 (lab)
          { id: "cs301-mwf-1", title: "CS 301", courseCode: "CS 301", room: "CS 200", day: 1 as const, start: "09:00", end: "11:00", color: "#3B82F6" },
          { id: "cs301-mwf-2", title: "CS 301", courseCode: "CS 301", room: "CS 200", day: 3 as const, start: "09:00", end: "11:00", color: "#3B82F6" },
          { id: "cs301-lab", title: "CS 301 Lab", courseCode: "CS 301", room: "CS Lab 205", day: 5 as const, start: "09:00", end: "10:00", color: "#3B82F6" },
          
          // CS 310 - TR 10:00-11:30
          { id: "cs310-tr-1", title: "CS 310", courseCode: "CS 310", room: "CS 250", day: 2 as const, start: "10:00", end: "11:30", color: "#06B6D4" },
          { id: "cs310-tr-2", title: "CS 310", courseCode: "CS 310", room: "CS 250", day: 4 as const, start: "10:00", end: "11:30", color: "#06B6D4" },
          
          // MATH 350 - MW 1:00-2:30
          { id: "math350-mw-1", title: "MATH 350", courseCode: "MATH 350", room: "Math 305", day: 1 as const, start: "13:00", end: "14:30", color: "#EF4444" },
          { id: "math350-mw-2", title: "MATH 350", courseCode: "MATH 350", room: "Math 305", day: 3 as const, start: "13:00", end: "14:30", color: "#EF4444" },
          
          // PSYC 101 - TR 3:00-4:30
          { id: "psyc101-tr-1", title: "PSYC 101", courseCode: "PSYC 101", room: "Psychology 101", day: 2 as const, start: "15:00", end: "16:30", color: "#84CC16" },
          { id: "psyc101-tr-2", title: "PSYC 101", courseCode: "PSYC 101", room: "Psychology 101", day: 4 as const, start: "15:00", end: "16:30", color: "#84CC16" }
        ]
      }
    ]
  },
  {
    id: "demo-year-2",
    label: "AY 2025–2026",
    terms: [
      {
        id: "fall-2025",
        name: "Fall 2025",
        startDate: "2025-08-25",
        endDate: "2025-12-15",
        slots: [
          // CS 401 - MWF 9:00-10:30
          { id: "cs401-mwf-1", title: "CS 401", courseCode: "CS 401", room: "CS 301", day: 1 as const, start: "09:00", end: "10:30", color: "#3B82F6" },
          { id: "cs401-mwf-2", title: "CS 401", courseCode: "CS 401", room: "CS 301", day: 3 as const, start: "09:00", end: "10:30", color: "#3B82F6" },
          { id: "cs401-mwf-3", title: "CS 401", courseCode: "CS 401", room: "CS 301", day: 5 as const, start: "09:00", end: "10:30", color: "#3B82F6" },
          
          // CS 450 - TR 11:00-12:30
          { id: "cs450-tr-1", title: "CS 450", courseCode: "CS 450", room: "CS 350", day: 2 as const, start: "11:00", end: "12:30", color: "#06B6D4" },
          { id: "cs450-tr-2", title: "CS 450", courseCode: "CS 450", room: "CS 350", day: 4 as const, start: "11:00", end: "12:30", color: "#06B6D4" },
          
          // CS 480 - MW 2:00-3:30
          { id: "cs480-mw-1", title: "CS 480", courseCode: "CS 480", room: "CS 400", day: 1 as const, start: "14:00", end: "15:30", color: "#8B5CF6" },
          { id: "cs480-mw-2", title: "CS 480", courseCode: "CS 480", room: "CS 400", day: 3 as const, start: "14:00", end: "15:30", color: "#8B5CF6" },
          
          // CS 470 - TR 1:00-2:30
          { id: "cs470-tr-1", title: "CS 470", courseCode: "CS 470", room: "CS 380", day: 2 as const, start: "13:00", end: "14:30", color: "#F59E0B" },
          { id: "cs470-tr-2", title: "CS 470", courseCode: "CS 470", room: "CS 380", day: 4 as const, start: "13:00", end: "14:30", color: "#F59E0B" },
          
          // ENG 301 - MW 4:00-5:30
          { id: "eng301-mw-1", title: "ENG 301", courseCode: "ENG 301", room: "LA 350", day: 1 as const, start: "16:00", end: "17:30", color: "#10B981" },
          { id: "eng301-mw-2", title: "ENG 301", courseCode: "ENG 301", room: "LA 350", day: 3 as const, start: "16:00", end: "17:30", color: "#10B981" }
        ]
      },
      {
        id: "spring-2026",
        name: "Spring 2026",
        startDate: "2026-01-15",
        endDate: "2026-05-15",
        slots: []
      }
    ]
  }
]

export const DEMO_COURSES = [
  // Fall 2024 Courses
  {
    id: "cs101-fall24",
    code: "CS 101",
    name: "Introduction to Computer Science",
    instructor: "Dr. Smith",
    credits: 3,
    termId: "fall-2024",
    yearId: "demo-year-1",
    color: "#3B82F6",
    schedule: [
      { day: 1, startTime: "09:00", endTime: "10:30", location: "Room 201" },
      { day: 3, startTime: "09:00", endTime: "10:30", location: "Room 201" },
      { day: 5, startTime: "09:00", endTime: "10:30", location: "Room 201" }
    ]
  },
  {
    id: "math201-fall24",
    code: "MATH 201",
    name: "Calculus II",
    instructor: "Prof. Johnson",
    credits: 4,
    termId: "fall-2024",
    yearId: "demo-year-1",
    color: "#EF4444",
    schedule: [
      { day: 2, startTime: "11:00", endTime: "12:30", location: "Math Building 105" },
      { day: 4, startTime: "11:00", endTime: "12:30", location: "Math Building 105" }
    ]
  },
  {
    id: "eng102-fall24",
    code: "ENG 102",
    name: "English Composition",
    instructor: "Dr. Williams",
    credits: 3,
    termId: "fall-2024",
    yearId: "demo-year-1",
    color: "#10B981",
    schedule: [
      { day: 1, startTime: "14:00", endTime: "15:30", location: "Liberal Arts 250" },
      { day: 3, startTime: "14:00", endTime: "15:30", location: "Liberal Arts 250" }
    ]
  },
  {
    id: "phys101-fall24",
    code: "PHYS 101",
    name: "General Physics I",
    instructor: "Dr. Brown",
    credits: 4,
    termId: "fall-2024",
    yearId: "demo-year-1",
    color: "#8B5CF6",
    schedule: [
      { day: 2, startTime: "13:00", endTime: "14:30", location: "Science Building 301" },
      { day: 4, startTime: "13:00", endTime: "14:30", location: "Science Building 301" },
      { day: 5, startTime: "13:00", endTime: "14:00", location: "Science Lab 302" }
    ]
  },

  // Spring 2025 Courses
  {
    id: "cs201-spring25",
    code: "CS 201",
    name: "Data Structures & Algorithms",
    instructor: "Dr. Davis",
    credits: 4,
    termId: "spring-2025",
    yearId: "demo-year-1",
    color: "#3B82F6",
    schedule: [
      { day: 1, startTime: "10:00", endTime: "11:30", location: "CS Building 150" },
      { day: 3, startTime: "10:00", endTime: "11:30", location: "CS Building 150" },
      { day: 5, startTime: "10:00", endTime: "11:00", location: "CS Lab 155" }
    ]
  },
  {
    id: "math301-spring25",
    code: "MATH 301",
    name: "Linear Algebra",
    instructor: "Prof. Anderson",
    credits: 3,
    termId: "spring-2025",
    yearId: "demo-year-1",
    color: "#EF4444",
    schedule: [
      { day: 2, startTime: "09:00", endTime: "10:30", location: "Math Building 210" },
      { day: 4, startTime: "09:00", endTime: "10:30", location: "Math Building 210" }
    ]
  },
  {
    id: "stat201-spring25",
    code: "STAT 201",
    name: "Introduction to Statistics",
    instructor: "Dr. Wilson",
    credits: 3,
    termId: "spring-2025",
    yearId: "demo-year-1",
    color: "#F59E0B",
    schedule: [
      { day: 1, startTime: "13:00", endTime: "14:30", location: "Statistics Center 101" },
      { day: 3, startTime: "13:00", endTime: "14:30", location: "Statistics Center 101" }
    ]
  },
  {
    id: "phys201-spring25",
    code: "PHYS 201",
    name: "General Physics II",
    instructor: "Dr. Miller",
    credits: 4,
    termId: "spring-2025",
    yearId: "demo-year-1",
    color: "#8B5CF6",
    schedule: [
      { day: 2, startTime: "14:00", endTime: "15:30", location: "Science Building 301" },
      { day: 4, startTime: "14:00", endTime: "15:30", location: "Science Building 301" },
      { day: 5, startTime: "14:00", endTime: "15:00", location: "Physics Lab 305" }
    ]
  },

  // Summer 2025 Courses
  {
    id: "cs301-summer25",
    code: "CS 301",
    name: "Software Engineering",
    instructor: "Prof. Garcia",
    credits: 4,
    termId: "summer-2025",
    yearId: "demo-year-1",
    color: "#3B82F6",
    schedule: [
      { day: 1, startTime: "09:00", endTime: "11:00", location: "CS Building 200" },
      { day: 3, startTime: "09:00", endTime: "11:00", location: "CS Building 200" },
      { day: 5, startTime: "09:00", endTime: "10:00", location: "CS Lab 205" }
    ]
  },
  {
    id: "cs310-summer25",
    code: "CS 310",
    name: "Database Systems",
    instructor: "Dr. Thompson",
    credits: 3,
    termId: "summer-2025",
    yearId: "demo-year-1",
    color: "#06B6D4",
    schedule: [
      { day: 2, startTime: "10:00", endTime: "11:30", location: "CS Building 250" },
      { day: 4, startTime: "10:00", endTime: "11:30", location: "CS Building 250" }
    ]
  },
  {
    id: "math350-summer25",
    code: "MATH 350",
    name: "Discrete Mathematics",
    instructor: "Prof. Wilson",
    credits: 3,
    termId: "summer-2025",
    yearId: "demo-year-1",
    color: "#EF4444",
    schedule: [
      { day: 1, startTime: "13:00", endTime: "14:30", location: "Math Building 305" },
      { day: 3, startTime: "13:00", endTime: "14:30", location: "Math Building 305" }
    ]
  },
  {
    id: "psyc101-summer25",
    code: "PSYC 101",
    name: "Introduction to Psychology",
    instructor: "Dr. Roberts",
    credits: 3,
    termId: "summer-2025",
    yearId: "demo-year-1",
    color: "#84CC16",
    schedule: [
      { day: 2, startTime: "15:00", endTime: "16:30", location: "Psychology Building 101" },
      { day: 4, startTime: "15:00", endTime: "16:30", location: "Psychology Building 101" }
    ]
  },

  // Fall 2025 Courses (Current Term)
  {
    id: "cs401-fall25",
    code: "CS 401",
    name: "Advanced Algorithms",
    instructor: "Dr. Kumar",
    credits: 4,
    termId: "fall-2025",
    yearId: "demo-year-2",
    color: "#3B82F6",
    schedule: [
      { day: 1, startTime: "09:00", endTime: "10:30", location: "CS Building 301" },
      { day: 3, startTime: "09:00", endTime: "10:30", location: "CS Building 301" },
      { day: 5, startTime: "09:00", endTime: "10:30", location: "CS Building 301" }
    ]
  },
  {
    id: "cs450-fall25",
    code: "CS 450",
    name: "Database Systems",
    instructor: "Prof. Martinez",
    credits: 3,
    termId: "fall-2025",
    yearId: "demo-year-2",
    color: "#06B6D4",
    schedule: [
      { day: 2, startTime: "11:00", endTime: "12:30", location: "CS Building 350" },
      { day: 4, startTime: "11:00", endTime: "12:30", location: "CS Building 350" }
    ]
  },
  {
    id: "cs480-fall25",
    code: "CS 480",
    name: "Software Engineering",
    instructor: "Dr. Chen",
    credits: 4,
    termId: "fall-2025",
    yearId: "demo-year-2",
    color: "#8B5CF6",
    schedule: [
      { day: 1, startTime: "14:00", endTime: "15:30", location: "CS Building 400" },
      { day: 3, startTime: "14:00", endTime: "15:30", location: "CS Building 400" }
    ]
  },
  {
    id: "cs470-fall25",
    code: "CS 470",
    name: "Machine Learning",
    instructor: "Prof. Zhang",
    credits: 3,
    termId: "fall-2025",
    yearId: "demo-year-2",
    color: "#F59E0B",
    schedule: [
      { day: 2, startTime: "13:00", endTime: "14:30", location: "CS Building 380" },
      { day: 4, startTime: "13:00", endTime: "14:30", location: "CS Building 380" }
    ]
  },
  {
    id: "eng301-fall25",
    code: "ENG 301",
    name: "Technical Writing",
    instructor: "Dr. Johnson",
    credits: 3,
    termId: "fall-2025",
    yearId: "demo-year-2",
    color: "#10B981",
    schedule: [
      { day: 1, startTime: "16:00", endTime: "17:30", location: "Liberal Arts 350" },
      { day: 3, startTime: "16:00", endTime: "17:30", location: "Liberal Arts 350" }
    ]
  }
]

export const DEMO_TASKS = [
  // Fall 2024 Tasks (Completed)
  {
    id: "task-fall-1",
    title: "CS 101 Project: Calculator App",
    description: "Build a basic calculator using Python",
    subject: "CS 101",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2024-10-15",
    dateCompleted: "2024-10-14",
    timeSpent: 8,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },
  {
    id: "task-fall-2",
    title: "Math 201 Homework Set 5",
    description: "Integration by parts problems",
    subject: "MATH 201",
    priority: "medium" as const,
    status: "completed" as const,
    dueDate: "2024-09-20",
    dateCompleted: "2024-09-19",
    timeSpent: 3,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },
  {
    id: "task-fall-3",
    title: "English Essay: Technology Impact",
    description: "Write a 1500-word essay on technology's impact on society",
    subject: "ENG 102",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2024-11-01",
    dateCompleted: "2024-10-30",
    timeSpent: 6,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },
  {
    id: "task-fall-4",
    title: "Physics Lab Report #3",
    description: "Projectile motion experiment analysis",
    subject: "PHYS 101",
    priority: "medium" as const,
    status: "completed" as const,
    dueDate: "2024-10-25",
    dateCompleted: "2024-10-24",
    timeSpent: 4,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },
  {
    id: "task-fall-5",
    title: "CS 101 Final Project",
    description: "Create a text-based adventure game",
    subject: "CS 101",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2024-12-10",
    dateCompleted: "2024-12-08",
    timeSpent: 12,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },

  // Spring 2025 Tasks (Mix of completed, pending, overdue)
  {
    id: "task-spring-1",
    title: "CS 201 Assignment: Binary Tree Implementation",
    description: "Implement a balanced binary search tree in Java",
    subject: "CS 201",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2025-02-15",
    dateCompleted: "2025-02-14",
    timeSpent: 10,
    yearId: "demo-year-1",
    termId: "spring-2025"
  },
  {
    id: "task-spring-2",
    title: "Math 301 Homework: Matrix Operations",
    description: "Solve linear systems using matrix methods",
    subject: "MATH 301",
    priority: "medium" as const,
    status: "completed" as const,
    dueDate: "2025-03-01",
    dateCompleted: "2025-02-28",
    timeSpent: 4,
    yearId: "demo-year-1",
    termId: "spring-2025"
  },
  {
    id: "task-spring-3",
    title: "Statistics Project: Data Analysis",
    description: "Analyze real-world dataset and present findings",
    subject: "STAT 201",
    priority: "high" as const,
    status: "pending" as const,
    dueDate: "2025-04-15",
    yearId: "demo-year-1",
    termId: "spring-2025"
  },
  {
    id: "task-spring-4",
    title: "Physics Lab Report #2",
    description: "Electromagnetic induction experiment",
    subject: "PHYS 201",
    priority: "medium" as const,
    status: "overdue" as const,
    dueDate: "2025-03-20",
    yearId: "demo-year-1",
    termId: "spring-2025"
  },
  {
    id: "task-spring-5",
    title: "CS 201 Midterm Preparation",
    description: "Review algorithms and data structures",
    subject: "CS 201",
    priority: "high" as const,
    status: "pending" as const,
    dueDate: "2025-03-15",
    yearId: "demo-year-1",
    termId: "spring-2025"
  },
  {
    id: "task-spring-6",
    title: "Math 301 Quiz Preparation",
    description: "Study eigenvalues and eigenvectors",
    subject: "MATH 301",
    priority: "medium" as const,
    status: "pending" as const,
    dueDate: "2025-03-10",
    yearId: "demo-year-1",
    termId: "spring-2025"
  },

  // Summer 2025 Tasks (Mix of completed and pending)
  {
    id: "task-summer-1",
    title: "CS 301 Team Project: University Management System",
    description: "Design and implement a web-based university management system",
    subject: "CS 301",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2025-07-15",
    dateCompleted: "2025-07-14",
    timeSpent: 20,
    yearId: "demo-year-1",
    termId: "summer-2025"
  },
  {
    id: "task-summer-2",
    title: "CS 310 Database Design Project",
    description: "Design and implement a relational database for e-commerce",
    subject: "CS 310",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2025-08-01",
    dateCompleted: "2025-07-30",
    timeSpent: 15,
    yearId: "demo-year-1",
    termId: "summer-2025"
  },
  {
    id: "task-summer-3",
    title: "MATH 350 Homework: Graph Theory",
    description: "Solve problems on graph algorithms and connectivity",
    subject: "MATH 350",
    priority: "medium" as const,
    status: "completed" as const,
    dueDate: "2025-06-20",
    dateCompleted: "2025-06-19",
    timeSpent: 5,
    yearId: "demo-year-1",
    termId: "summer-2025"
  },
  {
    id: "task-summer-4",
    title: "PSYC 101 Research Paper",
    description: "Write a research paper on cognitive psychology",
    subject: "PSYC 101",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2025-08-15",
    dateCompleted: "2025-08-13",
    timeSpent: 12,
    yearId: "demo-year-1",
    termId: "summer-2025"
  },
  {
    id: "task-summer-5",
    title: "CS 301 Midterm Exam",
    description: "Software engineering principles and methodologies",
    subject: "CS 301",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2025-07-01",
    dateCompleted: "2025-07-01",
    timeSpent: 3,
    yearId: "demo-year-1",
    termId: "summer-2025"
  },

  // Fall 2024 Additional Tasks
  {
    id: "task-fall-6",
    title: "MATH 201 Midterm 1",
    description: "Integration techniques and applications",
    subject: "MATH 201",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2024-09-25",
    dateCompleted: "2024-09-25",
    timeSpent: 2,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },
  {
    id: "task-fall-7",
    title: "ENG 102 Peer Review Assignment",
    description: "Review and provide feedback on classmate's essay",
    subject: "ENG 102",
    priority: "low" as const,
    status: "completed" as const,
    dueDate: "2024-10-05",
    dateCompleted: "2024-10-04",
    timeSpent: 2,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },
  {
    id: "task-fall-8",
    title: "PHYS 101 Problem Set 4",
    description: "Kinematics and dynamics problems",
    subject: "PHYS 101",
    priority: "medium" as const,
    status: "completed" as const,
    dueDate: "2024-09-30",
    dateCompleted: "2024-09-29",
    timeSpent: 4,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },
  {
    id: "task-fall-9",
    title: "CS 101 Quiz 3: Functions and Loops",
    description: "Programming fundamentals assessment",
    subject: "CS 101",
    priority: "medium" as const,
    status: "completed" as const,
    dueDate: "2024-10-08",
    dateCompleted: "2024-10-08",
    timeSpent: 1,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },
  {
    id: "task-fall-10",
    title: "HIST 110 Research Paper",
    description: "Analysis of World War I causes and consequences",
    subject: "HIST 110",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2024-11-15",
    dateCompleted: "2024-11-13",
    timeSpent: 8,
    yearId: "demo-year-1",
    termId: "fall-2024"
  },

  // Spring 2025 Additional Tasks
  {
    id: "task-spring-7",
    title: "STAT 201 Final Project",
    description: "Statistical analysis of real-world dataset",
    subject: "STAT 201",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2025-05-01",
    dateCompleted: "2025-04-30",
    timeSpent: 14,
    yearId: "demo-year-1",
    termId: "spring-2025"
  },
  {
    id: "task-spring-8",
    title: "CS 250 Assembly Language Project",
    description: "Implement sorting algorithms in assembly",
    subject: "CS 250",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2025-04-20",
    dateCompleted: "2025-04-18",
    timeSpent: 16,
    yearId: "demo-year-1",
    termId: "spring-2025"
  },
  {
    id: "task-spring-9",
    title: "PHIL 101 Ethics Essay",
    description: "Analyze a contemporary ethical dilemma",
    subject: "PHIL 101",
    priority: "medium" as const,
    status: "completed" as const,
    dueDate: "2025-03-25",
    dateCompleted: "2025-03-23",
    timeSpent: 6,
    yearId: "demo-year-1",
    termId: "spring-2025"
  },
  {
    id: "task-spring-10",
    title: "MATH 301 Final Exam",
    description: "Comprehensive linear algebra assessment",
    subject: "MATH 301",
    priority: "high" as const,
    status: "completed" as const,
    dueDate: "2025-05-12",
    dateCompleted: "2025-05-12",
    timeSpent: 3,
    yearId: "demo-year-1",
    termId: "spring-2025"
  },
  {
    id: "task-spring-11",
    title: "CS 201 Algorithm Analysis Report",
    description: "Compare time complexity of sorting algorithms",
    subject: "CS 201",
    priority: "medium" as const,
    status: "completed" as const,
    dueDate: "2025-04-05",
    dateCompleted: "2025-04-03",
    timeSpent: 7,
    yearId: "demo-year-1",
    termId: "spring-2025"
  },

  // Fall 2025 (Current Term) - Tasks Due This Week (September 2025)
  {
    id: "task-current-1",
    title: "CS 401 Advanced Algorithms Assignment",
    description: "Implement dynamic programming solutions",
    subject: "CS 401",
    priority: "high" as const,
    status: "pending" as const,
    dueDate: "2025-09-06",
    yearId: "demo-year-2",
    termId: "fall-2025"
  },
  {
    id: "task-current-2",
    title: "Database Systems Homework 2",
    description: "Query optimization and indexing exercises",
    subject: "CS 450",
    priority: "medium" as const,
    status: "pending" as const,
    dueDate: "2025-09-08",
    yearId: "demo-year-2",
    termId: "fall-2025"
  },
  {
    id: "task-current-3",
    title: "Software Engineering Sprint Review",
    description: "Present team project progress to stakeholders",
    subject: "CS 480",
    priority: "high" as const,
    status: "pending" as const,
    dueDate: "2025-09-09",
    yearId: "demo-year-2",
    termId: "fall-2025"
  },
  {
    id: "task-current-4",
    title: "Machine Learning Quiz 1",
    description: "Linear regression and classification basics",
    subject: "CS 470",
    priority: "medium" as const,
    status: "pending" as const,
    dueDate: "2025-09-10",
    yearId: "demo-year-2",
    termId: "fall-2025"
  },
  {
    id: "task-current-5",
    title: "Technical Writing Assignment",
    description: "Write API documentation for team project",
    subject: "ENG 301",
    priority: "low" as const,
    status: "pending" as const,
    dueDate: "2025-09-11",
    yearId: "demo-year-2",
    termId: "fall-2025"
  },
  {
    id: "task-current-6",
    title: "Advanced Mathematics Problem Set",
    description: "Real analysis and topology problems",
    subject: "MATH 401",
    priority: "medium" as const,
    status: "overdue" as const,
    dueDate: "2025-09-03",
    yearId: "demo-year-2",
    termId: "fall-2025"
  },
  {
    id: "task-current-7",
    title: "Computer Graphics Project Milestone",
    description: "Implement 3D rendering pipeline",
    subject: "CS 465",
    priority: "high" as const,
    status: "pending" as const,
    dueDate: "2025-09-12",
    yearId: "demo-year-2",
    termId: "fall-2025"
  },
  {
    id: "task-current-8",
    title: "Ethics in AI Discussion Post",
    description: "Analyze bias in machine learning algorithms",
    subject: "PHIL 350",
    priority: "low" as const,
    status: "pending" as const,
    dueDate: "2025-09-07",
    yearId: "demo-year-2",
    termId: "fall-2025"
  },
  {
    id: "task-current-9",
    title: "Senior Capstone Proposal",
    description: "Submit detailed project proposal and timeline",
    subject: "CS 499",
    priority: "high" as const,
    status: "pending" as const,
    dueDate: "2025-09-13",
    yearId: "demo-year-2",
    termId: "fall-2025"
  }
]

export const DEMO_ATTENDANCE = [
  // Fall 2024 Attendance - Excellent record (Aug 26 - Dec 15, 2024)
  // CS 101 - MWF (48 classes total)
  { courseId: "cs101-fall24", date: "2024-08-26", status: "present" },
  { courseId: "cs101-fall24", date: "2024-08-28", status: "present" },
  { courseId: "cs101-fall24", date: "2024-08-30", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-02", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-04", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-06", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-09", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-11", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-13", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-16", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-18", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-20", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-23", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-25", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-27", status: "present" },
  { courseId: "cs101-fall24", date: "2024-09-30", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-02", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-04", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-07", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-09", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-11", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-14", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-16", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-18", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-21", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-23", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-25", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-28", status: "present" },
  { courseId: "cs101-fall24", date: "2024-10-30", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-01", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-04", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-06", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-08", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-11", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-13", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-15", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-18", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-20", status: "present" },
  { courseId: "cs101-fall24", date: "2024-11-22", status: "present" },
  { courseId: "cs101-fall24", date: "2024-12-02", status: "present" },
  { courseId: "cs101-fall24", date: "2024-12-04", status: "present" },
  { courseId: "cs101-fall24", date: "2024-12-06", status: "present" },
  { courseId: "cs101-fall24", date: "2024-12-09", status: "present" },
  { courseId: "cs101-fall24", date: "2024-12-11", status: "present" },
  { courseId: "cs101-fall24", date: "2024-12-13", status: "present" },

  // MATH 201 - TR (32 classes total) - 2 absences
  { courseId: "math201-fall24", date: "2024-08-27", status: "present" },
  { courseId: "math201-fall24", date: "2024-08-29", status: "present" },
  { courseId: "math201-fall24", date: "2024-09-03", status: "present" },
  { courseId: "math201-fall24", date: "2024-09-05", status: "present" },
  { courseId: "math201-fall24", date: "2024-09-10", status: "present" },
  { courseId: "math201-fall24", date: "2024-09-12", status: "present" },
  { courseId: "math201-fall24", date: "2024-09-17", status: "present" },
  { courseId: "math201-fall24", date: "2024-09-19", status: "present" },
  { courseId: "math201-fall24", date: "2024-09-24", status: "present" },
  { courseId: "math201-fall24", date: "2024-09-26", status: "present" },
  { courseId: "math201-fall24", date: "2024-10-01", status: "present" },
  { courseId: "math201-fall24", date: "2024-10-03", status: "present" },
  { courseId: "math201-fall24", date: "2024-10-08", status: "present" },
  { courseId: "math201-fall24", date: "2024-10-10", status: "present" },
  { courseId: "math201-fall24", date: "2024-10-15", status: "present" },
  { courseId: "math201-fall24", date: "2024-10-17", status: "present" },
  { courseId: "math201-fall24", date: "2024-10-22", status: "present" },
  { courseId: "math201-fall24", date: "2024-10-24", status: "present" },
  { courseId: "math201-fall24", date: "2024-10-29", status: "absent" },
  { courseId: "math201-fall24", date: "2024-10-31", status: "present" },
  { courseId: "math201-fall24", date: "2024-11-05", status: "present" },
  { courseId: "math201-fall24", date: "2024-11-07", status: "present" },
  { courseId: "math201-fall24", date: "2024-11-12", status: "present" },
  { courseId: "math201-fall24", date: "2024-11-14", status: "present" },
  { courseId: "math201-fall24", date: "2024-11-19", status: "present" },
  { courseId: "math201-fall24", date: "2024-11-21", status: "present" },
  { courseId: "math201-fall24", date: "2024-12-03", status: "present" },
  { courseId: "math201-fall24", date: "2024-12-05", status: "present" },
  { courseId: "math201-fall24", date: "2024-12-10", status: "absent" },
  { courseId: "math201-fall24", date: "2024-12-12", status: "present" },

  // ENG 102 - MW (32 classes total) - 1 absence
  { courseId: "eng102-fall24", date: "2024-08-26", status: "present" },
  { courseId: "eng102-fall24", date: "2024-08-28", status: "present" },
  { courseId: "eng102-fall24", date: "2024-09-02", status: "present" },
  { courseId: "eng102-fall24", date: "2024-09-04", status: "present" },
  { courseId: "eng102-fall24", date: "2024-09-09", status: "present" },
  { courseId: "eng102-fall24", date: "2024-09-11", status: "present" },
  { courseId: "eng102-fall24", date: "2024-09-16", status: "present" },
  { courseId: "eng102-fall24", date: "2024-09-18", status: "present" },
  { courseId: "eng102-fall24", date: "2024-09-23", status: "present" },
  { courseId: "eng102-fall24", date: "2024-09-25", status: "present" },
  { courseId: "eng102-fall24", date: "2024-09-30", status: "present" },
  { courseId: "eng102-fall24", date: "2024-10-02", status: "present" },
  { courseId: "eng102-fall24", date: "2024-10-07", status: "present" },
  { courseId: "eng102-fall24", date: "2024-10-09", status: "present" },
  { courseId: "eng102-fall24", date: "2024-10-14", status: "present" },
  { courseId: "eng102-fall24", date: "2024-10-16", status: "present" },
  { courseId: "eng102-fall24", date: "2024-10-21", status: "present" },
  { courseId: "eng102-fall24", date: "2024-10-23", status: "present" },
  { courseId: "eng102-fall24", date: "2024-10-28", status: "present" },
  { courseId: "eng102-fall24", date: "2024-10-30", status: "present" },
  { courseId: "eng102-fall24", date: "2024-11-04", status: "present" },
  { courseId: "eng102-fall24", date: "2024-11-06", status: "present" },
  { courseId: "eng102-fall24", date: "2024-11-11", status: "present" },
  { courseId: "eng102-fall24", date: "2024-11-13", status: "present" },
  { courseId: "eng102-fall24", date: "2024-11-18", status: "present" },
  { courseId: "eng102-fall24", date: "2024-11-20", status: "absent" },
  { courseId: "eng102-fall24", date: "2024-12-02", status: "present" },
  { courseId: "eng102-fall24", date: "2024-12-04", status: "present" },
  { courseId: "eng102-fall24", date: "2024-12-09", status: "present" },
  { courseId: "eng102-fall24", date: "2024-12-11", status: "present" },

  // PHYS 101 - TRF (48 classes total) - 3 absences
  { courseId: "phys101-fall24", date: "2024-08-27", status: "present" },
  { courseId: "phys101-fall24", date: "2024-08-29", status: "present" },
  { courseId: "phys101-fall24", date: "2024-08-30", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-03", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-05", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-06", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-10", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-12", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-13", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-17", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-19", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-20", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-24", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-26", status: "present" },
  { courseId: "phys101-fall24", date: "2024-09-27", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-01", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-03", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-04", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-08", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-10", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-11", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-15", status: "absent" },
  { courseId: "phys101-fall24", date: "2024-10-17", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-18", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-22", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-24", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-25", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-29", status: "present" },
  { courseId: "phys101-fall24", date: "2024-10-31", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-01", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-05", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-07", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-08", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-12", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-14", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-15", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-19", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-21", status: "present" },
  { courseId: "phys101-fall24", date: "2024-11-22", status: "present" },
  { courseId: "phys101-fall24", date: "2024-12-03", status: "present" },
  { courseId: "phys101-fall24", date: "2024-12-05", status: "absent" },
  { courseId: "phys101-fall24", date: "2024-12-06", status: "present" },
  { courseId: "phys101-fall24", date: "2024-12-10", status: "present" },
  { courseId: "phys101-fall24", date: "2024-12-12", status: "absent" },
  { courseId: "phys101-fall24", date: "2024-12-13", status: "present" },

  // Spring 2025 Attendance - Good with some strategic absences (Jan 15 - May 15, 2025)
  // CS 201 - MWF + Lab (48 classes) - 2 absences
  { courseId: "cs201-spring25", date: "2025-01-15", status: "present" },
  { courseId: "cs201-spring25", date: "2025-01-17", status: "present" },
  { courseId: "cs201-spring25", date: "2025-01-20", status: "present" },
  { courseId: "cs201-spring25", date: "2025-01-22", status: "present" },
  { courseId: "cs201-spring25", date: "2025-01-24", status: "present" },
  { courseId: "cs201-spring25", date: "2025-01-27", status: "present" },
  { courseId: "cs201-spring25", date: "2025-01-29", status: "present" },
  { courseId: "cs201-spring25", date: "2025-01-31", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-03", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-05", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-07", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-10", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-12", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-14", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-19", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-21", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-24", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-26", status: "present" },
  { courseId: "cs201-spring25", date: "2025-02-28", status: "present" },
  { courseId: "cs201-spring25", date: "2025-03-03", status: "present" },
  { courseId: "cs201-spring25", date: "2025-03-05", status: "present" },
  { courseId: "cs201-spring25", date: "2025-03-07", status: "present" },
  { courseId: "cs201-spring25", date: "2025-03-10", status: "absent" },
  { courseId: "cs201-spring25", date: "2025-03-12", status: "present" },
  { courseId: "cs201-spring25", date: "2025-03-14", status: "present" },
  { courseId: "cs201-spring25", date: "2025-03-24", status: "present" },
  { courseId: "cs201-spring25", date: "2025-03-26", status: "present" },
  { courseId: "cs201-spring25", date: "2025-03-28", status: "present" },
  { courseId: "cs201-spring25", date: "2025-03-31", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-02", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-04", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-07", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-09", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-11", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-14", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-16", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-18", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-21", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-23", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-25", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-28", status: "present" },
  { courseId: "cs201-spring25", date: "2025-04-30", status: "present" },
  { courseId: "cs201-spring25", date: "2025-05-02", status: "absent" },
  { courseId: "cs201-spring25", date: "2025-05-05", status: "present" },
  { courseId: "cs201-spring25", date: "2025-05-07", status: "present" },
  { courseId: "cs201-spring25", date: "2025-05-09", status: "present" },
  { courseId: "cs201-spring25", date: "2025-05-12", status: "present" },
  { courseId: "cs201-spring25", date: "2025-05-14", status: "present" },

  // Summer 2025 Attendance - Intensive summer courses (June 1 - Sept 30, 2025)
  // CS 301 - MWF (52 classes) - 1 absence
  { courseId: "cs301-summer25", date: "2025-06-02", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-04", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-06", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-09", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-11", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-13", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-16", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-18", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-20", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-23", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-25", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-27", status: "present" },
  { courseId: "cs301-summer25", date: "2025-06-30", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-02", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-07", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-09", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-11", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-14", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-16", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-18", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-21", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-23", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-25", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-28", status: "present" },
  { courseId: "cs301-summer25", date: "2025-07-30", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-01", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-04", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-06", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-08", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-11", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-13", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-15", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-18", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-20", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-22", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-25", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-27", status: "present" },
  { courseId: "cs301-summer25", date: "2025-08-29", status: "present" },
  { courseId: "cs301-summer25", date: "2025-09-01", status: "present" },
  { courseId: "cs301-summer25", date: "2025-09-03", status: "present" },
  { courseId: "cs301-summer25", date: "2025-09-05", status: "absent" },

  // Fall 2025 Current Attendance - Ongoing (Aug 25 - present)
  // CS 401 - MWF (10 classes so far) - Perfect attendance
  { courseId: "cs401-fall25", date: "2025-08-25", status: "present" },
  { courseId: "cs401-fall25", date: "2025-08-27", status: "present" },
  { courseId: "cs401-fall25", date: "2025-08-29", status: "present" },
  { courseId: "cs401-fall25", date: "2025-09-02", status: "present" },
  { courseId: "cs401-fall25", date: "2025-09-04", status: "present" },

  // CS 450 - TR (8 classes so far) - Perfect attendance
  { courseId: "cs450-fall25", date: "2025-08-26", status: "present" },
  { courseId: "cs450-fall25", date: "2025-08-28", status: "present" },
  { courseId: "cs450-fall25", date: "2025-09-03", status: "present" },
  { courseId: "cs450-fall25", date: "2025-09-05", status: "present" }
]

export const DEMO_STUDY_SESSIONS = [
  // Fall 2024 Study Sessions (August - December 2024) - Building consistent habits
  { id: "study-1", date: "2024-08-26", duration: 90, subject: "CS 101", type: "orientation", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-2", date: "2024-08-27", duration: 120, subject: "MATH 201", type: "homework", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-3", date: "2024-08-28", duration: 75, subject: "ENG 102", type: "reading", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-4", date: "2024-08-29", duration: 105, subject: "PHYS 101", type: "study", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-5", date: "2024-08-30", duration: 135, subject: "CS 101", type: "lab_prep", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-6", date: "2024-09-01", duration: 90, subject: "MATH 201", type: "homework", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-7", date: "2024-09-02", duration: 60, subject: "ENG 102", type: "essay", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-8", date: "2024-09-03", duration: 150, subject: "PHYS 101", type: "lab_prep", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-9", date: "2024-09-04", duration: 120, subject: "CS 101", type: "programming", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-10", date: "2024-09-05", duration: 90, subject: "MATH 201", type: "study", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-11", date: "2024-09-06", duration: 105, subject: "ENG 102", type: "writing", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-12", date: "2024-09-07", duration: 75, subject: "PHYS 101", type: "review", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-13", date: "2024-09-08", duration: 180, subject: "CS 101", type: "project", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-14", date: "2024-09-09", duration: 90, subject: "MATH 201", type: "homework", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-15", date: "2024-09-10", duration: 120, subject: "ENG 102", type: "research", yearId: "demo-year-1", termId: "fall-2024" },
  
  // Continuing daily study pattern through Fall 2024...
  { id: "study-16", date: "2024-09-11", duration: 135, subject: "PHYS 101", type: "homework", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-17", date: "2024-09-12", duration: 90, subject: "CS 101", type: "study", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-18", date: "2024-09-13", duration: 105, subject: "MATH 201", type: "review", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-19", date: "2024-09-14", duration: 75, subject: "ENG 102", type: "editing", yearId: "demo-year-1", termId: "fall-2024" },
  { id: "study-20", date: "2024-09-15", duration: 120, subject: "PHYS 101", type: "lab_prep", yearId: "demo-year-1", termId: "fall-2024" },
  
  // Spring 2025 Study Sessions (January - May 2025) - Advanced coursework
  { id: "study-80", date: "2025-01-15", duration: 150, subject: "CS 201", type: "programming", yearId: "demo-year-1", termId: "spring-2025" },
  { id: "study-81", date: "2025-01-16", duration: 120, subject: "MATH 301", type: "homework", yearId: "demo-year-1", termId: "spring-2025" },
  { id: "study-82", date: "2025-01-17", duration: 90, subject: "STAT 201", type: "study", yearId: "demo-year-1", termId: "spring-2025" },
  { id: "study-83", date: "2025-01-18", duration: 135, subject: "PHYS 201", type: "lab_prep", yearId: "demo-year-1", termId: "spring-2025" },
  { id: "study-84", date: "2025-01-19", duration: 105, subject: "CS 250", type: "assembly", yearId: "demo-year-1", termId: "spring-2025" },
  { id: "study-85", date: "2025-01-20", duration: 180, subject: "CS 201", type: "project", yearId: "demo-year-1", termId: "spring-2025" },
  
  // Summer 2025 Study Sessions (June - September 2025) - Intensive summer courses
  { id: "study-160", date: "2025-06-01", duration: 240, subject: "CS 301", type: "project_planning", yearId: "demo-year-1", termId: "summer-2025" },
  { id: "study-161", date: "2025-06-02", duration: 180, subject: "CS 310", type: "database_design", yearId: "demo-year-1", termId: "summer-2025" },
  { id: "study-162", date: "2025-06-03", duration: 150, subject: "MATH 350", type: "discrete_math", yearId: "demo-year-1", termId: "summer-2025" },
  { id: "study-163", date: "2025-06-04", duration: 120, subject: "PSYC 101", type: "reading", yearId: "demo-year-1", termId: "summer-2025" },
  { id: "study-164", date: "2025-06-05", duration: 210, subject: "CS 301", type: "coding", yearId: "demo-year-1", termId: "summer-2025" },
  
  // Fall 2025 Study Sessions (August - September 2025) - Current term
  { id: "study-320", date: "2025-08-25", duration: 180, subject: "CS 401", type: "algorithms", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-321", date: "2025-08-26", duration: 150, subject: "CS 450", type: "database_optimization", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-322", date: "2025-08-27", duration: 120, subject: "CS 480", type: "software_engineering", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-323", date: "2025-08-28", duration: 135, subject: "CS 470", type: "machine_learning", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-324", date: "2025-08-29", duration: 90, subject: "ENG 301", type: "technical_writing", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-325", date: "2025-08-30", duration: 165, subject: "CS 401", type: "homework", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-326", date: "2025-08-31", duration: 120, subject: "CS 450", type: "project", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-327", date: "2025-09-01", duration: 180, subject: "CS 480", type: "group_project", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-328", date: "2025-09-02", duration: 90, subject: "CS 470", type: "lab", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-329", date: "2025-09-03", duration: 105, subject: "ENG 301", type: "documentation", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-330", date: "2025-09-04", duration: 195, subject: "CS 401", type: "exam_prep", yearId: "demo-year-2", termId: "fall-2025" },
  { id: "study-331", date: "2025-09-05", duration: 150, subject: "CS 450", type: "assignment", yearId: "demo-year-2", termId: "fall-2025" }
]

export const DEMO_GAMIFICATION_DATA = {
  stats: {
    level: 45,
    xp: 22500,
    nextLevelXp: 23000,
    totalXp: 22500,
    streakDays: 112,
    longestStreak: 135,
    tasksCompleted: 87,
    tasksCompletedEarly: 64,
    studyHours: 285.5,
    scheduleBlocksCompleted: 450,
    perfectWeeks: 18,
    classesAttended: 312,
    attendanceStreak: 28,
    longestAttendanceStreak: 45,
    lastActiveDate: "2025-09-05"
  },
  badges: [
    {
      id: 'first_task' as const,
      name: 'Getting Started',
      description: 'Complete your first task',
      icon: '🎯',
      rarity: 'common' as const,
      unlocked: true,
      unlockedAt: '2024-08-26',
      maxProgress: 1,
      progress: 1
    },
    {
      id: 'task_streak' as const,
      name: 'Task Master',
      description: 'Complete 10 tasks in a row',
      icon: '⚡',
      rarity: 'rare' as const,
      unlocked: true,
      unlockedAt: '2024-09-15',
      maxProgress: 10,
      progress: 10
    },
    {
      id: 'early_bird' as const,
      name: 'Early Bird',
      description: 'Complete 5 tasks before their due date',
      icon: '🌅',
      rarity: 'common' as const,
      unlocked: true,
      unlockedAt: '2024-09-10',
      maxProgress: 5,
      progress: 5
    },
    {
      id: 'study_warrior' as const,
      name: 'Study Warrior',
      description: 'Study for 25+ hours in a week',
      icon: '⚔️',
      rarity: 'rare' as const,
      unlocked: true,
      unlockedAt: '2024-11-15',
      maxProgress: 25,
      progress: 25
    },
    {
      id: 'first_class' as const,
      name: 'First Class',
      description: 'Attend your first class',
      icon: '📚',
      rarity: 'common' as const,
      unlocked: true,
      unlockedAt: '2024-08-26',
      maxProgress: 1,
      progress: 1
    },
    {
      id: 'attendance_streak' as const,
      name: 'Attendance Streak',
      description: 'Attend 10 classes in a row',
      icon: '📈',
      rarity: 'rare' as const,
      unlocked: true,
      unlockedAt: '2024-09-20',
      maxProgress: 10,
      progress: 10
    },
    {
      id: 'perfect_attendance' as const,
      name: 'Perfect Attendance',
      description: 'Perfect attendance for one month',
      icon: '🌟',
      rarity: 'epic' as const,
      unlocked: true,
      unlockedAt: '2024-09-30',
      maxProgress: 1,
      progress: 1
    }
  ],
  dailyQuests: [
    {
      id: 'daily_study',
      title: 'Study for 1 hour',
      description: 'Complete a focused study session',
      type: 'study' as const,
      target: 1,
      progress: 1,
      completed: true,
      xpReward: 25,
      date: '2025-09-05'
    },
    {
      id: 'daily_task',
      title: 'Complete 1 task',
      description: 'Finish an assignment or homework',
      type: 'task' as const,
      target: 1,
      progress: 0,
      completed: false,
      xpReward: 30,
      date: '2025-09-05'
    },
    {
      id: 'daily_attendance',
      title: 'Attend all classes',
      description: 'Show up to all scheduled classes',
      type: 'academic' as const,
      target: 1,
      progress: 1,
      completed: true,
      xpReward: 20,
      date: '2025-09-05'
    }
  ]
}

export const DEMO_TEXTBOOKS = [
  {
    id: "textbook-1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262033848",
    courseCode: "CS 201",
    price: 89.99,
    condition: "Good",
    yearPurchased: 2025,
    notes: "Essential for data structures course"
  },
  {
    id: "textbook-2",
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    isbn: "978-1285741550",
    courseCode: "MATH 201",
    price: 125.50,
    condition: "Like New",
    yearPurchased: 2024,
    notes: "Used for Calc II and will use for Calc III"
  },
  {
    id: "textbook-3",
    title: "University Physics with Modern Physics",
    author: "Hugh D. Young",
    isbn: "978-0321973610",
    courseCode: "PHYS 201",
    price: 145.00,
    condition: "Good",
    yearPurchased: 2024,
    notes: "Comprehensive physics textbook"
  }
]

export const DEMO_SCHOLARSHIPS = [
  {
    id: "scholarship-1",
    name: "STEM Excellence Scholarship",
    amount: 2500,
    deadline: "2025-03-15",
    requirements: "3.5 GPA minimum, STEM major",
    status: "applied",
    applicationDate: "2025-02-01",
    notes: "Strong application submitted with research project"
  },
  {
    id: "scholarship-2",
    name: "Dean's Academic Achievement Award",
    amount: 1000,
    deadline: "2025-04-01",
    requirements: "3.8 GPA, leadership experience",
    status: "researching",
    notes: "Need to gather leadership experience documentation"
  },
  {
    id: "scholarship-3",
    name: "Computer Science Department Scholarship",
    amount: 1500,
    deadline: "2025-02-28",
    requirements: "CS major, financial need",
    status: "awarded",
    applicationDate: "2024-12-15",
    awardDate: "2025-01-15",
    notes: "Received award for Spring 2025 semester!"
  }
]

// Academic Plan Demo Data
export const DEMO_ACADEMIC_PLAN = [
  {
    id: "demo-year-1",
    label: "AY 2024–2025",
    terms: [
      {
        id: "fall-2024",
        name: "Fall 2024",
        courses: [
          {
            id: "course-1",
            code: "CS 101",
            name: "Introduction to Computer Science",
            section: "A",
            credits: 3,
            gpa: 4.0
          },
          {
            id: "course-2",
            code: "MATH 201",
            name: "Calculus II",
            section: "B",
            credits: 4,
            gpa: 3.7
          },
          {
            id: "course-3",
            code: "ENG 102",
            name: "English Composition",
            section: "C",
            credits: 3,
            gpa: 3.8
          },
          {
            id: "course-4",
            code: "PHYS 101",
            name: "General Physics I",
            section: "A",
            credits: 4,
            gpa: 3.5
          },
          {
            id: "course-5",
            code: "HIST 110",
            name: "World History",
            section: "B",
            credits: 3,
            gpa: 3.9
          },
          {
            id: "blank-1",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-2",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-3",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          }
        ]
      },
      {
        id: "spring-2025",
        name: "Spring 2025",
        courses: [
          {
            id: "course-6",
            code: "CS 201",
            name: "Data Structures & Algorithms",
            section: "A",
            credits: 4,
            gpa: 3.8
          },
          {
            id: "course-7",
            code: "MATH 301",
            name: "Linear Algebra",
            section: "A",
            credits: 3,
            gpa: 3.6
          },
          {
            id: "course-8",
            code: "STAT 201",
            name: "Statistics",
            section: "B",
            credits: 3,
            gpa: 3.7
          },
          {
            id: "course-9",
            code: "CS 250",
            name: "Computer Organization",
            section: "A",
            credits: 4,
            gpa: 3.4
          },
          {
            id: "course-10",
            code: "PHIL 101",
            name: "Introduction to Philosophy",
            section: "C",
            credits: 3,
            gpa: 4.0
          },
          {
            id: "blank-4",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-5",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-6",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          }
        ]
      },
      {
        id: "summer-2025",
        name: "Summer 2025",
        courses: [
          {
            id: "course-11",
            code: "CS 301",
            name: "Software Engineering",
            section: "A",
            credits: 4,
            gpa: 3.9
          },
          {
            id: "course-12",
            code: "CS 310",
            name: "Database Systems",
            section: "B",
            credits: 3,
            gpa: 3.8
          },
          {
            id: "course-13",
            code: "MATH 350",
            name: "Discrete Mathematics",
            section: "A",
            credits: 3,
            gpa: 3.6
          },
          {
            id: "course-14",
            code: "PSYC 101",
            name: "Introduction to Psychology",
            section: "C",
            credits: 3,
            gpa: 3.7
          },
          {
            id: "blank-7",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-8",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-9",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-10",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          }
        ]
      }
    ]
  },
  {
    id: "demo-year-2",
    label: "AY 2025–2026",
    terms: [
      {
        id: "fall-2025",
        name: "Fall 2025",
        courses: [
          {
            id: "course-15",
            code: "CS 401",
            name: "Advanced Algorithms",
            section: "A",
            credits: 4,
            gpa: undefined
          },
          {
            id: "course-16",
            code: "CS 450",
            name: "Database Systems",
            section: "B",
            credits: 3,
            gpa: undefined
          },
          {
            id: "course-17",
            code: "CS 480",
            name: "Software Engineering",
            section: "A",
            credits: 4,
            gpa: undefined
          },
          {
            id: "course-18",
            code: "CS 470",
            name: "Machine Learning",
            section: "A",
            credits: 3,
            gpa: undefined
          },
          {
            id: "course-19",
            code: "ENG 301",
            name: "Technical Writing",
            section: "B",
            credits: 3,
            gpa: undefined
          },
          {
            id: "blank-11",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-12",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-13",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          }
        ]
      },
      {
        id: "spring-2026",
        name: "Spring 2026",
        courses: [
          {
            id: "blank-14",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-15",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-16",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-17",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-18",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-19",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-20",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          },
          {
            id: "blank-21",
            code: "",
            name: "",
            section: "",
            credits: 0,
            gpa: undefined
          }
        ]
      }
    ]
  }
]
