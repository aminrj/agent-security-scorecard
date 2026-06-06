import jsPDF from 'jspdf';
import type { AssessmentResult, Answers } from '../data/scoring';
import { BAND_COLORS } from '../data/scoring';
import { QUESTIONS, DOMAINS, ASI_DESCRIPTIONS } from '../data/questions';

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export async function generatePDF(
  result: AssessmentResult,
  answers: Answers,
  email: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const MARGIN = 18;
  const COL = W - MARGIN * 2;
  let y = 0;

  const bandColor = BAND_COLORS[result.global_band];
  const [br, bg, bb] = hexToRgb(bandColor);

  function checkPage(needed: number) {
    if (y + needed > 280) {
      doc.addPage();
      y = 18;
    }
  }

  function drawRect(x: number, yy: number, w: number, h: number, r: number, fillR: number, fillG: number, fillB: number) {
    doc.setFillColor(fillR, fillG, fillB);
    doc.roundedRect(x, yy, w, h, r, r, 'F');
  }

  // ── Cover ──────────────────────────────────────────────────────────────────
  doc.setFillColor(10, 11, 13);
  doc.rect(0, 0, W, 297, 'F');

  // Header accent
  drawRect(0, 0, W, 2, 0, br, bg, bb);

  y = 28;

  // Logo area
  doc.setFontSize(9);
  doc.setTextColor(99, 102, 241);
  doc.setFont('helvetica', 'bold');
  doc.text('AGENT SECURITY SCORECARD', MARGIN, y);

  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(79, 87, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Grounded in OWASP Top 10 for Agentic Applications 2026', MARGIN, y);

  y += 20;

  // Score
  doc.setFontSize(72);
  doc.setTextColor(br, bg, bb);
  doc.setFont('helvetica', 'bold');
  doc.text(`${result.global_score}`, MARGIN, y);

  const scoreW = doc.getTextWidth(`${result.global_score}`);
  doc.setFontSize(28);
  doc.setTextColor(79, 87, 105);
  doc.text('/100', MARGIN + scoreW + 2, y);

  y += 8;

  // Band badge
  drawRect(MARGIN, y, 28, 7, 2, br, bg, bb);
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(result.global_band.toUpperCase(), MARGIN + 4, y + 5);

  y += 14;

  // Archetype
  doc.setFontSize(24);
  doc.setTextColor(240, 242, 248);
  doc.setFont('helvetica', 'bold');
  doc.text(result.archetype, MARGIN, y);

  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(136, 146, 164);
  doc.setFont('helvetica', 'normal');
  const subtitleLines = doc.splitTextToSize(result.archetype_subtitle, COL);
  doc.text(subtitleLines, MARGIN, y);
  y += subtitleLines.length * 6 + 8;

  // Divider
  doc.setDrawColor(30, 33, 48);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 10;

  // Domain scores
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(240, 242, 248);
  doc.text('DOMAIN SCORES', MARGIN, y);
  y += 8;

  result.domain_results.forEach((dr) => {
    const domain = DOMAINS.find((d) => d.id === dr.domain_id)!;
    const [dr_r, dr_g, dr_b] = hexToRgb(domain.color);
    const [bc_r, bc_g, bc_b] = hexToRgb(BAND_COLORS[dr.band]);

    checkPage(12);

    doc.setFontSize(9);
    doc.setTextColor(136, 146, 164);
    doc.setFont('helvetica', 'normal');
    doc.text(`${dr.domain_id}. ${domain.shortName}`, MARGIN, y);

    // Score
    doc.setTextColor(bc_r, bc_g, bc_b);
    doc.setFont('helvetica', 'bold');
    doc.text(`${dr.normalized}/100`, W - MARGIN - 22, y);

    // Band
    doc.setFontSize(7);
    doc.setTextColor(bc_r, bc_g, bc_b);
    doc.text(dr.band, W - MARGIN - 8, y);

    y += 4;

    // Bar
    const barW = COL - 40;
    doc.setFillColor(30, 33, 48);
    doc.roundedRect(MARGIN, y, barW, 3, 1, 1, 'F');
    doc.setFillColor(dr_r, dr_g, dr_b);
    doc.roundedRect(MARGIN, y, Math.max(2, barW * (dr.normalized / 100)), 3, 1, 1, 'F');

    // Target marker
    doc.setDrawColor(99, 102, 241);
    const targetX = MARGIN + barW * 0.76;
    doc.line(targetX, y - 1, targetX, y + 4);

    y += 8;
  });

  y += 6;

  // Email
  doc.setFontSize(8);
  doc.setTextColor(79, 87, 105);
  doc.text(`Prepared for: ${email}`, MARGIN, y);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, y + 5);

  // ── Page 2: Top 3 Risks ───────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(10, 11, 13);
  doc.rect(0, 0, W, 297, 'F');
  drawRect(0, 0, W, 2, 0, 99, 102, 241);
  y = 18;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(240, 242, 248);
  doc.text('Your Three Biggest Risks', MARGIN, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(136, 146, 164);
  doc.text('Ranked by score gap. Fix these first.', MARGIN, y);
  y += 10;

  result.top3_risks.forEach((risk, i) => {
    const score = risk.value === 'na' ? 0 : risk.value;
    const domain = DOMAINS.find((d) => d.id === risk.question.domain_id)!;
    const [dc_r, dc_g, dc_b] = hexToRgb(domain.color);
    const asiName = ASI_DESCRIPTIONS[risk.question.asi_ref] ?? risk.question.asi_ref;

    checkPage(60);

    // Risk header
    drawRect(MARGIN, y, COL, 10, 2, 22, 25, 38);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(dc_r, dc_g, dc_b);
    doc.text(`#${i + 1}`, MARGIN + 4, y + 6.5);

    doc.setTextColor(240, 242, 248);
    doc.text(`${risk.question.asi_ref} — ${asiName}`, MARGIN + 12, y + 6.5);

    doc.setTextColor(dc_r, dc_g, dc_b);
    doc.text(`Level ${score}/3`, W - MARGIN - 14, y + 6.5);

    y += 14;

    // Question
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(240, 242, 248);
    const qLines = doc.splitTextToSize(risk.question.text, COL);
    doc.text(qLines, MARGIN, y);
    y += qLines.length * 5 + 6;

    // Why it matters
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('WHY IT MATTERS', MARGIN, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(136, 146, 164);
    const whyLines = doc.splitTextToSize(risk.question.why_it_matters, COL);
    checkPage(whyLines.length * 4 + 8);
    doc.text(whyLines, MARGIN, y);
    y += whyLines.length * 4 + 6;

    // First action
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text('FIRST ACTION THIS WEEK', MARGIN, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(136, 146, 164);
    const actionLines = doc.splitTextToSize(risk.question.first_action, COL);
    checkPage(actionLines.length * 4 + 8);
    doc.text(actionLines, MARGIN, y);
    y += actionLines.length * 4 + 6;

    // Verify
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('HOW TO VERIFY', MARGIN, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(136, 146, 164);
    const verifyLines = doc.splitTextToSize(risk.question.how_to_verify, COL);
    checkPage(verifyLines.length * 4 + 10);
    doc.text(verifyLines, MARGIN, y);
    y += verifyLines.length * 4 + 12;

    // Divider
    doc.setDrawColor(30, 33, 48);
    doc.line(MARGIN, y, W - MARGIN, y);
    y += 10;
  });

  // ── Page 3+: Full Q&A ─────────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(10, 11, 13);
  doc.rect(0, 0, W, 297, 'F');
  drawRect(0, 0, W, 2, 0, 99, 102, 241);
  y = 18;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(240, 242, 248);
  doc.text('Full Assessment — All 20 Answers', MARGIN, y);
  y += 12;

  DOMAINS.forEach((domain) => {
    const domainQs = QUESTIONS.filter((q) => q.domain_id === domain.id);
    const [dc_r, dc_g, dc_b] = hexToRgb(domain.color);

    checkPage(20);

    // Domain header
    drawRect(MARGIN, y, COL, 10, 2, 22, 25, 38);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(dc_r, dc_g, dc_b);
    doc.text(`${domain.id} — ${domain.name}`, MARGIN + 4, y + 6.5);

    const dr = result.domain_results.find((r) => r.domain_id === domain.id)!;
    doc.setTextColor(BAND_COLORS[dr.band] === '#22c55e' ? 34 : 240,
      BAND_COLORS[dr.band] === '#22c55e' ? 197 : 242,
      BAND_COLORS[dr.band] === '#22c55e' ? 94 : 248);
    doc.text(`${dr.normalized}/100 · ${dr.band}`, W - MARGIN - 28, y + 6.5);
    y += 14;

    domainQs.forEach((q, qi) => {
      const answerVal = answers[q.id] ?? 0;
      const score = answerVal === 'na' ? 'N/A' : `${answerVal}/3`;
      const label = answerVal === 'na' ? q.na_label : q.scale_labels[answerVal as number];

      checkPage(20);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(dc_r, dc_g, dc_b);
      doc.text(`Q${qi + 1}`, MARGIN, y);
      doc.setTextColor(240, 242, 248);
      const qLines = doc.splitTextToSize(q.text, COL - 12);
      doc.text(qLines, MARGIN + 7, y);
      y += qLines.length * 4 + 3;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(136, 146, 164);
      const labelLines = doc.splitTextToSize(`Answer: ${score} — ${label}`, COL);
      checkPage(labelLines.length * 4 + 6);
      doc.text(labelLines, MARGIN + 7, y);
      y += labelLines.length * 4 + 6;
    });

    y += 4;
  });

  // ── Footer on all pages ───────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(79, 87, 105);
    doc.text(
      'Agent Security Scorecard · OWASP Top 10 for Agentic Applications 2026 · All scoring client-side',
      MARGIN,
      290
    );
    doc.text(`Page ${i} of ${totalPages}`, W - MARGIN - 16, 290);
  }

  doc.save(`agent-security-scorecard-${result.global_score}.pdf`);
}
