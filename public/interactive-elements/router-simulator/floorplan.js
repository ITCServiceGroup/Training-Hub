// Floorplan data and visual initialization logic for the Router Simulator

const padding = 20; // Define padding once, used in data

// Renamed from floorplan2Data - Based on provided floor plan image, scale ~12px/ft
const floorplan1Data = {
    name: "Single-Story Home",
    label: "Floorplan 1",
    defaultRouterPosition: { x: 142, y: 350 },
    extenderPlacements: {
        1: { room: "Living Room", anchorX: 0.66, anchorY: 0.5 },
        2: { room: "Dining Room", anchorX: 0.5, anchorY: 0.5 }
    },
    placementAdvice: "Drag the router to test different positions in this home layout. The heatmap shows signal strength considering walls, appliances, and active interference sources.",
    // Room definitions - ADJUSTED to match wall positions exactly
    // Coordinates now match the wall positions precisely to fix signal attenuation issues
    rooms: [
        // Main living areas
        { name: "Living Room", x: 116, y: 208, width: 395, height: 276, zoneAttenuation: 0.1 }, // Adjusted to match walls exactly
        { name: "Dining Room", x: 116, y: 484, width: 194, height: 222, zoneAttenuation: 0.1 }, // Adjusted to match walls exactly
        { name: "Laundry", x: 396, y: 512, width: 115, height: 104, zoneAttenuation: 0.4 }, // Adjusted to match walls exactly

        // Bedrooms and baths
        { name: "Master Bedroom", x: 116, y: 34, width: 395, height: 174, zoneAttenuation: 0.05 }, // Adjusted to match walls exactly
        { name: "Master Bath", x: 511, y: 34, width: 115, height: 115, zoneAttenuation: 0.4 }, // Adjusted to match walls exactly
        { name: "Closet", x: 626, y: 34, width: 99, height: 115, zoneAttenuation: 0.1 }, // Adjusted to match walls exactly
        { name: "Bedroom Two", x: 511, y: 149, width: 166, height: 221, zoneAttenuation: 0.05 }, // Adjusted to match walls exactly
        { name: "Bathroom", x: 511, y: 370, width: 166, height: 86, zoneAttenuation: 0.4 }, // Adjusted to match walls exactly
        { name: "Bedroom Three", x: 511, y: 456, width: 166, height: 222, zoneAttenuation: 0.05 }, // Adjusted to match walls exactly
        { name: "Entry", x: 310, y: 484, width: 86, height: 132, zoneAttenuation: 0.1 }, // Adjusted to match walls exactly
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
        /* FIXED_OBSTACLES_START:floor1 */
        // Hallway Wall Obstacle (for attenuation)
        { type: "kitchenWall", x: 450, y: 244, width: 2, height: 196, attenuation: 0.7 }, // Renamed, Centered (was internalWall, x:451)
        // Laundry appliances (Moved into Laundry Rm.)
        { type: "washer", style: "outline", x: 404, y: 562, width: 42, height: 42, attenuation: 0.7 }, // Moved down 30px
        { type: "dryer", style: "outline", x: 452, y: 562, width: 42, height: 42, attenuation: 0.7 } // Moved down 30px
        /* FIXED_OBSTACLES_END:floor1 */
    ],
    interferenceSources: [
        // Positioned in main living areas
        { name: "bluetooth", x: 160, y: 376, radius: 84, attenuation: 0.5, active: false }, // Living Room center
        { name: "babyMonitor", x: 597, y: 289, radius: 96, attenuation: 0.3, active: false } // Bedroom Two center
    ],

    // Furniture definitions for the floorplan
    furniture: [
        /* FURNITURE_START:floor1 */
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
        /* FURNITURE_END:floor1 */
    ]
};

const floorplan2Data = {
    name: "Hallway Apartment",
    label: "Floorplan 2",
    defaultRouterPosition: { x: 108, y: 510 },
    extenderPlacements: {
        1: { room: "Primary Bedroom", anchorX: 0.78, anchorY: 0.72 },
        2: { room: "Nursery", anchorX: 0.55, anchorY: 0.52 }
    },
    placementAdvice: "The router starts in the living room, but this apartment still has a long hallway and a tucked-away nursery. Move the router toward the center spine and compare that against the default living room placement.",
    rooms: [
        { name: "Bedroom One", x: 80, y: 40, width: 190, height: 180, zoneAttenuation: 0.05 },
        { name: "Bathroom", x: 270, y: 40, width: 110, height: 180, zoneAttenuation: 0.4 },
        { name: "Primary Bedroom", x: 380, y: 40, width: 270, height: 180, zoneAttenuation: 0.05 },
        { name: "Primary Bath", x: 650, y: 40, width: 110, height: 180, zoneAttenuation: 0.4 },
        { name: "Hallway", x: 80, y: 220, width: 680, height: 120, zoneAttenuation: 0.08 },
        { name: "Living Room", x: 80, y: 340, width: 300, height: 340, zoneAttenuation: 0.1 },
        { name: "Dining Room", x: 380, y: 340, width: 180, height: 150, zoneAttenuation: 0.1 },
        { name: "Kitchen", x: 560, y: 340, width: 200, height: 220, zoneAttenuation: 0.2 },
        { name: "Nursery", x: 380, y: 490, width: 180, height: 190, zoneAttenuation: 0.05 },
        { name: "Laundry", x: 560, y: 560, width: 200, height: 120, zoneAttenuation: 0.4 }
    ],
    walls: [
        // --- Outer Perimeter ---
        { x1: 80, y1: 40, x2: 760, y2: 40, isExternal: true },
        { x1: 760, y1: 40, x2: 760, y2: 680, isExternal: true },
        { x1: 760, y1: 680, x2: 80, y2: 680, isExternal: true },
        { x1: 80, y1: 680, x2: 80, y2: 40, isExternal: true },

        // --- Top Row Dividers ---
        { x1: 270, y1: 40, x2: 270, y2: 220 },
        { x1: 380, y1: 40, x2: 380, y2: 220 },
        { x1: 650, y1: 40, x2: 650, y2: 92 },
        { x1: 650, y1: 128, x2: 650, y2: 220 },

        // --- Top Row to Hallway ---
        { x1: 80, y1: 220, x2: 150, y2: 220 },
        { x1: 190, y1: 220, x2: 270, y2: 220 },
        { x1: 270, y1: 220, x2: 305, y2: 220 },
        { x1: 345, y1: 220, x2: 380, y2: 220 },
        { x1: 380, y1: 220, x2: 500, y2: 220 },
        { x1: 540, y1: 220, x2: 760, y2: 220 },

        // --- Hallway to Lower Rooms ---
        { x1: 80, y1: 340, x2: 210, y2: 340 },
        { x1: 250, y1: 340, x2: 380, y2: 340 },
        { x1: 380, y1: 340, x2: 450, y2: 340 },
        { x1: 490, y1: 340, x2: 560, y2: 340 },
        { x1: 560, y1: 340, x2: 640, y2: 340 },
        { x1: 680, y1: 340, x2: 760, y2: 340 },

        // --- Lower Room Dividers ---
        { x1: 380, y1: 340, x2: 380, y2: 560 },
        { x1: 380, y1: 600, x2: 380, y2: 680 },
        { x1: 560, y1: 340, x2: 560, y2: 680 },

        // --- Lower Secondary Split with Door Gaps ---
        { x1: 380, y1: 490, x2: 560, y2: 490 },
        { x1: 560, y1: 560, x2: 620, y2: 560 },
        { x1: 660, y1: 560, x2: 760, y2: 560 }
    ],
    fixedObstacles: [
        /* FIXED_OBSTACLES_START:floor2 */
        {"type":"kitchenWall","x":614,"y":352,"width":2,"height":184,"attenuation":0.7},
        {"type":"refrigerator","x":712,"y":338,"width":40,"height":50,"attenuation":0.75,"rotation":270},
        {"type":"washer","style":"outline","x":663,"y":566,"width":42,"height":42,"attenuation":0.7},
        {"type":"dryer","style":"outline","x":710,"y":566,"width":42,"height":42,"attenuation":0.7}
        /* FIXED_OBSTACLES_END:floor2 */
    ],
    interferenceSources: [
        { name: "bluetooth", x: 314, y: 486, radius: 90, attenuation: 0.5, active: false },
        { name: "babyMonitor", x: 464, y: 586, radius: 96, attenuation: 0.3, active: false }
    ],
    furniture: [
        /* FURNITURE_START:floor2 */
        {"type":"bed","x":101,"y":65,"width":84,"height":120,"rotation":270,"room":"Bedroom One","style":"filled","color":"#A1887F"},
        {"type":"wardrobe","x":243,"y":79,"width":22,"height":88,"rotation":0,"room":"Bedroom One","style":"filled","color":"#8D6E63"},
        {"type":"counter","x":318,"y":157,"width":92,"height":24,"rotation":90,"room":"Bathroom","style":"filled","color":"#B0BEC5"},
        {"type":"sink","x":314,"y":54,"width":24,"height":18,"rotation":0,"room":"Bathroom","style":"filled","color":"#ECEFF1"},
        {"type":"shower","x":275,"y":43,"width":42,"height":42,"rotation":0,"room":"Bathroom","style":"filled","color":"#B0BEC5"},
        {"type":"toilet","x":347,"y":45,"width":22,"height":30,"rotation":180,"room":"Bathroom","style":"filled","color":"#ECEFF1"},
        {"type":"bed","x":405,"y":64,"width":96,"height":134,"rotation":270,"room":"Primary Bedroom","style":"filled","color":"#A1887F"},
        {"type":"wardrobe","x":575,"y":7,"width":22,"height":96,"rotation":270,"room":"Primary Bedroom","style":"filled","color":"#8D6E63"},
        {"type":"coffeeTable","x":573,"y":188,"width":52,"height":28,"rotation":0,"room":"Primary Bedroom","style":"filled","color":"#D7CCC8"},
        {"type":"counter","x":699,"y":79,"width":90,"height":22,"rotation":90,"room":"Primary Bath","style":"filled","color":"#B0BEC5"},
        {"type":"sink","x":694,"y":56,"width":22,"height":16,"rotation":0,"room":"Primary Bath","style":"filled","color":"#ECEFF1"},
        {"type":"shower","x":654,"y":175,"width":40,"height":40,"rotation":0,"room":"Primary Bath","style":"filled","color":"#B0BEC5"},
        {"type":"toilet","x":728,"y":186,"width":22,"height":30,"rotation":0,"room":"Primary Bath","style":"filled","color":"#ECEFF1"},
        {"type":"couch","x":187,"y":534,"width":138,"height":48,"rotation":90,"room":"Living Room","style":"filled","color":"#90A4AE"},
        {"type":"couch","x":201,"y":409,"width":48,"height":110,"rotation":90,"room":"Living Room","style":"filled","color":"#90A4AE"},
        {"type":"coffeeTable","x":141,"y":519,"width":56,"height":72,"rotation":0,"room":"Living Room","style":"filled","color":"#D7CCC8"},
        {"type":"tvStand","x":84,"y":500,"width":24,"height":112,"rotation":0,"room":"Living Room","style":"filled","color":"#8D6E63"},
        {"type":"diningTable","x":438,"y":378,"width":68,"height":88,"rotation":0,"room":"Dining Room","style":"filled","color":"#8D6E63"},
        {"type":"chair","x":417,"y":386,"width":20,"height":20,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"chair","x":417,"y":414,"width":20,"height":20,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"chair","x":507,"y":385,"width":20,"height":20,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"chair","x":507,"y":412,"width":20,"height":20,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"chair","x":417,"y":442,"width":20,"height":20,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"chair","x":507,"y":441,"width":20,"height":20,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"cabinet","x":563,"y":362,"width":44,"height":184,"rotation":0,"room":"Kitchen","style":"filled","color":"#A1887F"},
        {"type":"sink","x":563,"y":404,"width":44,"height":30,"rotation":0,"room":"Kitchen","style":"filled"},
        {"type":"range","x":563,"y":475,"width":44,"height":34,"rotation":0,"room":"Kitchen","style":"filled"},
        {"type":"island","x":626,"y":419,"width":92,"height":56,"rotation":90,"room":"Kitchen","style":"filled","color":"#A1887F"},
        {"type":"crib","x":447,"y":603,"width":64,"height":88,"rotation":270,"room":"Nursery","style":"filled","color":"#D7CCC8"},
        {"type":"wardrobe","x":535,"y":510,"width":22,"height":88,"rotation":0,"room":"Nursery","style":"filled","color":"#8D6E63"},
        {"type":"counter","x":583,"y":657,"width":150,"height":20,"rotation":0,"room":"Laundry","style":"filled","color":"#B0BEC5"},
        {"type":"sink","x":648,"y":661,"width":24,"height":14,"rotation":0,"room":"Laundry","style":"filled","color":"#ECEFF1"}
        /* FURNITURE_END:floor2 */
    ]
};

const floorplan3Data = {
    name: "Ranch Home with Garage",
    label: "Floorplan 3",
    defaultRouterPosition: { x: 108, y: 138 },
    wallThickness: 5,
    internalWallColor: "#111111",
    externalWallColor: "#111111",
    extenderPlacements: {
        1: { room: "Primary Bedroom", anchorX: 0.52, anchorY: 0.5 },
        2: { room: "Bedroom Two", anchorX: 0.52, anchorY: 0.5 }
    },
    placementAdvice: "This L-shaped ranch has a recessed entry, a garage wing, and a separate bedroom hall, so signal has to travel around a broken footprint instead of one straight corridor. Start in the great room, then compare that with placements near the hallway and entry.",
    rooms: [
        { name: "Great Room", x: 80, y: 70, width: 300, height: 250, zoneAttenuation: 0.08 },
        { name: "Kitchen", x: 380, y: 70, width: 190, height: 160, zoneAttenuation: 0.16 },
        { name: "Dining Room", x: 380, y: 230, width: 190, height: 90, zoneAttenuation: 0.1 },
        { name: "Primary Bedroom", x: 570, y: 70, width: 220, height: 180, zoneAttenuation: 0.05 },
        { name: "Bath", x: 570, y: 250, width: 110, height: 80, zoneAttenuation: 0.38 },
        { name: "Closet", x: 680, y: 250, width: 110, height: 80, zoneAttenuation: 0.08 },
        { name: "Hallway", x: 220, y: 330, width: 570, height: 100, zoneAttenuation: 0.08 },
        { name: "Bedroom One", x: 80, y: 430, width: 210, height: 120, zoneAttenuation: 0.05 },
        { name: "Bedroom Two", x: 80, y: 550, width: 210, height: 120, zoneAttenuation: 0.05 },
        { name: "Hall", x: 290, y: 430, width: 70, height: 240, labelX: 300, labelY: 455, zoneAttenuation: 0.08 },
        { name: "Bathroom", x: 360, y: 430, width: 140, height: 100, zoneAttenuation: 0.38 },
        { name: "Office", x: 360, y: 530, width: 140, height: 140, zoneAttenuation: 0.08 },
        { name: "Entry", x: 500, y: 430, width: 60, height: 170, labelX: 507, labelY: 540, zoneAttenuation: 0.08 },
        { name: "Laundry", x: 560, y: 430, width: 100, height: 90, labelX: 585, labelY: 445, zoneAttenuation: 0.38 },
        { name: "Garage", x: 560, y: 520, width: 230, height: 150, labelX: 680, labelY: 545, zoneAttenuation: 0.2 }
    ],
    walls: [
        // --- Outer Perimeter ---
        { x1: 80, y1: 70, x2: 790, y2: 70, isExternal: true },
        { x1: 790, y1: 70, x2: 790, y2: 670, isExternal: true },
        { x1: 80, y1: 670, x2: 500, y2: 670, isExternal: true },
        { x1: 500, y1: 600, x2: 500, y2: 670, isExternal: true },
        { x1: 500, y1: 600, x2: 515, y2: 600, isExternal: true },
        { x1: 545, y1: 600, x2: 560, y2: 600, isExternal: true },
        { x1: 560, y1: 600, x2: 560, y2: 670, isExternal: true },
        { x1: 560, y1: 670, x2: 650, y2: 670, isExternal: true },
        { x1: 750, y1: 670, x2: 790, y2: 670, isExternal: true },
        { x1: 80, y1: 70, x2: 80, y2: 670, isExternal: true },

        // --- Public Rooms and Primary Suite ---
        { x1: 380, y1: 70, x2: 380, y2: 230 },
        { x1: 380, y1: 270, x2: 380, y2: 330 },
        { x1: 570, y1: 70, x2: 570, y2: 190 },
        { x1: 570, y1: 230, x2: 570, y2: 330 },
        { x1: 570, y1: 250, x2: 640, y2: 250 },
        { x1: 680, y1: 250, x2: 720, y2: 250 },
        { x1: 760, y1: 250, x2: 790, y2: 250 },
        { x1: 680, y1: 250, x2: 680, y2: 330 },

        // --- Hallway Connections ---
        { x1: 80, y1: 330, x2: 220, y2: 330 },
        { x1: 280, y1: 330, x2: 455, y2: 330 },
        { x1: 515, y1: 330, x2: 570, y2: 330 },
        { x1: 570, y1: 330, x2: 635, y2: 330 },
        { x1: 675, y1: 330, x2: 790, y2: 330 },
        { x1: 80, y1: 430, x2: 125, y2: 430 },
        { x1: 170, y1: 430, x2: 290, y2: 430 },
        { x1: 360, y1: 430, x2: 405, y2: 430 },
        { x1: 455, y1: 430, x2: 500, y2: 430 },
        { x1: 560, y1: 430, x2: 600, y2: 430 },
        { x1: 640, y1: 430, x2: 790, y2: 430 },

        // --- Bedroom Wing ---
        { x1: 290, y1: 430, x2: 290, y2: 470 },
        { x1: 290, y1: 510, x2: 290, y2: 590 },
        { x1: 290, y1: 630, x2: 290, y2: 670 },
        { x1: 80, y1: 550, x2: 290, y2: 550 },
        { x1: 360, y1: 430, x2: 360, y2: 470 },
        { x1: 360, y1: 510, x2: 360, y2: 570 },
        { x1: 360, y1: 610, x2: 360, y2: 670 },
        { x1: 360, y1: 530, x2: 500, y2: 530 },

        // --- Service Rooms, Entry, and Garage ---
        { x1: 500, y1: 430, x2: 500, y2: 520 },
        { x1: 500, y1: 520, x2: 500, y2: 600 },
        { x1: 560, y1: 430, x2: 560, y2: 600 },
        { x1: 660, y1: 430, x2: 660, y2: 520 },
        { x1: 560, y1: 520, x2: 595, y2: 520 },
        { x1: 635, y1: 520, x2: 660, y2: 520 }
    ],
    fixedObstacles: [
        /* FIXED_OBSTACLES_START:floor3 */
        {"type":"refrigerator","x":528,"y":68,"width":36,"height":44,"attenuation":0.75,"rotation":270},
        {"type":"washer","style":"outline","x":563,"y":485,"width":32,"height":32,"attenuation":0.7},
        {"type":"dryer","style":"outline","x":563,"y":436,"width":32,"height":32,"attenuation":0.7}
        /* FIXED_OBSTACLES_END:floor3 */
    ],
    interferenceSources: [
        { name: "bluetooth", x: 194, y: 218, radius: 90, attenuation: 0.5, active: false },
        { name: "babyMonitor", x: 146, y: 622, radius: 96, attenuation: 0.3, active: false }
    ],
    furniture: [
        /* FURNITURE_START:floor3 */
        {"type":"couch","x":143,"y":236,"width":130,"height":38,"rotation":180,"room":"Great Room","style":"filled","color":"#90A4AE"},
        {"type":"couch","x":234,"y":120,"width":38,"height":115,"rotation":0,"room":"Great Room","style":"filled","color":"#90A4AE"},
        {"type":"coffeeTable","x":135,"y":156,"width":72,"height":40,"rotation":90,"room":"Great Room","style":"filled","color":"#D7CCC8"},
        {"type":"tvStand","x":84,"y":128,"width":24,"height":105,"rotation":0,"room":"Great Room","style":"filled","color":"#8D6E63"},
        {"type":"cabinet","x":466,"y":40,"width":24,"height":90,"rotation":270,"room":"Kitchen","style":"filled","color":"#A1887F"},
        {"type":"sink","x":490,"y":74,"width":24,"height":24,"rotation":0,"room":"Kitchen","style":"filled","color":"#ECEFF1"},
        {"type":"range","x":443,"y":73,"width":24,"height":26,"rotation":0,"room":"Kitchen","style":"filled"},
        {"type":"island","x":427,"y":143,"width":82,"height":38,"rotation":0,"room":"Kitchen","style":"filled","color":"#A1887F"},
        {"type":"diningTable","x":449,"y":239,"width":56,"height":58,"rotation":0,"room":"Dining Room","style":"filled","color":"#8D6E63"},
        {"type":"chair","x":427,"y":243,"width":18,"height":18,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"chair","x":426,"y":275,"width":18,"height":18,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"chair","x":509,"y":245,"width":18,"height":18,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"chair","x":509,"y":274,"width":18,"height":18,"rotation":0,"room":"Dining Room","style":"filled","color":"#90A4AE"},
        {"type":"bed","x":650,"y":75,"width":86,"height":108,"rotation":0,"room":"Primary Bedroom","style":"filled","color":"#A1887F"},
        {"type":"wardrobe","x":574,"y":79,"width":22,"height":96,"rotation":0,"room":"Primary Bedroom","style":"filled","color":"#8D6E63"},
        {"type":"coffeeTable","x":751,"y":212,"width":46,"height":24,"rotation":90,"room":"Primary Bedroom","style":"filled","color":"#D7CCC8"},
        {"type":"counter","x":639,"y":277,"width":58,"height":18,"rotation":90,"room":"Bath","style":"filled","color":"#B0BEC5"},
        {"type":"sink","x":658,"y":277,"width":20,"height":14,"rotation":90,"room":"Bath","style":"filled","color":"#ECEFF1"},
        {"type":"shower","x":575,"y":297,"width":34,"height":28,"rotation":0,"room":"Bath","style":"filled","color":"#B0BEC5"},
        {"type":"toilet","x":575,"y":252,"width":22,"height":26,"rotation":90,"room":"Bath","style":"filled","color":"#ECEFF1"},
        {"type":"wardrobe","x":704,"y":307,"width":70,"height":20,"rotation":0,"room":"Closet","style":"filled","color":"#8D6E63"},
        {"type":"bed","x":155,"y":463,"width":82,"height":84,"rotation":180,"room":"Bedroom One","style":"filled","color":"#A1887F"},
        {"type":"wardrobe","x":84,"y":447,"width":22,"height":84,"rotation":0,"room":"Bedroom One","style":"filled","color":"#8D6E63"},
        {"type":"bed","x":88,"y":570,"width":82,"height":90,"rotation":270,"room":"Bedroom Two","style":"filled","color":"#A1887F"},
        {"type":"wardrobe","x":231,"y":611,"width":22,"height":88,"rotation":90,"room":"Bedroom Two","style":"filled","color":"#8D6E63"},
        {"type":"counter","x":363,"y":508,"width":62,"height":18,"rotation":0,"room":"Bathroom","style":"filled","color":"#B0BEC5"},
        {"type":"sink","x":382,"y":510,"width":20,"height":14,"rotation":0,"room":"Bathroom","style":"filled","color":"#ECEFF1"},
        {"type":"toilet","x":465,"y":501,"width":22,"height":26,"rotation":0,"room":"Bathroom","style":"filled","color":"#ECEFF1"},
        {"type":"shower","x":463,"y":434,"width":34,"height":24,"rotation":0,"room":"Bathroom","style":"filled","color":"#B0BEC5"},
        {"type":"counter","x":384,"y":645,"width":90,"height":24,"rotation":0,"room":"Office","style":"filled","color":"#B0BEC5"},
        {"type":"chair","x":474,"y":534,"width":22,"height":22,"rotation":0,"room":"Office","style":"filled","color":"#90A4AE"},
        {"type":"counter","x":621,"y":471,"width":56,"height":16,"rotation":90,"room":"Laundry","style":"filled","color":"#B0BEC5"},
        {"type":"sink","x":638,"y":473,"width":24,"height":16,"rotation":90,"room":"Laundry","style":"filled","color":"#ECEFF1"},
        {"type":"cabinet","x":663,"y":433,"width":124,"height":18,"rotation":0,"room":"Garage","style":"filled","color":"#A1887F"}
        /* FURNITURE_END:floor3 */
    ]
};

// Export all floorplans
export const allFloorplans = {
    floor1: floorplan1Data,
    floor2: floorplan2Data,
    floor3: floorplan3Data
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
        case "crib": return "#D7CCC8"; // Light wood
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
        case "crib": return "#BCAAA4"; // Medium brown
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

        case "crib":
            return `<rect x="${width*0.04}" y="${height*0.04}" width="${width*0.92}" height="${height*0.92}" rx="4" fill="rgba(215, 204, 200, 0.16)" stroke="${strokeColor}" stroke-width="2"/>
                    <rect x="${width*0.14}" y="${height*0.14}" width="${width*0.72}" height="${height*0.72}" rx="3" fill="${fillColor}" fill-opacity="0.55" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="${width*0.12}" y1="${height*0.26}" x2="${width*0.88}" y2="${height*0.26}" stroke="${strokeColor}" stroke-width="1"/>
                    <line x1="${width*0.12}" y1="${height*0.74}" x2="${width*0.88}" y2="${height*0.74}" stroke="${strokeColor}" stroke-width="1"/>`;

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
export function initializeFloorplanVisuals(shadowRoot, currentFloorplanData, options = {}) {
    const { devMode = false } = options;
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
                                   container.style.pointerEvents = devMode ? "auto" : "none";
                                   container.style.zIndex = "3"; // Above walls, below obstacles
                                   floorplanContainer.appendChild(container);
                                   return container;
                               })();

    if (!currentFloorplanData || !floorplanContainer || !wallContainer || !fixedObstaclesContainer || !interferenceContainer) {
        console.error("Missing elements or data for floorplan visual initialization.");
        return {}; // Return empty object if initialization fails
    }

    // Define constants for visual styling
    const wallThickness = currentFloorplanData.wallThickness || 4;
    const internalWallColor = currentFloorplanData.internalWallColor || "#444";
    const externalWallColor = currentFloorplanData.externalWallColor || "#0D47A1";
    const obstacleStrokeWidth = 2;
    const plainLabels = currentFloorplanData.plainLabels === true;
    const defaultLabelAnchor = currentFloorplanData.labelAnchor || 'top-left';

    // Clear previous visual elements
    floorplanContainer.innerHTML = '';
    wallContainer.innerHTML = ''; // Clear previous walls (divs or svgs)
    fixedObstaclesContainer.innerHTML = '';
    interferenceContainer.innerHTML = '';
    const interferenceElements = {}; // Reset visual references

    // --- Create SVG container for both rooms and walls ---
    // Clear previous containers
    wallContainer.innerHTML = '';

    // Create a single SVG container for both rooms and walls
    const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgContainer.style.position = 'absolute';
    svgContainer.style.top = '0';
    svgContainer.style.left = '0';
    svgContainer.style.width = '100%';
    svgContainer.style.height = '100%';
    svgContainer.style.pointerEvents = 'none'; // Don't interfere with drag events
    svgContainer.style.zIndex = '2'; // Ensure proper stacking
    wallContainer.appendChild(svgContainer);

    // --- Only draw room labels, no backgrounds ---
    if (currentFloorplanData.rooms) {
        currentFloorplanData.rooms.forEach(room => {
            // Room Label (using div for text)
            const label = document.createElement("div");
            label.className = "room-label";
            label.textContent = room.displayName || room.name;
            label.style.position = "absolute";

            // Position labels with proper padding from room edges
            const labelAnchor = room.labelAnchor || defaultLabelAnchor;
            const labelX = Number.isFinite(room.labelX) ? room.labelX : room.x + 10;
            const labelY = Number.isFinite(room.labelY) ? room.labelY : room.y + 10;
            label.style.left = labelX + "px";
            label.style.top = labelY + "px";

            if (labelAnchor === 'center') {
                label.style.transform = "translate(-50%, -50%)";
                label.style.textAlign = "center";
            }

            label.style.zIndex = "5"; // Ensure labels are above obstacles/walls
            label.style.whiteSpace = plainLabels ? "pre" : "pre-line";

            if (plainLabels) {
                label.style.backgroundColor = "transparent";
                label.style.color = currentFloorplanData.labelColor || "#111";
                label.style.padding = "0";
                label.style.borderRadius = "0";
                label.style.fontSize = currentFloorplanData.labelFontSize || "12px";
                label.style.fontWeight = currentFloorplanData.labelFontWeight || "500";
                label.style.boxShadow = "none";
                label.style.lineHeight = "1.2";
            } else {
                label.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; // Dark background for better visibility
                label.style.color = "white"; // White text
                label.style.padding = "4px 8px"; // Add padding
                label.style.borderRadius = "4px"; // Rounded corners
                label.style.fontSize = "14px"; // Consistent font size
                label.style.fontWeight = "500"; // Slightly bolder text
                label.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)"; // Subtle shadow for better visibility
            }

            floorplanContainer.appendChild(label);
        });
    }

    // --- Draw Walls using the same SVG container ---
    // We're using the same SVG container created above for both rooms and walls

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
            line.setAttribute("stroke-linecap", "square");
            line.setAttribute("shape-rendering", "geometricPrecision");
            svgContainer.appendChild(line);
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
            line.setAttribute("shape-rendering", "geometricPrecision");
            svgContainer.appendChild(line);
        });
    }

    // --- Add fixed obstacle visuals ---
    if (currentFloorplanData.fixedObstacles) {
        currentFloorplanData.fixedObstacles.forEach((obstacle, index) => {
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
            element.style.boxSizing = 'border-box';
            element.style.transformOrigin = 'center center';
            element.style.transform = obstacle.rotation ? `rotate(${obstacle.rotation}deg)` : 'none';

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
                 if (obstacle.type === 'refrigerator') {
                    element.style.zIndex = '5'; // Ensure fridge is high enough
                    element.style.background = '#A7B7C1';
                    element.style.border = `1px solid ${getObstacleBorderColor(obstacle.type)}`;
                    element.style.borderRadius = '3px';
                    element.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.35)';

                    const innerPanel = document.createElement('div');
                    innerPanel.style.position = 'absolute';
                    innerPanel.style.left = '4px';
                    innerPanel.style.right = '4px';
                    innerPanel.style.top = '4px';
                    innerPanel.style.bottom = '4px';
                    innerPanel.style.border = `1px solid rgba(84, 110, 122, 0.45)`;
                    innerPanel.style.borderRadius = '2px';
                    innerPanel.style.pointerEvents = 'none';
                    element.appendChild(innerPanel);

                    const handleStrip = document.createElement('div');
                    handleStrip.style.position = 'absolute';
                    handleStrip.style.left = '5px';
                    handleStrip.style.top = '10px';
                    handleStrip.style.bottom = '10px';
                    handleStrip.style.width = '2px';
                    handleStrip.style.backgroundColor = 'rgba(84, 110, 122, 0.7)';
                    handleStrip.style.borderRadius = '999px';
                    handleStrip.style.pointerEvents = 'none';
                    element.appendChild(handleStrip);
                 }
            }

            // Make kitchenWall obstacle transparent
            if (obstacle.type === 'kitchenWall') {
                element.style.backgroundColor = 'transparent';
            }

            if (devMode && obstacle.type !== 'kitchenWall') {
                element.dataset.editorKind = 'obstacle';
                element.dataset.obstacleIndex = String(index);
                element.style.pointerEvents = 'auto';
                element.style.cursor = 'move';
            }

            fixedObstaclesContainer.appendChild(element);
        });
    }

    // --- Add furniture visuals ---
    if (currentFloorplanData.furniture) {
        // Clear previous furniture
        furnitureContainer.innerHTML = '';
        furnitureContainer.style.pointerEvents = devMode ? 'auto' : 'none';

        // Create SVG container for all furniture
        const svgFurniture = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgFurniture.style.position = 'absolute';
        svgFurniture.style.top = '0';
        svgFurniture.style.left = '0';
        svgFurniture.style.width = '100%';
        svgFurniture.style.height = '100%';
        svgFurniture.style.pointerEvents = devMode ? 'auto' : 'none';
        svgFurniture.style.zIndex = '3';

        // Add each furniture item to the SVG
        currentFloorplanData.furniture.forEach((furniture, index) => {
            // Create a group for this furniture item
            const furnitureGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            furnitureGroup.dataset.editorKind = 'furniture';
            furnitureGroup.dataset.furnitureIndex = String(index);
            furnitureGroup.dataset.furnitureType = furniture.type;
            if (devMode) {
                furnitureGroup.classList.add('editable-furniture');
                furnitureGroup.style.pointerEvents = 'auto';
                furnitureGroup.style.cursor = 'move';
            }

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

            if (devMode) {
                // Use a transparent hitbox so narrow or hollow SVGs are still easy to grab.
                const hitbox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                hitbox.classList.add('editor-hitbox');
                hitbox.setAttribute('x', 0);
                hitbox.setAttribute('y', 0);
                hitbox.setAttribute('width', furniture.width);
                hitbox.setAttribute('height', furniture.height);
                hitbox.setAttribute('fill', 'rgba(0, 0, 0, 0.001)');
                hitbox.setAttribute('pointer-events', 'all');
                furnitureGroup.insertBefore(hitbox, furnitureGroup.firstChild);
            }

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
            element.style.pointerEvents = source.active ? 'auto' : 'none';

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
