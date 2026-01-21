import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Information from "@/lib/models/Information";
import InformationRow from "@/lib/models/InformationRow";
import { generateCSV } from "@/lib/csvGenerator";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const information = await Information.findById(id);
    if (!information) {
      return new NextResponse("Information not found", { status: 404 });
    }

    const rows = await InformationRow.find({ informationId: id }).sort({ createdAt: 1 });

    // Generate CSV
    const csvData = rows.map(row => row.data);
    const csvContent = generateCSV(information.columns, csvData);

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${information.title}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
