export interface BookingDetails {
  bookingId?: string;
  customerName: string;
  bookedAt?: string;
  notes?: string;
}

export interface Plot {
  id: string;
  number: string;
  block: string;
  dimensions: string;
  area: number;
  facing: 'North' | 'South' | 'East' | 'West';
  type: 'residential' | 'commercial' | 'utility';
  status: 'available' | 'booked' | 'blocked' | 'pending';
  bookingDetails?: BookingDetails | null;
}

function makePlot(id: number, block: string, facing: 'North'|'South', dim: string, area: number): Plot {
  return { id: id.toString(), number: id.toString(), block, dimensions: dim, area, facing, type: 'residential', status: 'available' };
}

// All 130 plots 1487–1616, grouped by block matching PDF layout
export const plotsData: Plot[] = [
  // ── BLOCK A: left column pair ──────────────────────────────────────────────
  ...[1487,1488,1489,1490,1491,1492].map(id => makePlot(id,'A','South',"40' x 60'",2400)),
  ...[1493,1494,1495,1496,1497,1498].map(id => makePlot(id,'A','North',"40' x 60'",2400)),

  // ── BLOCK B ────────────────────────────────────────────────────────────────
  ...[1499,1500,1501,1502,1503,1504].map(id => makePlot(id,'B','South',"40' x 60'",2400)),
  ...[1505,1506,1507,1508,1509,1510].map(id => makePlot(id,'B','North',"40' x 60'",2400)),

  // ── BLOCK C (60'0" ROAD) ───────────────────────────────────────────────────
  ...[1511,1512,1513,1514,1515,1516].map(id => makePlot(id,'C','South',"40' x 60'",2400)),
  ...[1517,1518,1519,1520,1521,1522].map(id => makePlot(id,'C','North',"40' x 60'",2400)),

  // ── BLOCK D ────────────────────────────────────────────────────────────────
  ...[1523,1524,1525,1526,1527,1528].map(id => makePlot(id,'D','South',"40' x 60'",2400)),
  ...[1529,1530,1531,1532,1533,1534].map(id => makePlot(id,'D','North',"40' x 60'",2400)),

  // ── BLOCK E (S.NO-197/2 PART) ──────────────────────────────────────────────
  ...[1535,1536,1537,1538,1539,1540].map(id => makePlot(id,'E','South',"40' x 60'",2400)),
  ...[1541,1542,1543,1544,1545,1546].map(id => makePlot(id,'E','North',"40' x 60'",2400)),

  // ── BLOCK F ────────────────────────────────────────────────────────────────
  ...[1547,1548,1549,1550,1551,1552].map(id => makePlot(id,'F','South',"40' x 60'",2400)),
  ...[1553,1554,1555,1556,1557,1558].map(id => makePlot(id,'F','North',"40' x 60'",2400)),

  // ── BLOCK G ────────────────────────────────────────────────────────────────
  ...[1559,1560,1561,1562,1563,1564].map(id => makePlot(id,'G','South',"40' x 60'",2400)),
  ...[1565,1566,1567,1568,1569,1570].map(id => makePlot(id,'G','North',"40' x 60'",2400)),

  // ── BLOCK H ────────────────────────────────────────────────────────────────
  ...[1571,1572,1573,1574,1575,1576].map(id => makePlot(id,'H','South',"40' x 60'",2400)),
  ...[1577,1578,1579,1580,1581,1582].map(id => makePlot(id,'H','North',"40' x 60'",2400)),

  // ── BLOCK I (top strip near 60'0" road, right side) ───────────────────────
  ...[1583,1584,1585,1586,1587,1588].map(id => makePlot(id,'I','South',"40' x 40'",1600)),
  ...[1589,1590,1591,1592,1593,1594].map(id => makePlot(id,'I','North',"40' x 40'",1600)),

  // ── BLOCK J (right edge strip) ─────────────────────────────────────────────
  ...[1595,1596,1597,1598,1599,1600].map(id => makePlot(id,'J','South',"40' x 60'",2400)),
  ...[1601,1602,1603,1604,1605,1606].map(id => makePlot(id,'J','North',"40' x 60'",2400)),

  // ── BLOCK K (remaining to 1616) ────────────────────────────────────────────
  ...[1607,1608,1609,1610,1611,1612,1613,1614,1615,1616].map(id => makePlot(id,'K','South',"40' x 60'",2400)),
];