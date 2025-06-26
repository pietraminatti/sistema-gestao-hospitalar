export const ROUTING = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGET_PASSWORD: "/forgot-password", // New route for forgot password

  // Role root paths
  ADMIN: "/admin",
  FUNCIONARIO: "/doctor",
  PACIENTE: "/patient",

  // Admin routes (nested under /admin)
  DASHBOARD: "dashboard",
  USERS: "users",
  DOCTORS: "doctors",
  PRICES: "prices", // Add new route for prices
  SHIFTS: "shifts",
  CANCEL_APPOINTMENT: "cancel-appointment",

  // Doctor routes (nested under /doctor)
  APPOINTMENTS: "appointments",
  SCHEDULE_DETAIL: "schedule/:scheduleId", // New route for appointment details
  PATIENTS: "patients",
  PROFILE: "profile",
  SCHEDULE: "schedule",
  CURRENT_SCHEDULE: "current-schedule",
  MEDICAL_RECORDS: "medical-records", // This will be used for both doctor and patient

  // Patient routes (nested under /patient)
  FIND_DOCTOR: "find-doctor",
  PATIENT_APPOINTMENT: "appointments",
  PATIENT_APPOINTMENT_DETAILS: "appointments/:appointmentId", // New route for patient appointment details
  BANK_ACCOUNT: "bank-account", // Thêm route mới để quản lý tài khoản ngân hàng
};
