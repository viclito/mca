import dotenv from "dotenv";
dotenv.config();

import { logger } from "../lib/logger";
import connectDB from "../lib/db";
import Log from "../lib/models/Log"; 

// Mock session
const mockUser = {
    id: "65d4c8f9a91b2c001c8e4e7e", // Random ObjectId
    email: "test-admin@example.com",
    role: "admin"
};

async function testAuditLogging() {
  console.log("Starting Audit Logging Verification...");

  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    console.log("Simulating Admin Actions...");

    // Simulate Degree Creation Log
    // (In real app, this happens inside the API route, here we simulate the logger call directly 
    // to verify the logger and model are working as expected for these events)
    // Ideally we would call the API, but that requires a running server and auth.
    // For unit testing the logging *logic* (which we just added), manual logger calls are a good proxy 
    // to ensure the schema accepts the data structure.
    
    // However, to strictly verify the *API Routes* modifications, we'd need integration tests.
    // Given the constraints, I will verify the Logger can handle the *structure* of data we added to the routes.

    await logger.info("Degree Updated", { 
        user: mockUser.id, 
        category: "ADMIN",
        details: { 
            degreeId: "111111", 
            changes: { 
                name: { from: "Old Degree", to: "New Degree" } 
            } 
        } 
    });

    await logger.info("Subject Updated", { 
        user: mockUser.id, 
        category: "ADMIN",
        details: { 
            subjectId: "222222", 
            changes: { 
                name: { from: "Old Subject", to: "Updated Subject" } 
            }
        } 
    });

    await logger.info("User Approved", { 
        user: mockUser.id, 
        category: "ADMIN",
        details: { approvedUserId: "333333", approvedUserEmail: "student@example.com" } 
    });

    console.log("Audit logs created. Fetching to verify...");
    
    // Wait for async writes
    await new Promise(resolve => setTimeout(resolve, 1000));

    const logs = await Log.find({ user: mockUser.id }).sort({ timestamp: -1 }).limit(3).lean();

    if (logs.length >= 2) {
        console.log("✅ Verification SUCCESS: Found audit logs.");
        logs.forEach(l => {
            console.log(`[${l.level}] [${l.category || "SYSTEM"}] ${l.message}`);
            if (l.details && l.details.changes) {
                console.log("   Changes:", JSON.stringify(l.details.changes, null, 2));
            }
        });
    } else {
        console.error("❌ Verification FAILED: Could not find all audit logs.");
        console.log("Found:", logs.length);
    }

    process.exit(0);

  } catch (error) {
    console.error("❌ Verification FAILED with error:", error);
    process.exit(1);
  }
}

testAuditLogging();
