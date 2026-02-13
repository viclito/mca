import dotenv from "dotenv";
dotenv.config();

import { logger } from "../lib/logger";
import connectDB from "../lib/db";
import Log from "../lib/models/Log";

async function testLogging() {
  console.log("Starting logging test...");

  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    // clear existing logs for clean test (optional, maybe not for prod)
    // await Log.deleteMany({}); 

    console.log("Creating test logs...");
    await logger.info("Test Info Log", { details: { test: true, timestamp: new Date() } });
    await logger.warn("Test Warning Log", { path: "/test-script", details: { foo: "bar" } });
    await logger.error("Test Error Log", { 
        details: { error: "Simulated error" }, 
        user: "000000000000000000000000" // Dummy ID
    });

    console.log("Logs created. Fetching logs to verify...");

    // Allow some time for async writes if any
    await new Promise(resolve => setTimeout(resolve, 1000));

    const logs = await Log.find({ "details.test": true }).sort({ timestamp: -1 }).limit(1).lean();
    
    if (logs.length > 0) {
        console.log("✅ Verification SUCCESS: Found test log in database.");
        console.log(logs[0]);
    } else {
        console.error("❌ Verification FAILED: Could not find test log.");
    }
    
    process.exit(0);

  } catch (error) {
    console.error("❌ Verification FAILED with error:", error);
    process.exit(1);
  }
}

testLogging();
