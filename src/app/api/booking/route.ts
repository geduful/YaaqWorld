import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, organization, service, eventDate, location, details, budget } = body;

    if (!name || !email || !phone || !service || !eventDate || !location || !details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Booking request received:", {
      name,
      email,
      phone,
      organization,
      service,
      eventDate,
      location,
      details,
      budget,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "Booking request received successfully", id: `BK-${Date.now()}` },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process booking request" },
      { status: 500 }
    );
  }
}