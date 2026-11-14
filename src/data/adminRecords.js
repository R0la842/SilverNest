// Sample data for the admin pages (matches the Figma screens). Replace with API calls later.
export const users = [
  { id: "U101", name: "Eleanor Brooks", email: "eleanor.b@email.com", role: "Senior", status: "Active", joined: "12 Sep 2026", phone: "(555) 014-2101", area: "Maplewood, 12 Cedar Lane" },
  { id: "U102", name: "Robert Wilson", email: "robert.w@email.com", role: "Senior", status: "Active", joined: "14 Sep 2026", phone: "(555) 014-2102", area: "Maplewood, 24 Oak Street" },
  { id: "U103", name: "Laura Brooks", email: "laura.b@email.com", role: "Caregiver", status: "Active", joined: "15 Sep 2026", phone: "(555) 014-2103", area: "Maplewood, 12 Cedar Lane" },
  { id: "U104", name: "Helen Thompson", email: "helen.t@email.com", role: "Senior", status: "Active", joined: "18 Sep 2026", phone: "(555) 014-2104", area: "Riverside, 8 Elm Court" },
  { id: "U105", name: "Michael Davis", email: "michael.d@email.com", role: "Caregiver", status: "Blocked", joined: "22 Sep 2026", phone: "(555) 014-2105", area: "Riverside, 3 Pine Road" },
  { id: "U106", name: "Margaret Evans", email: "margaret.e@email.com", role: "Senior", status: "Deactivated", joined: "25 Sep 2026", phone: "(555) 014-2106", area: "Hillcrest, 41 Birch Lane" },
];

export const volunteers = [
  { id: "V201", name: "Sarah Chen", verification: "Verified", tasks: 12, rating: 4.9, completion: 86, status: "Active", area: "Maplewood", availability: "Weekday mornings", prefers: "Grocery shopping, pharmacy pickup" },
  { id: "V202", name: "James Patel", verification: "Verified", tasks: 9, rating: 4.8, completion: 90, status: "Active", area: "Riverside", availability: "Weekends", prefers: "Companionship walks" },
  { id: "V203", name: "Maria Garcia", verification: "Verified", tasks: 10, rating: 4.9, completion: 91, status: "Active", area: "Hillcrest", availability: "Weekday evenings", prefers: "Gardening help" },
  { id: "V204", name: "David Lee", verification: "Verified", tasks: 7, rating: 4.7, completion: 88, status: "Active", area: "Maplewood", availability: "Weekends", prefers: "Grocery shopping" },
  { id: "V205", name: "Olivia Reed", verification: "Pending review", tasks: 0, rating: null, completion: null, status: "Pending", area: "Maplewood", availability: "Weekday mornings", prefers: "Grocery shopping, pharmacy pickup" },
  { id: "V206", name: "Thomas Wright", verification: "Pending review", tasks: 0, rating: null, completion: null, status: "Pending", area: "Riverside", availability: "Weekends", prefers: "Light household chores" },
];

export const requests = [
  { id: "R001", type: "Grocery Shopping", senior: "Eleanor Brooks", volunteer: null, date: "10 Oct 2026", time: "10:00 AM", status: "Pending", address: "12 Cedar Lane, Maplewood", notes: "Weekly groceries, list provided." },
  { id: "R002", type: "Pharmacy Pickup", senior: "Robert Wilson", volunteer: "Sarah Chen", date: "10 Oct 2026", time: "11:00 AM", status: "Accepted", address: "24 Oak Street, Maplewood", notes: "Collect a sealed prescription from Maplewood Pharmacy." },
  { id: "R003", type: "Companionship Walk", senior: "Helen Thompson", volunteer: "James Patel", date: "09 Oct 2026", time: "2:00 PM", status: "In Progress", address: "8 Elm Court, Riverside", notes: "30-minute walk around the park." },
  { id: "R004", type: "Light Household Chores", senior: "Margaret Evans", volunteer: "Maria Garcia", date: "09 Oct 2026", time: "9:00 AM", status: "Completed", address: "41 Birch Lane, Hillcrest", notes: "Tidy the kitchen and change bed linen." },
  { id: "R005", type: "Grocery Shopping", senior: "Eleanor Brooks", volunteer: null, date: "08 Oct 2026", time: "10:30 AM", status: "Pending", address: "12 Cedar Lane, Maplewood", notes: "" },
  { id: "R006", type: "Pharmacy Pickup", senior: "Robert Wilson", volunteer: "Sarah Chen", date: "08 Oct 2026", time: "3:00 PM", status: "Cancelled", address: "24 Oak Street, Maplewood", notes: "", cancelReason: "Senior no longer needs assistance" },
];

export const issues = [
  { id: "I001", title: "Volunteer arrived late", reporter: "Robert Wilson", requestId: "R002", priority: "Medium", status: "In review", date: "10 Oct 2026", detail: "Sarah hasn't arrived yet. Pickup is scheduled for 11:00 AM." },
  { id: "I002", title: "Unable to edit request", reporter: "Laura Brooks", requestId: "R001", priority: "Low", status: "Open", date: "10 Oct 2026", detail: "The edit button does nothing on the request page." },
  { id: "I003", title: "Wrong address on visit", reporter: "Margaret Evans", requestId: "R004", priority: "High", status: "Escalated", date: "09 Oct 2026", detail: "The volunteer went to the wrong address." },
  { id: "I004", title: "Notification not received", reporter: "Margaret Evans", requestId: "R004", priority: "Low", status: "Resolved", date: "09 Oct 2026", detail: "No reminder arrived before the visit." },
  { id: "I005", title: "Pickup time confusion", reporter: "Robert Wilson", requestId: "R006", priority: "Low", status: "Resolved", date: "08 Oct 2026", detail: "Unsure which time slot was confirmed." },
  { id: "I006", title: "Volunteer profile photo missing", reporter: "Helen Thompson", requestId: "R003", priority: "Medium", status: "Open", date: "08 Oct 2026", detail: "Couldn't recognise the volunteer at the door." },
];
