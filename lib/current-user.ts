import { getUserById } from "@/lib/mock-queries";

const user = getUserById("user-001");

if (!user) {
  throw new Error("Current user not found.");
}

export const currentUser = user;



//  getUserById("user-001") // Michael admin 

//  getUserById("user-014") // Toby HR

//  getUserById("user-003") // Oscar manager

//  getUserById("user-006") // Jim employee
//  getUserById("user-007") // Pam employee
//  getUserById("user-005"); // Kevin  employee
