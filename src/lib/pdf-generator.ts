import { LANG_MAP, TYPE_LABELS } from "./constants";

export async function generateAndDownloadPDF(analysis: any): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addText = (
    text: string,
    fontSize: number,
    isBold = false,
    color: [number, number, number] = [255, 255, 255],
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text || "", contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize * 0.4) + 4;
  };

  const checkNewPage = (needed = 20) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Dark background
  doc.setFillColor(8, 8, 16);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  // Header bar
  doc.setFillColor(109, 40, 217);
  doc.rect(0, 0, pageWidth, 12, "F");

  y = 25;

  // Title
  addText("InsightAI Analysis Report", 18, true, [255, 255, 255]);

  // Metadata row
  const inputType = TYPE_LABELS[analysis.input_type] || analysis.input_type;
  const language =
    LANG_MAP[analysis.output_language] || analysis.output_language;
  const date = analysis.created_at
    ? new Date(analysis.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  addText(`${inputType} · ${language} · ${date}`, 9, false, [150, 140, 180]);
  y += 4;

  // Document title
  if (analysis.title) {
    checkNewPage(16);
    addText(analysis.title, 14, true, [200, 180, 255]);
    y += 2;
  }

  // Summary
  if (analysis.summary) {
    checkNewPage(12);
    addText("SUMMARY", 8, true, [109, 40, 217]);
    y += 1;
    addText(analysis.summary, 10, false, [210, 210, 230]);
    y += 4;
  }

  // Key Findings
  const keyFindings: string[] =
    typeof analysis.key_findings === "string"
      ? JSON.parse(analysis.key_findings)
      : analysis.key_findings || [];

  if (keyFindings.length > 0) {
    checkNewPage(12);
    addText("KEY FINDINGS", 8, true, [109, 40, 217]);
    y += 1;
    for (const finding of keyFindings) {
      checkNewPage(10);
      addText(`• ${finding}`, 10, false, [210, 210, 230]);
    }
    y += 4;
  }

  // Sentiment
  if (analysis.sentiment) {
    checkNewPage(10);
    addText("SENTIMENT", 8, true, [109, 40, 217]);
    y += 1;
    const sentimentColor: [number, number, number] =
      analysis.sentiment === "positive"
        ? [74, 222, 128]
        : analysis.sentiment === "negative"
          ? [248, 113, 113]
          : [148, 163, 184];
    addText(
      analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1),
      10,
      true,
      sentimentColor,
    );
    y += 4;
  }

  // AI Insights
  if (analysis.ai_insights) {
    checkNewPage(12);
    addText("AI INSIGHTS", 8, true, [109, 40, 217]);
    y += 1;
    addText(analysis.ai_insights, 10, false, [210, 210, 230]);
    y += 4;
  }

  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(80, 70, 100);
    doc.text(
      `InsightAI · Page ${i} of ${totalPages}`,
      margin,
      doc.internal.pageSize.getHeight() - 8,
    );
  }

  const filename = (analysis.title || "analysis")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()
    .slice(0, 50);

  doc.save(`insightai_${filename}.pdf`);
}
