import { getUserById } from "@/lib/mock-queries";

export const currentUser = getUserById("user-014");

if (!currentUser) {
  throw new Error("Current user not found.");
}


//  getUserById("user-006") // Jim employee
//  getUserById("user-014") // Toby HR
//  getUserById("user-003") // Oscar manager
//  getUserById("user-001") // Michael admin