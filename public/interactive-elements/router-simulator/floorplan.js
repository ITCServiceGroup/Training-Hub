// Floorplan data and visual initialization logic for the Router Simulator

const padding = 20; // Define padding once, used in data

// Renamed from floorplan2Data - Based on provided floor plan image, scale ~12px/ft
const floorplan1Data = {
    // Room definitions (coordinates adjusted for visual centering of labels based on target image - Refined)
    // Centered with offsets: X+67, Y+85
    // Scaled by 1.2x around center (420, 370)
    rooms: [
        // Main living areas
        { name: "Living Room", x: 122, y: 208, width: 394, height: 276, zoneAttenuation: 0.1 }, // Renamed from Gathering Room
        { name: "Dining Room", x: 122, y: 490, width: 187, height: 216, zoneAttenuation: 0.1 }, // 13x15
        // { name: "Kitchen", x: 352, y: 235, width: 148, height: 223, zoneAttenuation: 0.1 }, // REMOVED - Merged into Gathering Room
        // { name: "Mud Rm.", x: 500, y: 458, width: 72, height: 72, zoneAttenuation: 0.15 }, // REMOVED
        { name: "Laundry", x: 401, y: 512, width: 115, height: 104, zoneAttenuation: 0.4 }, // Shifted down 30px (y=373+30), height adjusted (490-403=87)
        // { name: "Hidden Pantry", x: 452, y: 400, width: 48, height: 58, zoneAttenuation: 0.2 }, // REMOVED

        // Bedrooms and baths (Using names from target image)
        { name: "Master Bedroom", x: 122, y: 46, width: 389, height: 162, zoneAttenuation: 0.05 }, // Merged Outdoor Living + Master Suite
        { name: "Master Bath", x: 518, y: 46, width: 115, height: 115, zoneAttenuation: 0.4 }, // Renamed from Owner's Bath
        { name: "Closet", x: 638, y: 46, width: 86, height: 115, zoneAttenuation: 0.1 }, // Approx 6x8
        // { name: "CLO.", x: 502, y: 200, width: 48, height: 35, zoneAttenuation: 0.1 }, // REMOVED
        { name: "Bedroom Two", x: 518, y: 208, width: 158, height: 162, zoneAttenuation: 0.05 }, // Renamed from Suite Two
        { name: "Bathroom", x: 518, y: 370, width: 158, height: 86, zoneAttenuation: 0.4 }, // Centered: y=285, height=72 -> bottom=357
        { name: "Bedroom Three", x: 518, y: 456, width: 158, height: 180, zoneAttenuation: 0.05 }, // Renamed from Suite Three
        { name: "Entry", x: 310, y: 490, width: 86, height: 126, zoneAttenuation: 0.1 }, // Adjusted height for new bottom wall at y=490 (490-385=105), Reduced Attenuation
    ],
    // Explicit wall definitions (x1, y1, x2, y2) - Reorganized & Re-commented
    // Scaled by 1.2x around center (420, 370)
    walls: [
        // --- Outer Perimeter (Clockwise from Top-Left) ---
        { x1: 116, y1: 34, x2: 511, y2: 34, isExternal: true },    // Top (Master Bedroom)
        { x1: 511, y1: 34, x2: 626, y2: 34, isExternal: true },    // Top (Master Bath)
        { x1: 626, y1: 34, x2: 725, y2: 34, isExternal: true },    // Top (Wardrobe)
        { x1: 725, y1: 34, x2: 725, y2: 149, isExternal: true },   // Right (Wardrobe)
        { x1: 677, y1: 149, x2: 725, y2: 149, isExternal: true },  // Bottom Gap (Wardrobe/Bed 2)
        { x1: 677, y1: 149, x2: 677, y2: 370, isExternal: true },  // Right (Bedroom Two)
        { x1: 677, y1: 370, x2: 677, y2: 456, isExternal: true },  // Right (Bath)
        { x1: 677, y1: 456, x2: 677, y2: 678, isExternal: true },  // Right (Bedroom Three)
        { x1: 511, y1: 678, x2: 677, y2: 678, isExternal: true },  // Bottom (Bedroom Three)
        { x1: 396, y1: 616, x2: 511, y2: 616, isExternal: true },  // Bottom (Laundry Rm.)
        { x1: 310, y1: 616, x2: 396, y2: 616, isExternal: true },  // Bottom (Entry)
        { x1: 310, y1: 616, x2: 310, y2: 706, isExternal: true }, // Left (Dining Space Lower External)
        { x1: 116, y1: 706, x2: 310, y2: 706, isExternal: true },  // Bottom (Dining Space)
        { x1: 116, y1: 706, x2: 116, y2: 484, isExternal: true },  // Left (Dining Space)
        { x1: 116, y1: 484, x2: 116, y2: 208, isExternal: true },  // Left (Living Room)
        { x1: 116, y1: 208, x2: 116, y2: 34, isExternal: true },   // Left (Master Bedroom)
        { x1: 511, y1: 616, x2: 511, y2: 678, isExternal: true }, // Left (Bedroom Three Lower External)

        // --- Master Suite ---
        { x1: 116, y1: 208, x2: 463, y2: 208 },  // Master Bedroom Bottom / Living Room Top (Left Segment)
        { x1: 499, y1: 208, x2: 511, y2: 208 },  // Master Bedroom Bottom / Living Room Top (Right Segment)
        { x1: 511, y1: 34, x2: 511, y2: 50 },    // Master Bedroom Right / Master Bath Left (Top Segment)
        { x1: 511, y1: 86, x2: 511, y2: 149 },   // Master Bedroom Right / Master Bath Left (Bottom Segment) - Doorway Gap: y=50 to y=86
        { x1: 511, y1: 149, x2: 626, y2: 149 },  // Master Bath Bottom
        { x1: 626, y1: 34, x2: 626, y2: 94 },    // Master Bath Right / Wardrobe Left (Top Segment)
        { x1: 626, y1: 130, x2: 626, y2: 149 },  // Master Bath Right / Wardrobe Left (Bottom Segment) - Doorway Gap: y=94 to y=130
        { x1: 626, y1: 149, x2: 677, y2: 149 },  // Wardrobe Bottom

        // --- Living Room ---
        { x1: 116, y1: 484, x2: 177, y2: 484 },  // Living Room/Dining Space Wall (Left Segment)
        { x1: 249, y1: 484, x2: 310, y2: 484 },  // Living Room/Dining Space Wall (Right Segment)
        { x1: 451, y1: 244, x2: 451, y2: 440 },  // Kitchen / Hallway Left (Vertical Divider)

        // --- Dining Space & Entry ---
        { x1: 310, y1: 484, x2: 310, y2: 616 },  // Dining Space Right / Entry Left (Upper Internal)
        { x1: 396, y1: 512, x2: 396, y2: 616 },  // Entry Right / Laundry Left

        // --- Laundry Room ---
        { x1: 396, y1: 512, x2: 463, y2: 512 },  // Laundry Top (Left Segment)
        { x1: 499, y1: 512, x2: 511, y2: 512 },  // Laundry Top (Right Segment)

        // --- Bedroom Two & Closet ---
        { x1: 511, y1: 190, x2: 511, y2: 324 },  // Bedroom Two Left (Top Segment)
        { x1: 511, y1: 360, x2: 511, y2: 370 },  // Bedroom Two Left (Bottom Segment)
        { x1: 511, y1: 370, x2: 677, y2: 370 },  // Bedroom Two Bottom / Bath Top
        { x1: 511, y1: 149, x2: 511, y2: 190 },  // Closet Left (Bed 2)
        { x1: 511, y1: 190, x2: 558, y2: 190 },  // Closet Bottom (Bed 2 - Segment 1, widened gap)
        { x1: 630, y1: 190, x2: 677, y2: 190 },  // Closet Bottom (Bed 2 - Segment 2, widened gap) - Doorway Gap: x=558 to x=630

        // --- Bath ---
        { x1: 511, y1: 370, x2: 511, y2: 410 },  // Bath Left (Top Segment)
        { x1: 511, y1: 446, x2: 511, y2: 456 },  // Bath Left (Bottom Segment)
        { x1: 511, y1: 456, x2: 677, y2: 456 },  // Bath Bottom / Bedroom Three Top

        // --- Bedroom Three & Closet ---
        { x1: 511, y1: 456, x2: 511, y2: 466 },  // Bedroom Three Left (Top Segment)
        { x1: 511, y1: 502, x2: 511, y2: 616 },  // Bedroom Three Left (Bottom Segment)
        { x1: 511, y1: 636, x2: 558, y2: 636 },  // Closet Bottom (Bed 3 - Segment 1, widened gap)
        { x1: 630, y1: 636, x2: 677, y2: 636 },  // Closet Bottom (Bed 3 - Segment 2, widened gap) - Doorway Gap: x=558 to x=630
    ],
    fixedObstacles: [
        // Hallway Wall Obstacle (for attenuation)
        { type: "kitchenWall", x: 450, y: 244, width: 2, height: 196, attenuation: 0.7 }, // Renamed, Centered (was internalWall, x:451)
        // Laundry appliances (Moved into Laundry Rm.)
        { type: "washer", style: "outline", x: 404, y: 562, width: 42, height: 42, attenuation: 0.7 }, // Moved down 30px
        { type: "dryer", style: "outline", x: 452, y: 562, width: 42, height: 42, attenuation: 0.7 } // Moved down 30px
    ],
    interferenceSources: [
        // Positioned in main living areas
        { name: "bluetooth", x: 160, y: 376, radius: 84, attenuation: 0.5, active: false }, // Living Room center
        { name: "babyMonitor", x: 597, y: 289, radius: 96, attenuation: 0.3, active: false } // Bedroom Two center
    ],
    
    // Furniture definitions for the floorplan
    furniture: [
        // Kitchen Area - Island adjusted
        { type: "cabinet", x: 420, y: 244, width: 30, height: 196, rotation: 0, room: "Living Room", style: "filled", color: "#A1887F" }, // Upper cabinets along entire wall
        { type: "sink", x: 420, y: 300, width: 30, height: 30, rotation: 0, room: "Living Room", style: "filled" }, // Sink in counter
        { type: "range", x: 420, y: 350, width: 30, height: 30, rotation: 0, room: "Living Room", style: "filled" }, // Range in counter
        { type: "island", x: 340, y: 300, width: 40, height: 100, rotation: 0, room: "Living Room", style: "filled", color: "#A1887F" }, // Kitchen island made thinner and recentered
        
        // Living Room - Couches form L-shape, coffee table adjusted (Corrected Again)
        { type: "couch", x: 220, y: 250, width: 40, height: 120, rotation: 90, room: "Living Room", style: "filled", color: "#90A4AE" }, // Vertical couch
        { type: "couch", x: 230, y: 360, width: 100, height: 40, rotation: 90, room: "Living Room", style: "filled", color: "#90A4AE" }, // Horizontal couch, rotation 90, x adjusted
        { type: "coffeeTable", x: 200, y: 350, width: 40, height: 60, rotation: 0, room: "Living Room", style: "filled", color: "#D7CCC8" }, // Coffee table rotation 90, position adjusted
        { type: "tvStand", x: 117, y: 340, width: 25, height: 80, rotation: 0, room: "Living Room", style: "filled", color: "#8D6E63" }, // TV stand on left wall
        // { type: "tv", x: 118, y: 316, width: 8, height: 60, rotation: 0, room: "Living Room", style: "filled", color: "#263238" }, // TV on stand
        
        // Master Bedroom - Bed adjusted further off wall (Corrected Again)
        { type: "bed", x: 138, y: 60, width: 80, height: 120, rotation: 270, room: "Master Bedroom", style: "filled", color: "#A1887F" }, // Bed moved further right
        { type: "wardrobe", x: 300, y: 176, width: 80, height: 30, rotation: 0, room: "Master Bedroom", style: "filled", color: "#8D6E63" }, // Wardrobe against right wall
        
        // Master Bath - Rearranged fixtures
        { type: "counter", x: 530, y: 36, width: 90, height: 20, rotation: 0, room: "Master Bath", style: "filled", color: "#B0BEC5" }, // Counter with sink
        { type: "sink", x: 565, y: 36, width: 20, height: 15, rotation: 0, room: "Master Bath", style: "filled", color: "#ECEFF1" }, // Sink
        { type: "toilet", x: 580, y: 115, width: 20, height: 30, rotation: 180, room: "Master Bath", style: "filled", color: "#ECEFF1" }, // Toilet
        { type: "shower", x: 512, y: 108, width: 40, height: 40, rotation: 0, room: "Master Bath", style: "filled", color: "#B0BEC5" }, // Shower
        
        // Bedroom Two - Bed adjusted slightly off wall
        { type: "bed", x: 523, y: 230, width: 60, height: 80, rotation: 270, room: "Bedroom Two", style: "filled", color: "#A1887F" }, // Bed moved slightly right
        { type: "wardrobe", x: 610, y: 344, width: 60, height: 25, rotation: 0, room: "Bedroom Two", style: "filled", color: "#8D6E63" }, // Wardrobe against right wall
        
        // Bathroom - Rearranged fixtures
        { type: "counter", x: 530, y: 435, width: 60, height: 20, rotation: 0, room: "Bathroom", style: "filled", color: "#B0BEC5" }, // Counter with sink
        { type: "sink", x: 550, y: 440, width: 20, height: 15, rotation: 0, room: "Bathroom", style: "filled", color: "#ECEFF1" }, // Sink
        { type: "toilet", x: 650, y: 420, width: 20, height: 30, rotation: 90, room: "Bathroom", style: "filled", color: "#ECEFF1" }, // Toilet
        { type: "shower", x: 646, y: 371, width: 30, height: 40, rotation: 0, room: "Bathroom", style: "filled", color: "#B0BEC5" }, // Shower
        
        // Bedroom Three - Bed adjusted slightly off wall
        { type: "bed", x: 523, y: 520, width: 60, height: 80, rotation: 270, room: "Bedroom Three", style: "filled", color: "#A1887F" }, // Bed moved slightly right
        { type: "wardrobe", x: 633, y: 477, width: 60, height: 25, rotation:90, room: "Bedroom Three", style: "filled", color: "#8D6E63" }, // Wardrobe against right wall
        
        // Dining Room - Table rotated, lengthened, and repositioned, chairs adjusted (Corrected Again)
        { type: "diningTable", x: 180, y: 555, width: 60, height: 100, rotation: 0, room: "Dining Room", style: "filled", color: "#8D6E63" }, // Dining table rotation 90, lengthened, repositioned
        { type: "chair", x: 160, y: 560, width: 20, height: 20, rotation: 0, room: "Dining Room", style: "filled", color: "#90A4AE" }, // Chair 1 (Adjusted x, y)
        { type: "chair", x: 160, y: 595, width: 20, height: 20, rotation: 0, room: "Dining Room", style: "filled", color: "#90A4AE" }, // Chair 2 (Adjusted x, y)
        { type: "chair", x: 160, y: 630, width: 20, height: 20, rotation: 0, room: "Dining Room", style: "filled", color: "#90A4AE" }, // Chair 3 (Adjusted x, y)
        { type: "chair", x: 240, y: 560, width: 20, height: 20, rotation: 0, room: "Dining Room", style: "filled", color: "#90A4AE" }, // Chair 4 (Adjusted x, y)
        { type: "chair", x: 240, y: 595, width: 20, height: 20, rotation: 0, room: "Dining Room", style: "filled", color: "#90A4AE" }, // Chair 5 (Adjusted x, y)
        { type: "chair", x: 240, y: 630, width: 20, height: 20, rotation: 0, room: "Dining Room", style: "filled", color: "#90A4AE" }, // Chair 6 (Adjusted x, y)
    ]
};

// Export all floorplans (now only contains the one)
export const allFloorplans = {
    floor1: floorplan1Data
};

// Helper function to determine obstacle color (used for filled style)
function getObstacleColor(type) {
    switch(type) {
        case "refrigerator": return "#90A4AE"; // Grey blue
        case "washer": case "dryer": return "#B0BEC5"; // Lighter grey blue
        case "mirror": return "rgba(200, 200, 200, 0.8)"; // Light grey semi-transparent
        case "cabinet": return "#A1887F"; // Brown grey
        case "sink": return "#ECEFF1"; // Light grey
        case "range": return "#424242"; // Dark grey
        case "island": return "#A1887F"; // Brown grey
        case "couch": return "#90A4AE"; // Grey blue
        case "coffeeTable": return "#D7CCC8"; // Light brown
        case "tvStand": return "#8D6E63"; // Dark brown
        case "tv": return "#263238"; // Very dark grey
        case "bed": return "#A1887F"; // Brown grey
        case "wardrobe": return "#8D6E63"; // Dark brown
        case "counter": return "#B0BEC5"; // Lighter grey blue
        case "toilet": return "#ECEFF1"; // Light grey
        case "shower": return "#B0BEC5"; // Lighter grey blue
        case "diningTable": return "#8D6E63"; // Dark brown
        case "chair": return "#90A4AE"; // Grey blue
        default: return "#BDBDBD"; // Default grey
    }
}

// Helper function to determine obstacle border color (used for outline style)
function getObstacleBorderColor(type) {
     switch(type) {
        case "refrigerator": return "#546E7A"; // Darker Grey blue
        case "washer": case "dryer": return "#78909C"; // Medium Grey blue
        case "sink": return "#B0BEC5"; // Medium grey
        case "range": return "#212121"; // Very dark grey
        case "island": return "#8D6E63"; // Dark brown
        case "couch": return "#78909C"; // Medium grey blue
        case "coffeeTable": return "#BCAAA4"; // Medium brown
        case "tvStand": return "#6D4C41"; // Darker brown
        case "tv": return "#000000"; // Black
        case "bed": return "#8D6E63"; // Dark brown
        case "wardrobe": return "#6D4C41"; // Darker brown
        case "counter": return "#90A4AE"; // Medium grey blue
        case "toilet": return "#CFD8DC"; // Medium light grey
        case "shower": return "#90A4AE"; // Medium grey blue
        case "diningTable": return "#6D4C41"; // Darker brown
        case "chair": return "#78909C"; // Medium grey blue
        default: return "#666666"; // Default dark grey
    }
}

// Function to get SVG content for furniture based on type
function getFurnitureSVG(type, width, height, color) {
    const defaultColor = getObstacleColor(type);
    const fillColor = color || defaultColor;
    const strokeColor = getObstacleBorderColor(type);
    
    switch(type) {
        case "bed":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="5" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <rect x="${width*0.1}" y="0" width="${width*0.8}" height="${height*0.25}" rx="3" fill="#E0E0E0" stroke="${strokeColor}" stroke-width="1"/>`;
        
        case "couch":
            return `<rect x="0" y="${height*0.2}" width="${width}" height="${height*0.8}" rx="5" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <rect x="0" y="0" width="${width}" height="${height*0.2}" rx="3" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="0" y1="${height*0.2}" x2="${width}" y2="${height*0.2}" stroke="${strokeColor}" stroke-width="1"/>`;
        
        case "coffeeTable":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="${width*0.1}" y1="${height*0.5}" x2="${width*0.9}" y2="${height*0.5}" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="${width*0.5}" y1="${height*0.1}" x2="${width*0.5}" y2="${height*0.9}" stroke="${strokeColor}" stroke-width="1"/>`;
        
        case "tvStand":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <rect x="${width*0.1}" y="${height*0.2}" width="${width*0.35}" height="${height*0.6}" rx="1" fill="#424242" stroke="#212121" stroke-width="1"/>
                    <rect x="${width*0.55}" y="${height*0.2}" width="${width*0.35}" height="${height*0.6}" rx="1" fill="#424242" stroke="#212121" stroke-width="1"/>`;
        
        case "tv":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <rect x="${width*0.05}" y="${height*0.2}" width="${width*0.9}" height="${height*0.6}" rx="1" fill="#37474F" stroke="#263238" stroke-width="1"/>`;
        
        case "wardrobe":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="${width*0.5}" y1="0" x2="${width*0.5}" y2="${height}" stroke="${strokeColor}" stroke-width="1"/>
                    <circle cx="${width*0.25}" cy="${height*0.5}" r="2" fill="#CFD8DC"/>
                    <circle cx="${width*0.75}" cy="${height*0.5}" r="2" fill="#CFD8DC"/>`;
        
        case "cabinet":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="${width*0.33}" y1="0" x2="${width*0.33}" y2="${height}" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="${width*0.66}" y1="0" x2="${width*0.66}" y2="${height}" stroke="${strokeColor}" stroke-width="1"/>
                    <circle cx="${width*0.16}" cy="${height*0.5}" r="1.5" fill="#CFD8DC"/>
                    <circle cx="${width*0.5}" cy="${height*0.5}" r="1.5" fill="#CFD8DC"/>
                    <circle cx="${width*0.83}" cy="${height*0.5}" r="1.5" fill="#CFD8DC"/>`;
        
        case "sink":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <ellipse cx="${width*0.5}" cy="${height*0.5}" rx="${width*0.3}" ry="${height*0.3}" fill="#CFD8DC" stroke="${strokeColor}" stroke-width="1"/>
                    <circle cx="${width*0.5}" cy="${height*0.5}" r="2" fill="#90A4AE"/>`;
        
        case "range":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <circle cx="${width*0.25}" cy="${height*0.3}" r="${Math.min(width, height)*0.15}" fill="#CFD8DC" stroke="${strokeColor}" stroke-width="1"/>
                    <circle cx="${width*0.75}" cy="${height*0.3}" r="${Math.min(width, height)*0.15}" fill="#CFD8DC" stroke="${strokeColor}" stroke-width="1"/>
                    <circle cx="${width*0.25}" cy="${height*0.7}" r="${Math.min(width, height)*0.15}" fill="#CFD8DC" stroke="${strokeColor}" stroke-width="1"/>
                    <circle cx="${width*0.75}" cy="${height*0.7}" r="${Math.min(width, height)*0.15}" fill="#CFD8DC" stroke="${strokeColor}" stroke-width="1"/>`;
        
        case "island":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <rect x="${width*0.1}" y="${height*0.1}" width="${width*0.8}" height="${height*0.8}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="2,2"/>`;
        
        case "counter":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="0" y1="${height*0.5}" x2="${width}" y2="${height*0.5}" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="2,2"/>`;
        
        case "toilet":
            return `<rect x="0" y="0" width="${width}" height="${height*0.6}" rx="${width*0.5}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <rect x="${width*0.25}" y="${height*0.6}" width="${width*0.5}" height="${height*0.4}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>`;
        
        case "shower":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="0" y1="0" x2="${width}" y2="${height}" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="2,2"/>
                    <line x1="${width}" y1="0" x2="0" y2="${height}" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="2,2"/>
                    <circle cx="${width*0.8}" cy="${height*0.2}" r="3" fill="#78909C"/>`;
        
        case "diningTable":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <rect x="${width*0.1}" y="${height*0.1}" width="${width*0.8}" height="${height*0.8}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="3,3"/>`;
        
        case "chair":
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
                    <rect x="${width*0.2}" y="${height*0.2}" width="${width*0.6}" height="${height*0.6}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="2,2"/>`;
        
        default:
            return `<rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>`;
    }
}

// Exported function to initialize floorplan visuals (Refactored for explicit walls and styled obstacles)
export function initializeFloorplanVisuals(shadowRoot, currentFloorplanData) {
    const floorplanContainer = shadowRoot.getElementById("floorplan");
    const wallContainer = shadowRoot.getElementById("wallContainer");
    const fixedObstaclesContainer = shadowRoot.getElementById("fixedObstacles");
    const interferenceContainer = shadowRoot.getElementById("interferenceSources");
    const furnitureContainer = shadowRoot.getElementById("furniture") || 
                               (() => {
                                   const container = document.createElement("div");
                                   container.id = "furniture";
                                   container.style.position = "absolute";
                                   container.style.top = "0";
                                   container.style.left = "0";
                                   container.style.width = "100%";
                                   container.style.height = "100%";
                                   container.style.pointerEvents = "none";
                                   container.style.zIndex = "3"; // Above walls, below obstacles
                                   floorplanContainer.appendChild(container);
                                   return container;
                               })();

    if (!currentFloorplanData || !floorplanContainer || !wallContainer || !fixedObstaclesContainer || !interferenceContainer) {
        console.error("Missing elements or data for floorplan visual initialization.");
        return {}; // Return empty object if initialization fails
    }

    // Define constants for visual styling
    const wallThickness = 2; // Further reduced thickness
    const internalWallColor = "#333"; // Original wall color for internal walls
    const externalWallColor = "#0D47A1"; // Dark blue for external walls
    const obstacleStrokeWidth = 2;

    // Clear previous visual elements
    floorplanContainer.innerHTML = '';
    wallContainer.innerHTML = ''; // Clear previous walls (divs or svgs)
    fixedObstaclesContainer.innerHTML = '';
    interferenceContainer.innerHTML = '';
    const interferenceElements = {}; // Reset visual references

    // --- Draw Rooms and Labels (Keep using divs for background/labels) ---
    if (currentFloorplanData.rooms) {
        currentFloorplanData.rooms.forEach(room => {
            // Room background element (optional, could be removed if walls define everything)
            const roomElement = document.createElement("div");
            roomElement.className = "room"; // Use for potential background styling
            roomElement.style.position = "absolute";
            roomElement.style.left = room.x + "px";
            roomElement.style.top = room.y + "px";
            roomElement.style.width = room.width + "px";
            roomElement.style.height = room.height + "px";
            roomElement.style.pointerEvents = "none"; // Ensure it doesn't block interactions
            roomElement.style.zIndex = "1";
            // roomElement.style.backgroundColor = "rgba(200, 200, 200, 0.05)"; // Very light background if needed

            // Room Label
            const label = document.createElement("div");
            label.className = "room-label";
            label.textContent = room.name;
            // Basic label positioning (can be refined)
            label.style.left = (room.x + 5) + "px";
            label.style.top = (room.y + 5) + "px";
            label.style.zIndex = "5"; // Ensure labels are above obstacles/walls

            floorplanContainer.appendChild(roomElement);
            floorplanContainer.appendChild(label);
        });
    }

    // --- Draw Walls using SVG ---
    // Create SVG container if it doesn't exist or clear previous SVG lines
    let svgWallElement = wallContainer.querySelector('svg');
    if (!svgWallElement) {
        svgWallElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgWallElement.style.position = 'absolute';
        svgWallElement.style.top = '0';
        svgWallElement.style.left = '0';
        svgWallElement.style.width = '100%';
        svgWallElement.style.height = '100%';
        svgWallElement.style.pointerEvents = 'none'; // Don't interfere with drag events
        svgWallElement.style.zIndex = '2'; // Ensure walls are drawn above room backgrounds
        wallContainer.appendChild(svgWallElement);
    } else {
        svgWallElement.innerHTML = ''; // Clear previous lines
    }

    if (currentFloorplanData.walls) {
        // Draw explicit walls if they exist in the data
        currentFloorplanData.walls.forEach(wall => {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", wall.x1);
            line.setAttribute("y1", wall.y1);
            line.setAttribute("x2", wall.x2);
            line.setAttribute("y2", wall.y2);
            // Set stroke color based on whether the wall is external
            line.setAttribute("stroke", wall.isExternal ? externalWallColor : internalWallColor);
            line.setAttribute("stroke-width", wallThickness);
            line.setAttribute("stroke-linecap", "square"); // Use square line caps
            svgWallElement.appendChild(line);
        });
    } else if (currentFloorplanData.rooms) {
        // --- Fallback: Draw Walls from Room Boundaries (Original Logic adapted for SVG) ---
        // This keeps floorplan1 working without explicit walls for now.
        const uniqueWallSegments = new Set();
        currentFloorplanData.rooms.forEach(room => {
            const x1 = room.x; const y1 = room.y;
            const x2 = room.x + room.width; const y2 = room.y + room.height;
            uniqueWallSegments.add(`h-${x1}-${x2}-${y1}`); uniqueWallSegments.add(`h-${x1}-${x2}-${y2}`);
            uniqueWallSegments.add(`v-${x1}-${y1}-${y2}`); uniqueWallSegments.add(`v-${x2}-${y1}-${y2}`);
        });

        uniqueWallSegments.forEach(segmentKey => {
            const parts = segmentKey.split('-');
            const type = parts[0];
            const p1 = parseInt(parts[1], 10);
            const p2 = parseInt(parts[2], 10);
            const p3 = parseInt(parts[3], 10);
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

            if (type === 'h') { // Horizontal
                line.setAttribute("x1", p1); line.setAttribute("y1", p3);
                line.setAttribute("x2", p2); line.setAttribute("y2", p3);
            } else { // Vertical
                line.setAttribute("x1", p1); line.setAttribute("y1", p2);
                line.setAttribute("x2", p1); line.setAttribute("y2", p3);
            }
            // Fallback logic doesn't know about external walls, so use internal color
            line.setAttribute("stroke", internalWallColor);
            line.setAttribute("stroke-width", wallThickness);
            line.setAttribute("stroke-linecap", "square");
            svgWallElement.appendChild(line);
        });
    }


    // --- Add fixed obstacle visuals ---
    if (currentFloorplanData.fixedObstacles) {
        currentFloorplanData.fixedObstacles.forEach(obstacle => {
            const element = document.createElement("div");
            element.className = "fixed-obstacle"; // General class
            element.style.position = "absolute";
            element.style.left = obstacle.x + "px";
            element.style.top = obstacle.y + "px";
            element.style.width = obstacle.width + "px";
            element.style.height = obstacle.height + "px";
            element.style.pointerEvents = "none";
            element.style.zIndex = '4'; // Above walls, below labels/devices
            element.title = obstacle.type; // Tooltip

            if (obstacle.style === 'outline') {
                // Draw outline style
                element.style.border = `${obstacleStrokeWidth}px solid ${getObstacleBorderColor(obstacle.type)}`;
                element.style.backgroundColor = 'transparent'; // No fill
                // Add text label inside if applicable (e.g., W/D)
                if (obstacle.type === 'washer' || obstacle.type === 'dryer') {
                     element.style.display = 'flex';
                     element.style.alignItems = 'center';
                     element.style.justifyContent = 'center';
                     element.style.fontSize = '14px'; // Adjust as needed
                     element.style.fontWeight = 'bold';
                     element.style.color = getObstacleBorderColor(obstacle.type);
                     element.textContent = obstacle.type === 'washer' ? 'W' : 'D';
                }
            } else {
                // Draw filled style (original logic)
                element.style.backgroundColor = getObstacleColor(obstacle.type);
                if (obstacle.type === 'washer' || obstacle.type === 'dryer') {
                     element.style.display = 'flex';
                     element.style.alignItems = 'center';
                     element.style.justifyContent = 'center';
                     element.style.fontSize = '14px';
                     element.style.fontWeight = 'bold';
                     element.style.color = 'rgba(0, 0, 0, 0.6)';
                     element.textContent = obstacle.type === 'washer' ? 'W' : 'D';
                }
                 if (obstacle.type === 'refrigerator') { element.style.zIndex = '5'; } // Ensure fridge is high enough
            }

            // Make kitchenWall obstacle transparent
            if (obstacle.type === 'kitchenWall') {
                element.style.backgroundColor = 'transparent';
            }

            fixedObstaclesContainer.appendChild(element);
        });
    }
    
    // --- Add furniture visuals ---
    if (currentFloorplanData.furniture) {
        // Clear previous furniture
        furnitureContainer.innerHTML = '';
        
        // Create SVG container for all furniture
        const svgFurniture = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgFurniture.style.position = 'absolute';
        svgFurniture.style.top = '0';
        svgFurniture.style.left = '0';
        svgFurniture.style.width = '100%';
        svgFurniture.style.height = '100%';
        svgFurniture.style.pointerEvents = 'none';
        svgFurniture.style.zIndex = '3';
        
        // Add each furniture item to the SVG
        currentFloorplanData.furniture.forEach(furniture => {
            // Create a group for this furniture item
            const furnitureGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            
            // Set position and rotation
            let transform = `translate(${furniture.x}, ${furniture.y})`;
            if (furniture.rotation && furniture.rotation !== 0) {
                // For rotation, we need to rotate around the center of the furniture
                const centerX = furniture.width / 2;
                const centerY = furniture.height / 2;
                transform += ` rotate(${furniture.rotation}, ${centerX}, ${centerY})`;
            }
            furnitureGroup.setAttribute("transform", transform);
            
            // Get the SVG content for this furniture type
            const svgContent = getFurnitureSVG(furniture.type, furniture.width, furniture.height, furniture.color);
            
            // Set the SVG content
            furnitureGroup.innerHTML = svgContent;
            
            // Add the furniture group to the SVG container
            svgFurniture.appendChild(furnitureGroup);
        });
        
        // Add the SVG container to the furniture container
        furnitureContainer.appendChild(svgFurniture);
    }

    // --- Add interference source visuals and store references ---
     if (currentFloorplanData.interferenceSources) {
        currentFloorplanData.interferenceSources.forEach(source => {
            const element = document.createElement("div");
            element.className = 'interference-source interference-' + source.name;
            const visualX = source.x - source.radius;
            const visualY = source.y - source.radius;

            element.style.width = (source.radius * 2) + "px";
            element.style.height = (source.radius * 2) + "px";
            element.style.willChange = "transform";
            element.style.transformOrigin = "center center";
            element.style.position = "absolute"; // Ensure position is absolute
            element.style.left = "0px"; // Position with transform
            element.style.top = "0px";  // Position with transform
            element.style.transform = `translate(${visualX}px, ${visualY}px)`;

            // Store positions for reference
            source.initialX = source.x; source.initialY = source.y;
            source.visualX = visualX; source.visualY = visualY;

            if (source.active) {
                element.classList.add("active");
            }

            interferenceContainer.appendChild(element);
            interferenceElements[source.name] = element; // Store reference
        });
    }

    // Return the map of interference elements for the main component to use
    return interferenceElements;
}
