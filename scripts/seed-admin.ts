
// scripts/seed-admin.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { hashPassword } from '@/lib/auth';
import Agent from "@/app/models/Agent";
import { connectDB } from "@/lib/db";
import logger from '@/lib/utils/logger';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "aarif568khan@gmail.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "henrySmith@123";

async function seedAdmin() {

        console.log("seed admin before")
    try {
        await connectDB()
        console.log("seed admin after")

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            logger.warn(
                "Admin email or password not set in environment variables."
            );
            return
        }
        
        const existingAdmin = await Agent.findOne({ email: ADMIN_EMAIL })
        if (existingAdmin) {
            logger.info("Admin already exists, skipping seed", { email: ADMIN_EMAIL });
            process.exit(0);
        }

        const hashedPassword = await hashPassword(ADMIN_PASSWORD)

        const admin = Agent.create({
            name: "Henry Smith",
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: "SuperAdmin",
            isAllowed: true
        })

        logger.info("✅ First SuperAdmin created successfully"
            // , {
            //     adminId: admin._id.toString(),
            //     email: admin.email,
            // }
        );

        console.log("\n🎉 Seed completed!");
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD} (CHANGE THIS IMMEDIATELY)`);

        process.exit(0);
    } catch {
        logger.error("Seed script failed"
        //     , {
        //     error: error instanceof Error ? error.message : String(error),
        // }
    );
        process.exit(1);
    }
}

seedAdmin()