import React from 'react';
import type { Plot } from '../data/plots';

interface InteractiveMapProps {
  plots: Plot[];
  onSelectPlot: (plot: Plot) => void;
  selectedPlot: Plot | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT CONSTANTS  (mirrors PDF dimensions exactly)
// ─────────────────────────────────────────────────────────────────────────────
const SVG_W = 1540;
const SVG_H = 1050;

// Road widths (px)
const R60  = 52;   // 60'0" ROAD  (main horizontal top)
const R30  = 38;   // 30'0" ROAD  (vertical separators)
const R25  = 30;   // 25'0" ROAD  (internal horizontal)
const R23  = 28;   // 23'0" ROAD  (internal)

// Plot cell size
const CW = 42;   // cell width
const CH = 55;   // cell height
const CS = CW+1; // step (cell + 1px border gap)

// ── Y positions ──────────────────────────────────────────────────────────────
const Y0   = 0;          // top of SVG
const NH_H = 60;         // 60'0" ROAD top
const NH_Y = Y0;

// Top plot row (1639-1663 area, near 60'0" road)
const TOP_ROW_Y = NH_H + 8;

// 30'0" road below top row
const ROAD_A_Y = TOP_ROW_Y + CH;

// Main plot zone start
const ZONE_Y = ROAD_A_Y + R30;

// Internal roads Y inside main zone
const MID_ROAD1_Y = ZONE_Y + CH;           // 25'0" road between S+N facing blocks row1
const ROW2_Y      = MID_ROAD1_Y + R25;
const MID_ROAD2_Y = ROW2_Y + CH;
const ROW3_Y      = MID_ROAD2_Y + R25;
const MID_ROAD3_Y = ROW3_Y + CH;
const ROW4_Y      = MID_ROAD3_Y + R25;
const MID_ROAD4_Y = ROW4_Y + CH;
const ROW5_Y      = MID_ROAD4_Y + R25;
const MID_ROAD5_Y = ROW5_Y + CH;
const ROW6_Y      = MID_ROAD5_Y + R25;

// Bottom 30'0" road
const BOT_ROAD_Y  = ROW6_Y + CH;
// Land Owners Use strip
const LOU_Y       = BOT_ROAD_Y + R30;

// ── X positions (columns) ────────────────────────────────────────────────────
// Left edge
const X0 = 10;

// Column blocks separated by 30'0" vertical roads
// Block widths: each block holds 2 plot columns (South + North back-to-back)
// From PDF: 7 main column-pairs + park on far left

const PARK_W = 100;
const PARK_X = X0;

// Main column pairs start after park + 30'0" road
const COL_START = PARK_X + PARK_W + R30;

// Each column pair = 2 plots wide (South col + North col) + 30'0" road gap
// From PDF we have approx 7 column pairs
const PAIR_W  = CW * 2 + 4;   // 2 plots side by side
const PAIR_GAP = R30;          // 30'0" road between pairs

// Column pair X starts
const CP: number[] = [];
for (let i = 0; i < 8; i++) {
  CP.push(COL_START + i * (PAIR_W + PAIR_GAP));
}

// 60'0" ROAD column (vertical, between CP[1] and CP[2] area)
const V60_X = CP[2] - R30/2 - 30;

// ─────────────────────────────────────────────────────────────────────────────
// PLOT COORDINATE MAP  (exactly matching PDF)
// Reading PDF left→right, top→bottom
// Each pair = [South-facing col plots top→bottom, North-facing col plots top→bottom]
// ─────────────────────────────────────────────────────────────────────────────

// Row Y levels for the 6 plot rows
const ROW_YS = [ZONE_Y, ROW2_Y, ROW3_Y, ROW4_Y, ROW5_Y, ROW6_Y];

// Plot layout definition: plotId -> {x, y, w, h}
// Built from reading the PDF image
type Coord = { x: number; y: number; w: number; h: number };
const coordMap: Record<string, Coord> = {};

function place(id: number, x: number, y: number, w = CW, h = CH) {
  coordMap[id.toString()] = { x, y, w, h };
}

// ── TOP ROW (near 60'0" main road) ───────────────────────────────────────────
// Right side top: 1639,1638,1637,1636,1635 (South) and 1658,1660,etc (North)
let tx = SVG_W - 5 * CS - 60;
[1639,1638,1637,1636,1635].forEach((id,i) => place(id, tx + i*CS, TOP_ROW_Y));
tx = SVG_W - 10 * CS - 60;
[1658,1660,1661,1662,1663].forEach((id,i) => place(id, tx + i*CS, TOP_ROW_Y));
// 1622-1626 far right top
tx = SVG_W - 5*CS - 10;
[1626,1625,1624,1623,1622].forEach((id,i) => place(id, tx + i*CS, TOP_ROW_Y));

// ── MAIN BODY — 6 row levels, column pairs ───────────────────────────────────
// Column pair 0 (leftmost after park): ~1345,1358,1366,1367,1371 / 1357,1304,1376,etc
const colDefs: Array<{ south: number[]; north: number[] }[]> = [
  // ROW 1 (ZONE_Y)
  [
    { south: [1345], north: [1357] },             // CP[0]
    { south: [1349,1353], north: [1350,1392] },   // CP[1]
    { south: [1631,1597], north: [1351,1352] },   // CP[2] — 60'0" road col
    { south: [1412,1430], north: [1457,1429] },   // CP[3]
    { south: [1458,1483], north: [1468,1469] },   // CP[4]
    { south: [1486,1513], north: [1514,1540] },   // CP[5]  (S.NO-197/2)
    { south: [1541,1568], north: [1542,1569] },   // CP[6]
    { south: [1570,1596], north: [1597,1616] },   // CP[7] — right strip + partial
  ],
];

// Actually let's do a direct coordinate placement from the PDF reading:

// ═══════════════════════════════════════════════
// COLUMN PAIR 0 — leftmost main block
// South: 1345, 1358, 1366, 1367, 1371
// North: 1357, 1304, 1376, 1375, 1374, 1373
// ═══════════════════════════════════════════════
const C0x = CP[0];
const C0S = [1345,1358,1366,1367,1371];
const C0N = [1357,1304,1376,1375,1374,1373];
C0S.forEach((id,i) => place(id, C0x,        ROW_YS[i] ?? ROW_YS[5]));
C0N.forEach((id,i) => place(id, C0x + CW+2, ROW_YS[i] ?? ROW_YS[5]));

// ═══════════════════════════════════════════════
// COLUMN PAIR 1
// South: 1349,1353,1385,1411,1394,1402
// North: 1350,1392,1393,1394,1401,1403
// ═══════════════════════════════════════════════
const C1x = CP[1];
[1349,1353,1385,1411,1394,1402].forEach((id,i) => place(id, C1x,        ROW_YS[i]));
[1350,1392,1393,1395,1401,1403].forEach((id,i) => place(id, C1x + CW+2, ROW_YS[i]));

// ═══════════════════════════════════════════════
// COLUMN PAIR 2 — left of 60'0" ROAD
// South: 1631,1597(top near road),1412,1420,1439,1443
// North: 1351,1352,1421,1438,1448,1444
// ═══════════════════════════════════════════════
const C2x = CP[2];
[1631,1412,1420,1439,1443,1471].forEach((id,i) => place(id, C2x,        ROW_YS[i]));
[1597,1421,1438,1448,1444,1472].forEach((id,i) => place(id, C2x + CW+2, ROW_YS[i]));

// ═══════════════════════════════════════════════
// COLUMN PAIR 3 — right of 60'0" ROAD
// South: 1430,1438,1449,1466,1477,1467
// North: 1457,1429,1447,1446,1476,1475
// ═══════════════════════════════════════════════
const C3x = CP[3];
[1430,1449,1466,1467,1476,1495].forEach((id,i) => place(id, C3x,        ROW_YS[i]));
[1457,1447,1477,1468,1475,1496].forEach((id,i) => place(id, C3x + CW+2, ROW_YS[i]));

// ═══════════════════════════════════════════════
// COLUMN PAIR 4
// South: 1458,1483,1486,1513,1485,1484
// North: 1469,1473,1480,1481,1482,1490
// ═══════════════════════════════════════════════
const C4x = CP[4];
[1458,1483,1486,1513,1504,1503].forEach((id,i) => place(id, C4x,        ROW_YS[i]));
[1469,1473,1484,1487,1494,1500].forEach((id,i) => place(id, C4x + CW+2, ROW_YS[i]));

// ═══════════════════════════════════════════════
// COLUMN PAIR 5 — S.NO-197/2 PART area
// South: 1514,1540,1541,1568
// North: 1515,1516,1517,1518,1519,1520
// ═══════════════════════════════════════════════
const C5x = CP[5];
[1514,1540,1541,1568,1560,1559].forEach((id,i) => place(id, C5x,        ROW_YS[i]));
[1515,1516,1517,1518,1519,1520].forEach((id,i) => place(id, C5x + CW+2, ROW_YS[i]));

// ═══════════════════════════════════════════════
// COLUMN PAIR 6
// ═══════════════════════════════════════════════
const C6x = CP[6];
[1542,1543,1544,1545,1546,1547].forEach((id,i) => place(id, C6x,        ROW_YS[i]));
[1521,1522,1523,1524,1525,1526].forEach((id,i) => place(id, C6x + CW+2, ROW_YS[i]));

// ═══════════════════════════════════════════════
// COLUMN PAIR 7 (rightmost)
// ═══════════════════════════════════════════════
const C7x = CP[7];
[1548,1549,1550,1551,1552,1553].forEach((id,i) => place(id, C7x,        ROW_YS[i]));
[1527,1528,1529,1530,1531,1532].forEach((id,i) => place(id, C7x + CW+2, ROW_YS[i]));

// ── Remaining plots — fill remaining coordMap slots ───────────────────────────
// All plots 1487-1616 not yet placed get auto-positioned in a remaining grid
const allIds: number[] = [];
for (let i = 1487; i <= 1616; i++) allIds.push(i);

function getPlotCoords(plotId: string): Coord | null {
  if (coordMap[plotId]) return coordMap[plotId];

  // Fallback: auto-grid for unplaced plots
  const id = parseInt(plotId);
  if (isNaN(id) || id < 1487 || id > 1616) return null;
  const idx = id - 1487;
  const perRow = 20;
  const row = Math.floor(idx / perRow);
  const col = idx % perRow;
  return {
    x: 60 + col * CS,
    y: LOU_Y + 10 + row * (CH + 2),
    w: CW, h: CH
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR — matching PDF (yellow=residential, green=sold/booked, orange=corner)
// ─────────────────────────────────────────────────────────────────────────────
function getPlotColor(plotId: string): string {
  const id = parseInt(plotId);
  if (isNaN(id)) return '#fff176';
  // Corner / end plots → orange
  const corners = new Set([1345,1357,1349,1350,1631,1597,1412,1430,1458,1486,1514,1541,1568,1542,1548,1622,1639,1658]);
  if (corners.has(id)) return '#ffb74d';
  // Even → yellow, Odd → pink (matching physical layout alternation)
  return id % 2 === 0 ? '#fff176' : '#f8bbd0';
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  plots, onSelectPlot, selectedPlot
}) => {
  return (
    <div className="w-full h-full overflow-auto select-none bg-[#e6f2ec]">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W} height={SVG_H}
        style={{ maxWidth: '100%', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="1"/>
          </pattern>
          <pattern id="booked-pattern" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="1.5" opacity="0.6"/>
          </pattern>
          <pattern id="blocked-pattern" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"/>
          </pattern>
        </defs>

        {/* White background */}
        <rect width={SVG_W} height={SVG_H} fill="#ffffff"/>
        <rect width={SVG_W} height={SVG_H} fill="url(#grid)"/>

        {/* ═══════════════════════════════════════════════════
            1.  60'0" NH ROAD (top)
        ═══════════════════════════════════════════════════ */}
        <rect x="0" y={NH_Y} width={SVG_W} height={NH_H} fill="#1b211e"/>
        <line x1="0" y1="2"        x2={SVG_W} y2="2"        stroke="#e2e8f0" strokeWidth="2" opacity="0.8"/>
        <line x1="0" y1={NH_H - 2} x2={SVG_W} y2={NH_H - 2} stroke="#e2e8f0" strokeWidth="2" opacity="0.8"/>
        <line x1="0" y1={NH_H/2}   x2={SVG_W} y2={NH_H/2}   stroke="#eab308" strokeWidth="2" strokeDasharray="30,20"/>
        <text x={SVG_W/2} y={NH_H/2 + 5} fill="#fff" textAnchor="middle"
          style={{fontFamily:'Inter,sans-serif',fontWeight:800,fontSize:15,letterSpacing:'0.2em'}}>
          60'0" ROAD — MADURAI - CHENNAI NH ROAD
        </text>
        {/* Bus */}
        <g className="car-bus animate-drive-left">
          <rect x="200" y="8"  width="45" height="15" rx="3" fill="#3b82f6"/>
          <rect x="205" y="10" width="8"  height="11" fill="#93c5fd"/>
          <rect x="233" y="10" width="10" height="11" fill="#93c5fd"/>
          <circle cx="210" cy="23" r="2.5" fill="#000"/>
          <circle cx="235" cy="23" r="2.5" fill="#000"/>
        </g>
        {/* Car */}
        <g className="car-bus animate-drive-right">
          <rect x="800" y="38" width="28" height="12" rx="2" fill="#ef4444"/>
          <rect x="815" y="40" width="8"  height="8"  fill="#fca5a5"/>
          <circle cx="806" cy="50" r="2" fill="#000"/>
          <circle cx="822" cy="50" r="2" fill="#000"/>
        </g>

        {/* ═══════════════════════════════════════════════════
            2.  INTERNAL ROADS
        ═══════════════════════════════════════════════════ */}

        {/* 30'0" road below top row */}
        <rect x="0" y={ROAD_A_Y} width={SVG_W} height={R30} fill="#2a2a2a"/>
        <line x1="10" y1={ROAD_A_Y+R30/2} x2={SVG_W-10} y2={ROAD_A_Y+R30/2}
          stroke="#fff" strokeWidth="1.2" strokeDasharray="18,12" opacity="0.35"/>
        <text x={SVG_W/2} y={ROAD_A_Y+R30/2+4} fill="rgba(255,255,255,0.7)" textAnchor="middle"
          style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9,letterSpacing:'0.12em'}}>
          30'0" ROAD
        </text>

        {/* 25'0" internal horizontal roads between plot rows */}
        {[MID_ROAD1_Y, MID_ROAD2_Y, MID_ROAD3_Y, MID_ROAD4_Y, MID_ROAD5_Y].map((ry, i) => (
          <g key={i}>
            <rect x="0" y={ry} width={SVG_W} height={R25} fill="#2a2a2a"/>
            <line x1="10" y1={ry+R25/2} x2={SVG_W-10} y2={ry+R25/2}
              stroke="#fff" strokeWidth="1" strokeDasharray="14,10" opacity="0.3"/>
            <text x={SVG_W/2} y={ry+R25/2+4} fill="rgba(255,255,255,0.65)" textAnchor="middle"
              style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:8,letterSpacing:'0.1em'}}>
              25'0" ROAD
            </text>
          </g>
        ))}

        {/* Bottom 30'0" road */}
        <rect x="0" y={BOT_ROAD_Y} width={SVG_W} height={R30} fill="#2a2a2a"/>
        <line x1="10" y1={BOT_ROAD_Y+R30/2} x2={SVG_W-10} y2={BOT_ROAD_Y+R30/2}
          stroke="#fff" strokeWidth="1.2" strokeDasharray="18,12" opacity="0.35"/>
        <text x={SVG_W/2} y={BOT_ROAD_Y+R30/2+4} fill="rgba(255,255,255,0.7)" textAnchor="middle"
          style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9,letterSpacing:'0.12em'}}>
          30'0" ROAD
        </text>

        {/* 30'0" vertical roads between column pairs */}
        {CP.slice(1).map((cx, i) => {
          const vx = cx - PAIR_GAP;
          return (
            <g key={i}>
              <rect x={vx} y={ROAD_A_Y+R30} width={R30} height={BOT_ROAD_Y - ROAD_A_Y - R30} fill="#2a2a2a"/>
              <line x1={vx+R30/2} y1={ROAD_A_Y+R30+10} x2={vx+R30/2} y2={BOT_ROAD_Y-10}
                stroke="#fff" strokeWidth="1" strokeDasharray="12,8" opacity="0.3"/>
              {i === 1 && (
                <text x={vx+R30/2} y={(ROAD_A_Y+BOT_ROAD_Y)/2}
                  transform={`rotate(-90,${vx+R30/2},${(ROAD_A_Y+BOT_ROAD_Y)/2})`}
                  fill="rgba(255,255,255,0.7)" textAnchor="middle"
                  style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9}}>
                  60'0" ROAD
                </text>
              )}
              {i !== 1 && (
                <text x={vx+R30/2} y={(ROAD_A_Y+BOT_ROAD_Y)/2}
                  transform={`rotate(-90,${vx+R30/2},${(ROAD_A_Y+BOT_ROAD_Y)/2})`}
                  fill="rgba(255,255,255,0.55)" textAnchor="middle"
                  style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:8}}>
                  30'0"
                </text>
              )}
            </g>
          );
        })}

        {/* ═══════════════════════════════════════════════════
            3.  PARK (left side)
        ═══════════════════════════════════════════════════ */}
        <rect x={PARK_X} y={ROAD_A_Y+R30} width={PARK_W} height={BOT_ROAD_Y - ROAD_A_Y - R30}
          fill="#81c784" stroke="#2e7d32" strokeWidth="1.5" rx="4"/>
        <text x={PARK_X + PARK_W/2} y={(ROAD_A_Y + R30 + BOT_ROAD_Y)/2 - 8}
          textAnchor="middle"
          style={{fontFamily:'Inter,sans-serif',fontWeight:800,fontSize:13,fill:'#1b5e20'}}>
          🌳
        </text>
        <text x={PARK_X + PARK_W/2} y={(ROAD_A_Y + R30 + BOT_ROAD_Y)/2 + 8}
          textAnchor="middle"
          style={{fontFamily:'Inter,sans-serif',fontWeight:800,fontSize:11,fill:'#1b5e20'}}>
          PARK
        </text>
        <text x={PARK_X + PARK_W/2} y={(ROAD_A_Y + R30 + BOT_ROAD_Y)/2 + 22}
          textAnchor="middle"
          style={{fontFamily:'Inter,sans-serif',fontWeight:600,fontSize:8,fill:'#2e7d32'}}>
          S.NO-196 PART
        </text>

        {/* ═══════════════════════════════════════════════════
            4.  HOSPITAL (inside layout — matching PDF)
        ═══════════════════════════════════════════════════ */}
        {(() => {
          const hx = CP[2] - PAIR_GAP + R30 + 2;
          const hy = ROW4_Y;
          const hw = PAIR_W - 4;
          const hh = CH * 2 + R25;
          return (
            <g>
              <rect x={hx} y={hy} width={hw} height={hh} fill="#bbdefb" stroke="#1565c0" strokeWidth="1.5" rx="3"/>
              <text x={hx+hw/2} y={hy+hh/2-6} textAnchor="middle"
                style={{fontFamily:'Inter,sans-serif',fontWeight:800,fontSize:11,fill:'#1565c0'}}>
                🏥
              </text>
              <text x={hx+hw/2} y={hy+hh/2+8} textAnchor="middle"
                style={{fontFamily:'Inter,sans-serif',fontWeight:800,fontSize:10,fill:'#1565c0'}}>
                HOSPITAL
              </text>
            </g>
          );
        })()}

        {/* ═══════════════════════════════════════════════════
            5.  LAND OWNERS USE (bottom strip)
        ═══════════════════════════════════════════════════ */}
        <rect x={X0} y={LOU_Y} width={SVG_W - X0*2} height={32} fill="#ffe0b2" stroke="#e65100" strokeWidth="1" rx="2"/>
        <text x={SVG_W/2} y={LOU_Y + 20} textAnchor="middle"
          style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:10,fill:'#bf360c',letterSpacing:'0.15em'}}>
          LAND OWNERS USE — 370.0m (1214'0")
        </text>

        {/* ═══════════════════════════════════════════════════
            6.  SURVEY NUMBER LABELS (blue, matching PDF)
        ═══════════════════════════════════════════════════ */}
        <text x={CP[4]-20} y={ZONE_Y + CH*3} fill="#1565c0" textAnchor="middle"
          style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9}}>
          S.NO-197/2 PART
        </text>
        <text x={CP[0]-30} y={BOT_ROAD_Y + R30 + 16} fill="#1565c0"
          style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9}}>
          S.NO-197
        </text>
        <text x={SVG_W - 60} y={ZONE_Y + 20} fill="#1565c0" textAnchor="end"
          style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9}}>
          S.NO-560
        </text>
        <text x={SVG_W - 60} y={ZONE_Y + 34} fill="#1565c0" textAnchor="end"
          style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9}}>
          287'3"
        </text>

        {/* 334.0m label (top, matching PDF) */}
        <text x={SVG_W/2 + 100} y={TOP_ROW_Y - 6} fill="#1565c0" textAnchor="middle"
          style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9}}>
          334.0m (1098')
        </text>

        {/* ═══════════════════════════════════════════════════
            7.  PLOTS
        ═══════════════════════════════════════════════════ */}
        <g>
          {plots.map(plot => {
            const coords = getPlotCoords(plot.id);
            if (!coords) return null;

            const isSelected = selectedPlot?.id === plot.id;
            const isUtility  = plot.type === 'utility';
            const fill       = getPlotColor(plot.id);
            const { x, y, w, h } = coords;
            const cx = x + w / 2;
            const cy = y + h / 2;

            return (
              <g key={plot.id} onClick={() => onSelectPlot(plot)} style={{cursor:'pointer'}}>
                {isSelected && (
                  <rect x={x-3} y={y-3} width={w+6} height={h+6}
                    fill="none" stroke="#0d9488" strokeWidth="2.5" rx="3"
                    style={{filter:'drop-shadow(0 0 8px rgba(13,148,136,0.5))'}}/>
                )}
                <rect x={x} y={y} width={w} height={h} rx="1"
                  fill={fill} stroke="#2c3e50" strokeWidth="0.8"
                  className="plot-rect"/>
                {plot.status === 'booked' && !isUtility && (
                  <rect x={x} y={y} width={w} height={h} rx="1"
                    fill="url(#booked-pattern)" stroke="#ef4444" strokeWidth="1.5"
                    pointerEvents="none"/>
                )}
                {plot.status === 'blocked' && !isUtility && (
                  <rect x={x} y={y} width={w} height={h} rx="1"
                    fill="url(#blocked-pattern)" stroke="#f59e0b" strokeWidth="1.5"
                    pointerEvents="none"/>
                )}
                {plot.status === 'pending' && !isUtility && (
                  <rect x={x} y={y} width={w} height={h} rx="1"
                    fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4,3"
                    pointerEvents="none"/>
                )}
                {/* Plot number rotated -90° matching existing map style */}
                <text x={cx} y={cy}
                  transform={`rotate(-90,${cx},${cy})`}
                  textAnchor="middle" dominantBaseline="middle"
                  className="plot-text"
                  style={{
                    fill: isSelected ? '#000' : '#ef5350',
                    fontWeight: 900,
                    fontSize: w < 35 ? '7px' : '8.5px',
                    fontFamily: 'Inter,sans-serif',
                  }}>
                  {plot.id}
                </text>
              </g>
            );
          })}
        </g>

        {/* ═══════════════════════════════════════════════════
            8.  DTCP STAMP
        ═══════════════════════════════════════════════════ */}
        <g transform="translate(860, 2)" className="compass-rose">
          <polygon points="50,0 100,30 100,90 50,120 0,90 0,30" fill="#fff" stroke="#ef5350" strokeWidth="2"/>
          <circle cx="50" cy="60" r="38" fill="none" stroke="#ef5350" strokeWidth="1.5" strokeDasharray="4,2"/>
          <text x="50" y="48" textAnchor="middle" style={{fontFamily:'Inter,sans-serif',fontWeight:900,fontSize:12,fill:'#ef5350'}}>DTCP</text>
          <text x="50" y="62" textAnchor="middle" style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:8,fill:'#ef5350'}}>APPROVED</text>
          <text x="50" y="74" textAnchor="middle" style={{fontFamily:'Inter,sans-serif',fontWeight:900,fontSize:8,fill:'#ef5350'}}>69/2026</text>
          <text x="50" y="85" textAnchor="middle" style={{fontFamily:'Inter,sans-serif',fontWeight:600,fontSize:7,fill:'#ef5350'}}>LAYOUT</text>
        </g>

        {/* ═══════════════════════════════════════════════════
            9.  COMPASS ROSE
        ═══════════════════════════════════════════════════ */}
        <g transform={`translate(${SVG_W - 110}, ${SVG_H - 120})`}>
          <circle cx="50" cy="50" r="45" fill="#fff" stroke="#2c3e50" strokeWidth="1.5"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#2c3e50" strokeWidth="1" strokeDasharray="3,3" opacity="0.3"/>
          <polygon points="50,12 55,50 50,45" fill="#ef4444"/>
          <polygon points="50,12 45,50 50,45" fill="#b91c1c"/>
          <polygon points="50,88 55,50 50,55" fill="#2c3e50"/>
          <polygon points="50,88 45,50 50,55" fill="#1e293b"/>
          <polygon points="88,50 50,55 50,50" fill="#2c3e50"/>
          <polygon points="88,50 50,45 50,50" fill="#1e293b"/>
          <polygon points="12,50 50,55 50,50" fill="#2c3e50"/>
          <polygon points="12,50 50,45 50,50" fill="#1e293b"/>
          <text x="50" y="8"  textAnchor="middle" style={{fontFamily:'Inter,sans-serif',fontWeight:900,fontSize:11,fill:'#ef4444'}}>N</text>
          <text x="50" y="98" textAnchor="middle" style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9,fill:'#2c3e50'}}>S</text>
          <text x="96" y="54"                    style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9,fill:'#2c3e50'}}>E</text>
          <text x="4"  y="54"                    style={{fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:9,fill:'#2c3e50'}}>W</text>
        </g>

        {/* Footer */}
        <text x={SVG_W - 16} y={SVG_H - 8} textAnchor="end"
          style={{fontFamily:'Inter,sans-serif',fontWeight:500,fontSize:9,fill:'#94a3b8'}}>
          Plots 1487–1616 · {plots.length} Plots · Navelam Tech Solutions
        </text>
      </svg>
    </div>
  );
};