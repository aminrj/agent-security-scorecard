import type { AssessmentResult, Answers } from '../data/scoring';
import { BAND_COLORS, CTA_BOOKING_URL, CTA_NEWSLETTER_URL, getTop3DomainTheme } from '../data/scoring';
import { QUESTIONS, DOMAINS, ASI_DESCRIPTIONS } from '../data/questions';

// Molntek report palette — printable, white background
const C = {
  white:    [255, 255, 255] as [number, number, number],
  page:     [250, 250, 250] as [number, number, number],  // very faint off-white
  ink:      [26,  26,  26]  as [number, number, number],  // #1A1A1A
  inksoft:  [90,  90,  90]  as [number, number, number],  // #5A5A5A
  rule:     [191, 191, 191] as [number, number, number],  // #BFBFBF
  accent:   [200, 85,  61]  as [number, number, number],  // #C8553D terracotta
  codbg:    [239, 239, 239] as [number, number, number],  // #EFEFEF
  rowalt:   [245, 245, 245] as [number, number, number],  // alternating row
};

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

async function loadFont(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function generatePDF(
  result: AssessmentResult,
  answers: Answers,
  email: string
): Promise<void> {
  const [{ default: jsPDF }, fontRegular, fontBold] = await Promise.all([
    import('jspdf'),
    loadFont('/fonts/JetBrainsMono-Regular.ttf'),
    loadFont('/fonts/JetBrainsMono-Bold.ttf'),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const MARGIN = 20;
  const COL = W - MARGIN * 2;
  let y = 0;

  // Register JetBrains Mono
  doc.addFileToVFS('JetBrainsMono-Regular.ttf', fontRegular);
  doc.addFont('JetBrainsMono-Regular.ttf', 'JetBrainsMono', 'normal');
  doc.addFileToVFS('JetBrainsMono-Bold.ttf', fontBold);
  doc.addFont('JetBrainsMono-Bold.ttf', 'JetBrainsMono', 'bold');

  const bandColor = BAND_COLORS[result.global_band];
  const [br, bg, bb] = hexToRgb(bandColor);

  function setFont(style: 'normal' | 'bold' = 'normal') {
    doc.setFont('JetBrainsMono', style);
  }

  function fillPage() {
    doc.setFillColor(...C.white);
    doc.rect(0, 0, W, H, 'F');
  }

  function accentBar() {
    doc.setFillColor(...C.accent);
    doc.rect(0, 0, W, 3, 'F');
  }

  function ruledSection(label: string, yy: number): number {
    doc.setFontSize(8);
    setFont('bold');
    doc.setTextColor(...C.accent);
    doc.text(label.toUpperCase(), MARGIN, yy);
    yy += 3;
    doc.setDrawColor(...C.rule);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, yy, W - MARGIN, yy);
    return yy + 5;
  }

  function checkPage(needed: number) {
    if (y + needed > 278) {
      doc.addPage();
      fillPage();
      accentBar();
      // running header
      doc.setFontSize(7);
      setFont('normal');
      doc.setTextColor(...C.inksoft);
      doc.text('AGENT SECURITY SCORECARD', MARGIN, 11);
      doc.text(`${result.global_score}/100 · ${result.global_band}`, W - MARGIN, 11, { align: 'right' });
      doc.setDrawColor(...C.rule);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, 13, W - MARGIN, 13);
      y = 20;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE 1 — Cover
  // ─────────────────────────────────────────────────────────────────────────────
  fillPage();
  accentBar();

  // Title block
  y = 32;
  doc.setFontSize(7);
  setFont('bold');
  doc.setTextColor(...C.accent);
  doc.text('MOLNTEK', MARGIN, y);
  doc.setTextColor(...C.inksoft);
  doc.text('Cloud Security Engineering', MARGIN + 26, y);

  y += 20;
  doc.setFontSize(28);
  setFont('bold');
  doc.setTextColor(...C.ink);
  doc.text('Agent Security', MARGIN, y);
  y += 12;
  doc.text('Scorecard', MARGIN, y);

  y += 7;
  doc.setFontSize(9);
  setFont('normal');
  doc.setTextColor(...C.inksoft);
  doc.text('OWASP Top 10 for Agentic Applications 2026 · ASI01–ASI10', MARGIN, y);

  // Accent rule
  y += 8;
  doc.setFillColor(...C.accent);
  doc.rect(MARGIN, y, 40, 1.5, 'F');

  // Score hero block
  y += 14;
  doc.setFillColor(...C.codbg);
  doc.roundedRect(MARGIN, y, COL, 52, 2, 2, 'F');
  doc.setFillColor(br, bg, bb);
  doc.roundedRect(MARGIN, y, 4, 52, 2, 2, 'F');

  // Score number
  doc.setFontSize(48);
  setFont('bold');
  doc.setTextColor(br, bg, bb);
  doc.text(`${result.global_score}`, MARGIN + 14, y + 24);
  const numW = doc.getTextWidth(`${result.global_score}`);

  doc.setFontSize(16);
  setFont('normal');
  doc.setTextColor(...C.inksoft);
  doc.text('/100', MARGIN + 14 + numW + 2, y + 22);

  // Band badge
  doc.setFontSize(8);
  setFont('bold');
  doc.setFillColor(br, bg, bb);
  doc.roundedRect(MARGIN + 14, y + 28, 24, 7, 1.5, 1.5, 'F');
  doc.setTextColor(...C.white);
  doc.text(result.global_band.toUpperCase(), MARGIN + 14 + 12, y + 33.5, { align: 'center' });

  // Archetype
  doc.setFontSize(13);
  setFont('bold');
  doc.setTextColor(...C.ink);
  doc.text(result.archetype, MARGIN + 14, y + 45);

  doc.setFontSize(8);
  setFont('normal');
  doc.setTextColor(...C.inksoft);
  const subtitleLines = doc.splitTextToSize(result.archetype_subtitle, COL - 20);
  doc.text(subtitleLines.slice(0, 2), W - MARGIN - 4, y + 28, { align: 'right', maxWidth: COL / 2 });

  y += 60;

  // Benchmark line (Defect 4)
  if (result.benchmark_line) {
    const benchLines = doc.splitTextToSize(result.benchmark_line, COL);
    doc.setFontSize(8);
    setFont('normal');
    doc.setTextColor(...C.inksoft);
    doc.text(benchLines, MARGIN, y);
    y += benchLines.length * 4.5 + 6;
  }

  // Domain scores table
  y = ruledSection('Domain Scores', y);

  result.domain_results.forEach((dr, i) => {
    const domain = DOMAINS.find((d) => d.id === dr.domain_id)!;
    const [dc_r, dc_g, dc_b] = hexToRgb(domain.color);
    const [bc_r, bc_g, bc_b] = hexToRgb(BAND_COLORS[dr.band]);

    if (i % 2 === 0) {
      doc.setFillColor(...C.rowalt);
      doc.rect(MARGIN, y - 4, COL, 11, 'F');
    }

    // Domain color swatch
    doc.setFillColor(dc_r, dc_g, dc_b);
    doc.roundedRect(MARGIN, y - 2, 2.5, 7, 0.5, 0.5, 'F');

    doc.setFontSize(8);
    setFont('normal');
    doc.setTextColor(...C.ink);
    doc.text(`${dr.domain_id}. ${domain.shortName}`, MARGIN + 6, y + 3);

    // Progress bar
    const barX = MARGIN + 70;
    const barW = COL - 90;
    doc.setFillColor(...C.rule);
    doc.roundedRect(barX, y, barW, 2.5, 0.5, 0.5, 'F');
    doc.setFillColor(dc_r, dc_g, dc_b);
    doc.roundedRect(barX, y, Math.max(1.5, barW * (dr.normalized / 100)), 2.5, 0.5, 0.5, 'F');
    // target marker at 76
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.5);
    const tX = barX + barW * 0.76;
    doc.line(tX, y - 1, tX, y + 3.5);

    // Score + band
    doc.setFontSize(8);
    setFont('bold');
    doc.setTextColor(bc_r, bc_g, bc_b);
    doc.text(`${dr.normalized}`, W - MARGIN - 20, y + 3, { align: 'right' });
    doc.setFontSize(7);
    setFont('normal');
    doc.setTextColor(...C.inksoft);
    doc.text(dr.band, W - MARGIN, y + 3, { align: 'right' });

    y += 12;
  });

  // Metadata footer on cover
  y += 4;
  doc.setDrawColor(...C.rule);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 6;

  doc.setFontSize(7.5);
  setFont('normal');
  doc.setTextColor(...C.inksoft);

  const cols = [
    ['PREPARED FOR', email],
    ['DATE', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
    ['FRAMEWORK', 'OWASP Agentic 2026'],
    ['SCORING', 'Client-side only'],
  ];
  const cw = COL / 4;
  cols.forEach(([label, value], i) => {
    const cx = MARGIN + i * cw;
    setFont('bold');
    doc.setTextColor(...C.accent);
    doc.text(label, cx, y);
    setFont('normal');
    doc.setTextColor(...C.ink);
    const vLines = doc.splitTextToSize(value, cw - 4);
    doc.text(vLines, cx, y + 5);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE 2 — Top 3 Risks
  // ─────────────────────────────────────────────────────────────────────────────
  doc.addPage();
  fillPage();
  accentBar();

  y = 20;
  y = ruledSection('Top Three Risks — Fix These First', y);

  result.top3_risks.forEach((risk, i) => {
    const score = risk.value === 'na' ? 0 : risk.value;
    const domain = DOMAINS.find((d) => d.id === risk.question.domain_id)!;
    const [dc_r, dc_g, dc_b] = hexToRgb(domain.color);
    const asiName = ASI_DESCRIPTIONS[risk.question.asi_ref] ?? risk.question.asi_ref;

    checkPage(65);

    // Risk number badge
    doc.setFillColor(dc_r, dc_g, dc_b);
    doc.circle(MARGIN + 3.5, y + 3.5, 3.5, 'F');
    doc.setFontSize(7);
    setFont('bold');
    doc.setTextColor(...C.white);
    doc.text(`${i + 1}`, MARGIN + 3.5, y + 4.5, { align: 'center' });

    // ASI ref + name
    doc.setFontSize(9);
    setFont('bold');
    doc.setTextColor(...C.ink);
    doc.text(`${risk.question.asi_ref}`, MARGIN + 9, y + 4);
    doc.setFontSize(8);
    setFont('normal');
    doc.setTextColor(...C.inksoft);
    doc.text(` — ${asiName}`, MARGIN + 9 + doc.getTextWidth(`${risk.question.asi_ref}`), y + 4);

    // Score pill
    doc.setFillColor(dc_r, dc_g, dc_b);
    doc.roundedRect(W - MARGIN - 20, y, 20, 7, 1.5, 1.5, 'F');
    doc.setFontSize(7);
    setFont('bold');
    doc.setTextColor(...C.white);
    doc.text(`Level ${score}/3`, W - MARGIN - 10, y + 4.5, { align: 'center' });

    y += 10;

    // Question text
    doc.setFontSize(9);
    setFont('bold');
    doc.setTextColor(...C.ink);
    const qLines = doc.splitTextToSize(risk.question.text, COL);
    checkPage(qLines.length * 4.5 + 4);
    doc.text(qLines, MARGIN, y);
    y += qLines.length * 4.5 + 4;

    // Left-border callout style for WHY / ACTION / VERIFY
    const callouts: Array<[string, [number,number,number], string]> = [
      ['WHY IT MATTERS', [200, 85, 61], risk.question.why_it_matters],
      ['FIRST ACTION THIS WEEK', [99, 102, 241], risk.question.first_action],
      ['HOW TO VERIFY', [34, 197, 94], risk.question.how_to_verify],
    ];

    callouts.forEach(([label, [lr, lg, lb], body]) => {
      const bodyLines = doc.splitTextToSize(body, COL - 6);
      const boxH = bodyLines.length * 4 + 10;
      checkPage(boxH + 4);

      doc.setFillColor(...C.rowalt);
      doc.rect(MARGIN, y, COL, boxH, 'F');
      doc.setFillColor(lr, lg, lb);
      doc.rect(MARGIN, y, 2.5, boxH, 'F');

      doc.setFontSize(7);
      setFont('bold');
      doc.setTextColor(lr, lg, lb);
      doc.text(label, MARGIN + 5, y + 5);

      doc.setFontSize(8);
      setFont('normal');
      doc.setTextColor(...C.ink);
      doc.text(bodyLines, MARGIN + 5, y + 10);

      y += boxH + 4;
    });

    // Divider between risks
    if (i < result.top3_risks.length - 1) {
      checkPage(8);
      doc.setDrawColor(...C.rule);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y, W - MARGIN, y);
      y += 8;
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE 3 — 30-day Roadmap (Defect 6)
  // ─────────────────────────────────────────────────────────────────────────────
  if (result.roadmap_items.length > 0) {
    checkPage(40);
    const roadmapTitle = result.roadmap_items.length < 3
      ? 'YOUR PRIORITIES'
      : 'YOUR 30-DAY ORDER OF OPERATIONS';
    y = ruledSection(roadmapTitle, y);

    doc.setFontSize(8);
    setFont('normal');
    doc.setTextColor(...C.inksoft);
    doc.text('Tackle these in order. Each builds on the last.', MARGIN, y);
    y += 7;

    result.roadmap_items.forEach((item, i) => {
      const actionLines = doc.splitTextToSize(item.action + '.', COL - 22);
      const rowH = actionLines.length * 4.5 + 7;
      checkPage(rowH);

      if (i % 2 === 0) {
        doc.setFillColor(...C.rowalt);
        doc.rect(MARGIN, y - 2, COL, rowH, 'F');
      }

      // Number badge
      doc.setFillColor(...C.accent);
      doc.roundedRect(MARGIN, y, 6, 6, 1, 1, 'F');
      doc.setFontSize(6);
      setFont('bold');
      doc.setTextColor(...C.white);
      doc.text(`${i + 1}`, MARGIN + 3, y + 4.5, { align: 'center' });

      // Action text
      doc.setFontSize(8);
      setFont('normal');
      doc.setTextColor(...C.ink);
      doc.text(actionLines, MARGIN + 9, y + 4);

      // ASI tag
      doc.setFontSize(7);
      doc.setTextColor(...C.inksoft);
      doc.text(item.asi_tag, W - MARGIN, y + 4, { align: 'right' });

      y += rowH;
    });

    y += 8;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGE — Full Assessment Q&A
  // ─────────────────────────────────────────────────────────────────────────────
  doc.addPage();
  fillPage();
  accentBar();

  y = 20;
  y = ruledSection('Full Assessment — All 20 Answers', y);

  DOMAINS.forEach((domain) => {
    const domainQs = QUESTIONS.filter((q) => q.domain_id === domain.id);
    const [dc_r, dc_g, dc_b] = hexToRgb(domain.color);
    const dr = result.domain_results.find((r) => r.domain_id === domain.id)!;
    const [bc_r, bc_g, bc_b] = hexToRgb(BAND_COLORS[dr.band]);

    checkPage(18);

    // Domain header row
    doc.setFillColor(dc_r, dc_g, dc_b);
    doc.rect(MARGIN, y, COL, 9, 'F');
    doc.setFontSize(8);
    setFont('bold');
    doc.setTextColor(...C.white);
    doc.text(`${domain.id} — ${domain.name}`, MARGIN + 4, y + 6);
    doc.text(`${dr.normalized}/100 · ${dr.band}`, W - MARGIN - 4, y + 6, { align: 'right' });

    y += 13;

    domainQs.forEach((q, qi) => {
      const answerVal = answers[q.id] ?? 0;
      const score = answerVal === 'na' ? 'N/A' : `${answerVal}/3`;
      const label = answerVal === 'na' ? q.na_label : q.scale_labels[answerVal as number];

      const qLines = doc.splitTextToSize(q.text, COL - 14);
      const labelLines = doc.splitTextToSize(`${label}`, COL - 14);
      const rowH = (qLines.length + labelLines.length) * 4.5 + 8;
      checkPage(rowH);

      if (qi % 2 === 1) {
        doc.setFillColor(...C.rowalt);
        doc.rect(MARGIN, y - 2, COL, rowH, 'F');
      }

      // Q number with domain color
      doc.setFillColor(dc_r, dc_g, dc_b);
      doc.setFontSize(7);
      setFont('bold');
      doc.setTextColor(dc_r, dc_g, dc_b);
      doc.text(`Q${qi + 1}`, MARGIN + 1, y + 4);

      // Question text
      doc.setFontSize(8);
      setFont('bold');
      doc.setTextColor(...C.ink);
      doc.text(qLines, MARGIN + 10, y + 4);
      y += qLines.length * 4.5 + 1;

      // Answer
      doc.setFontSize(8);
      setFont('normal');
      doc.setTextColor(bc_r, bc_g, bc_b);
      doc.text(`${score}`, MARGIN + 10, y + 3);
      doc.setTextColor(...C.inksoft);
      const scoreW = doc.getTextWidth(`${score}  `);
      doc.text(`— ${label}`, MARGIN + 10 + scoreW, y + 3);

      y += labelLines.length * 4.5 + 7;
    });

    y += 5;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CTA Block (Defect 5) — final content on last page
  // ─────────────────────────────────────────────────────────────────────────────
  {
    const isDirect = result.global_band === 'Exposed' || result.global_band === 'Reactive';
    const theme = getTop3DomainTheme(result.top3_risks);

    checkPage(55);

    y = ruledSection(isDirect ? 'WANT HELP CLOSING THESE GAPS?' : 'KEEP YOUR EDGE', y);

    const ctaBody = isDirect
      ? `A weak ${theme} layer is the most common pattern we see in teams shipping agents — and the most fixable. The Molntek AI Security Sprint is a focused engagement that closes exactly the gaps in your top three above: per-agent identity, least-agency scoping, and a tested kill-switch.`
      : "You're ahead of most teams. The AI Security Intelligence newsletter covers agentic security developments — OWASP updates, new attack classes, and field patterns — every week.";

    doc.setFillColor(...C.rowalt);
    const ctaLines = doc.splitTextToSize(ctaBody, COL - 6);
    const ctaBoxH = ctaLines.length * 4.5 + 22;
    doc.rect(MARGIN, y, COL, ctaBoxH, 'F');
    doc.setFillColor(...C.accent);
    doc.rect(MARGIN, y, 2.5, ctaBoxH, 'F');

    doc.setFontSize(8.5);
    setFont('normal');
    doc.setTextColor(...C.ink);
    doc.text(ctaLines, MARGIN + 6, y + 7);

    const linkY = y + ctaLines.length * 4.5 + 13;
    const primaryLink = isDirect ? CTA_BOOKING_URL : CTA_NEWSLETTER_URL;
    const secondaryLink = isDirect ? CTA_NEWSLETTER_URL : CTA_BOOKING_URL;
    const primaryLabel = isDirect ? 'Book a 30-min Agent Security review →' : 'Read the newsletter →';
    const secondaryLabel = isDirect
      ? 'Not ready? The AI Security Intelligence newsletter →'
      : 'Running a complex agent estate? Molntek Agentic AI Security Review →';

    doc.setFontSize(8);
    setFont('bold');
    doc.setTextColor(...C.accent);
    doc.textWithLink(primaryLabel, MARGIN + 6, linkY, { url: primaryLink });

    doc.setFontSize(7.5);
    setFont('normal');
    doc.setTextColor(...C.inksoft);
    doc.textWithLink(secondaryLabel, MARGIN + 6, linkY + 6, { url: secondaryLink });

    y += ctaBoxH + 10;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Footer on every page
  // ─────────────────────────────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C.rule);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, 288, W - MARGIN, 288);
    doc.setFontSize(6.5);
    setFont('normal');
    doc.setTextColor(...C.inksoft);
    doc.text(
      'Agent Security Scorecard · OWASP Top 10 for Agentic Applications 2026 · molntek.com',
      MARGIN,
      293
    );
    doc.text(`${i} / ${totalPages}`, W - MARGIN, 293, { align: 'right' });
  }

  doc.save(`agent-security-scorecard-${result.global_score}.pdf`);
}
