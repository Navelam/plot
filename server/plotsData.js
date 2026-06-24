// Pre-populated data for Madurai Plot Layout

// Generate plots list
const plots = [];

// Helper to add a plot
function addPlot({ id, block, dimensions, area, facing, type = 'residential', status = 'available' }) {
  plots.push({
    id: id.toString(),
    number: id.toString(),
    block,
    dimensions,
    area,
    facing,
    type,
    status,
    bookingDetails: null
  });
}

// ----------------------------------------------------
// 1. Block L1 (Bottom Left): Plots 1 to 7
// ----------------------------------------------------
// Plot 1 is irregular, others are standard facing South/North
addPlot({ id: 1, block: 'L1', dimensions: "53'9\" x 37'", area: 1800, facing: 'South' });
addPlot({ id: 2, block: 'L1', dimensions: "53' x 30'", area: 1590, facing: 'South' });
addPlot({ id: 3, block: 'L1', dimensions: "51' x 30'", area: 1530, facing: 'South' });
addPlot({ id: 4, block: 'L1', dimensions: "49'9\" x 30'", area: 1492, facing: 'South' });
addPlot({ id: 5, block: 'L1', dimensions: "48'3\" x 30'", area: 1447, facing: 'South' });
addPlot({ id: 6, block: 'L1', dimensions: "46'6\" x 30'", area: 1395, facing: 'South' });
addPlot({ id: 7, block: 'L1', dimensions: "45'3\" x 30'", area: 1357, facing: 'South' });

// ----------------------------------------------------
// 2. Block R1 (Bottom Right): Plots 8, 9
// ----------------------------------------------------
addPlot({ id: 8, block: 'R1', dimensions: "41'6\" x 34'6\"", area: 1431, facing: 'South' });
addPlot({ id: 9, block: 'R1', dimensions: "40'6\" x 26'9\"", area: 1083, facing: 'South' });

// ----------------------------------------------------
// 3. Block R2 (Middle Right 1): Plots 10 to 15
// ----------------------------------------------------
addPlot({ id: 10, block: 'R2', dimensions: "57' x 30' (irr)", area: 1500, facing: 'South' });
for (let i = 11; i <= 13; i++) {
  addPlot({ id: i, block: 'R2', dimensions: "57' x 23'", area: 1311, facing: 'South' });
}
addPlot({ id: 14, block: 'R2', dimensions: "57' x 30'", area: 1710, facing: 'South' });
addPlot({ id: 15, block: 'R2', dimensions: "57' x 30'", area: 1710, facing: 'South' });

// ----------------------------------------------------
// 4. Block L2 (Middle Left 1): Plots 16 to 31
// ----------------------------------------------------
// 16 to 22 face South
for (let i = 16; i <= 20; i++) {
  addPlot({ id: i, block: 'L2', dimensions: "41' x 30'", area: 1230, facing: 'South' });
}
addPlot({ id: 21, block: 'L2', dimensions: "41' x 24'", area: 984, facing: 'South' });
addPlot({ id: 22, block: 'L2', dimensions: "41' x 16'", area: 656, facing: 'South' });
// 23, 24 are West facing corner/side plots
addPlot({ id: 23, block: 'L2', dimensions: "41' x 15' (irr)", area: 315, facing: 'West' });
addPlot({ id: 24, block: 'L2', dimensions: "41' x 21' (irr)", area: 360, facing: 'West' });
// 25 to 31 face North
addPlot({ id: 25, block: 'L2', dimensions: "41' x 21'3\"", area: 871, facing: 'North' });
for (let i = 26; i <= 31; i++) {
  addPlot({ id: i, block: 'L2', dimensions: "41' x 30'", area: 1230, facing: 'North' });
}

// ----------------------------------------------------
// 5. Block R3 (Middle Right 2): Plots 32 to 38
// ----------------------------------------------------
for (let i = 32; i <= 37; i++) {
  addPlot({ id: i, block: 'R3', dimensions: "30' x 30'", area: 900, facing: 'North' });
}
addPlot({ id: 38, block: 'R3', dimensions: "64'6\" x 22'6\"", area: 1450, facing: 'East' });

// ----------------------------------------------------
// 6. Block R4 (Middle Right 3): Plots 39 to 46 & 63 to 71
// ----------------------------------------------------
// 39 to 46 face South
addPlot({ id: 39, block: 'R4', dimensions: "41' x 26'9\"", area: 1096, facing: 'South' });
for (let i = 40; i <= 46; i++) {
  addPlot({ id: i, block: 'R4', dimensions: "41' x 30'", area: 1230, facing: 'South' });
}
// 63 to 71 face North
for (let i = 63; i <= 70; i++) {
  addPlot({ id: i, block: 'R4', dimensions: "41' x 30'", area: 1230, facing: 'North' });
}
addPlot({ id: 71, block: 'R4', dimensions: "41' x 34'", area: 1394, facing: 'North' });

// ----------------------------------------------------
// 7. Block L3 (Middle Left 2): Plots 47 to 62 & 54
// ----------------------------------------------------
// 47 to 53 face South
for (let i = 47; i <= 52; i++) {
  addPlot({ id: i, block: 'L3', dimensions: "41' x 30'", area: 1230, facing: 'South' });
}
addPlot({ id: 53, block: 'L3', dimensions: "41' x 24'", area: 984, facing: 'South' });
// 54 is corner facing West
addPlot({ id: 54, block: 'L3', dimensions: "28' x 20' (irr)", area: 560, facing: 'West' });
// 55 to 62 face North
addPlot({ id: 55, block: 'L3', dimensions: "41' x 37'3\" (irr)", area: 1527, facing: 'North' });
addPlot({ id: 56, block: 'L3', dimensions: "41' x 24'", area: 984, facing: 'North' });
for (let i = 57; i <= 62; i++) {
  addPlot({ id: i, block: 'L3', dimensions: "41' x 30'", area: 1230, facing: 'North' });
}

// ----------------------------------------------------
// 8. Block R5 (Middle Right 4): Plots 72 to 81 & 94 to 104
// ----------------------------------------------------
// 72 to 81 face South
addPlot({ id: 72, block: 'R5', dimensions: "41' x 40'6\" / 17'", area: 1179, facing: 'South' });
for (let i = 73; i <= 81; i++) {
  addPlot({ id: i, block: 'R5', dimensions: "41' x 30'", area: 1230, facing: 'South' });
}
// 94 to 104 face North
for (let i = 94; i <= 103; i++) {
  addPlot({ id: i, block: 'R5', dimensions: "30' x 30'", area: 900, facing: 'North' });
}
addPlot({ id: 104, block: 'R5', dimensions: "30' x 35'", area: 1050, facing: 'North' });

// ----------------------------------------------------
// 9. Block L4 (Middle Left 3): Plots 82 to 93
// ----------------------------------------------------
// 82 to 89 face South
for (let i = 82; i <= 88; i++) {
  addPlot({ id: i, block: 'L4', dimensions: "41' x 30'", area: 1230, facing: 'South' });
}
addPlot({ id: 89, block: 'L4', dimensions: "41' x 43'9\" (irr)", area: 1790, facing: 'South' });
// 90 to 93 face North
addPlot({ id: 90, block: 'L4', dimensions: "41' x 40'", area: 1640, facing: 'North' });
for (let i = 91; i <= 93; i++) {
  addPlot({ id: i, block: 'L4', dimensions: "41' x 30'", area: 1230, facing: 'North' });
}

// ----------------------------------------------------
// 10. Block L5 (Middle Left 4): Plots 117 to 122
// ----------------------------------------------------
addPlot({ id: 117, block: 'L5', dimensions: "30' x 30'", area: 900, facing: 'South' });
addPlot({ id: 118, block: 'L5', dimensions: "30' x 30'", area: 900, facing: 'South' });
addPlot({ id: 119, block: 'L5', dimensions: "30' x 44'3\" (irr)", area: 1327, facing: 'North' });
addPlot({ id: 120, block: 'L5', dimensions: "30' x 35'", area: 1050, facing: 'North' });
addPlot({ id: 121, block: 'L5', dimensions: "30' x 30'", area: 900, facing: 'North' });
addPlot({ id: 122, block: 'L5', dimensions: "30' x 30'", area: 900, facing: 'North' });

// ----------------------------------------------------
// 11. Block R6 (Middle Right 5): Plots 106 to 116 & 123 to 144
// ----------------------------------------------------
// 106 to 116 face South
addPlot({ id: 106, block: 'R6', dimensions: "30' x 37'9\"", area: 1132, facing: 'South' });
for (let i = 107; i <= 116; i++) {
  addPlot({ id: i, block: 'R6', dimensions: "30' x 30'", area: 900, facing: 'South' });
}
// 123 to 144 face North (Commercial/Small units)
for (let i = 123; i <= 143; i++) {
  addPlot({ id: i, block: 'R6', dimensions: "30' x 15'", area: 450, facing: 'North' });
}
addPlot({ id: 144, block: 'R6', dimensions: "30' x 13'6\"", area: 405, facing: 'North' });

// ----------------------------------------------------
// 12. Block L6 (Top Left): Plots 162 to 169 & Utilities (EB, LB)
// ----------------------------------------------------
addPlot({ id: 162, block: 'L6', dimensions: "49'9\" x 45'6\"", area: 2267, facing: 'South' });
addPlot({ id: 163, block: 'L6', dimensions: "49'9\" x 40'", area: 1990, facing: 'South' });
addPlot({ id: 164, block: 'L6', dimensions: "49'9\" x 40'", area: 1990, facing: 'South' });
addPlot({ id: 165, block: 'L6', dimensions: "49'9\" x 40'", area: 1990, facing: 'South' });
addPlot({ id: 166, block: 'L6', dimensions: "49'9\" x 40'", area: 1990, facing: 'South' });

// Utilities (Not for sale by default)
addPlot({ id: 'EB', block: 'L6', dimensions: "37'3\" x 15'", area: 558, facing: 'East', type: 'utility', status: 'blocked' });
addPlot({ id: 'LB', block: 'L6', dimensions: "45'6\" x 15'", area: 682, facing: 'East', type: 'utility', status: 'blocked' });

addPlot({ id: 167, block: 'L6', dimensions: "37'6\" x 40'", area: 1500, facing: 'North' });
addPlot({ id: 168, block: 'L6', dimensions: "39'6\" x 40'", area: 1580, facing: 'North' });
addPlot({ id: 169, block: 'L6', dimensions: "23'6\" x 44'3\" (irr)", area: 520, facing: 'North' });

// ----------------------------------------------------
// 13. Block R7 (Top Right): Plots 145 to 157
// ----------------------------------------------------
addPlot({ id: 145, block: 'R7', dimensions: "36'9\" x 14'", area: 514, facing: 'South' });
addPlot({ id: 146, block: 'R7', dimensions: "37'9\" x 16'3\"", area: 613, facing: 'South' });
addPlot({ id: 147, block: 'R7', dimensions: "38'9\" x 20'", area: 775, facing: 'South' });
addPlot({ id: 148, block: 'R7', dimensions: "40' x 20'", area: 800, facing: 'South' });
addPlot({ id: 149, block: 'R7', dimensions: "40'6\" x 20'", area: 810, facing: 'South' });
for (let i = 150; i <= 155; i++) {
  addPlot({ id: i, block: 'R7', dimensions: "38'9\" x 20'", area: 775, facing: 'South' });
}
addPlot({ id: 156, block: 'R7', dimensions: "26'6\" x 11'6\"", area: 304, facing: 'South' });
addPlot({ id: 157, block: 'R7', dimensions: "21' x 15'", area: 315, facing: 'South' });

// Sort plots by numeric ID where applicable, putting string IDs at the end
plots.sort((a, b) => {
  const aNum = parseInt(a.number, 10);
  const bNum = parseInt(b.number, 10);
  if (isNaN(aNum) && isNaN(bNum)) return a.number.localeCompare(b.number);
  if (isNaN(aNum)) return 1;
  if (isNaN(bNum)) return -1;
  return aNum - bNum;
});

export { plots };
