import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the absolute path to our simple JSON "database"
const dataFilePath = path.join(process.cwd(), 'data', 'content.json');

export async function GET() {
    try {
        // Check if the file exists
        if (!fs.existsSync(dataFilePath)) {
            return NextResponse.json({ error: "Database file not found." }, { status: 404 });
        }

        // Read and parse the JSON file
        const fileContents = fs.readFileSync(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading content:", error);
        return NextResponse.json({ error: "Failed to read content data." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Basic protection: Ensure content-type is JSON
        if (request.headers.get("content-type") !== "application/json") {
            return NextResponse.json({ error: "Invalid Content-Type" }, { status: 400 });
        }

        const newContent = await request.json();

        // 1. We could add authentication verification here using cookies or tokens,
        // ensuring ONLY the admin can POST data.

        // 2. Safely stringify the incoming updated payload
        const updatedJson = JSON.stringify(newContent, null, 2);

        // 3. Write it back to the file system to persist the changes
        fs.writeFileSync(dataFilePath, updatedJson, 'utf8');

        return NextResponse.json({ success: true, message: "Content updated successfully!" });
    } catch (error) {
        console.error("Error writing content:", error);
        return NextResponse.json({ error: "Failed to update content data." }, { status: 500 });
    }
}
