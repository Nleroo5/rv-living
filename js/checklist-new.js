// New Checklist System - Packing Guide + Preparation Tasks
// Separate lists for better organization

let packingItems = [];
let preparationTasks = [];
let currentPackingFilter = 'all';
let currentPackingSearch = '';
let currentTasksFilter = 'all';
let currentTasksSearch = '';

// Departure date
const DEPARTURE_DATE = new Date('2026-02-28');

document.addEventListener('DOMContentLoaded', () => {
  // Load data
  loadData();
  
  // Setup tabs
  setupTabs();
  
  // Setup packing guide
  setupPackingGuide();
  
  // Setup tasks timeline
  setupTasksTimeline();
  
  // Update stats
  updateStats();
  
  // Update countdown
  updateCountdown();
});

// Tab System
function setupTabs() {
  const tabs = document.querySelectorAll('.prep-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active to clicked tab
      tab.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}

// Load Data from Storage
function loadData() {
  packingItems = Storage.get('packingItems', []);
  preparationTasks = Storage.get('preparationTasks', []);
}

// Save Data to Storage
function savePackingItems() {
  Storage.set('packingItems', packingItems);
  updateStats();
}

function savePreparationTasks() {
  Storage.set('preparationTasks', preparationTasks);
  updateStats();
}

// Update Stats Bar
function updateStats() {
  // Packing stats
  const totalPacking = packingItems.length;
  const completedPacking = packingItems.filter(item => item.checked).length;
  document.getElementById('packing-stats').textContent = `${completedPacking}/${totalPacking}`;
  
  // Tasks stats
  const totalTasks = preparationTasks.length;
  const completedTasks = preparationTasks.filter(task => task.completed).length;
  document.getElementById('tasks-stats').textContent = `${completedTasks}/${totalTasks}`;
}

// Update Countdown
function updateCountdown() {
  const today = new Date();
  const diffTime = DEPARTURE_DATE - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  document.getElementById('days-countdown').textContent = diffDays > 0 ? diffDays : 0;
}

// ====================
// PACKING GUIDE
// ====================


const PACKING_CATEGORIES = [
  {
    id: 'rv-essentials',
    name: 'RV Essentials & Setup',
    icon: 'RV',
    items: [
      { title: '30-50 AMP Surge Protector', priority: 'essential' },
      { title: 'Leveling blocks set of 10', priority: 'essential' },
      { title: 'Wheel chocks 2 pairs', priority: 'essential' },
      { title: 'Water pressure regulator', priority: 'essential' },
      { title: 'Drinking water hose 25ft', priority: 'essential' },
      { title: 'Drinking water hose 10ft', priority: 'essential' },
      { title: 'Sewer hose 20ft with fittings', priority: 'essential' },
      { title: 'Sewer hose support', priority: 'recommended' },
      { title: 'RV sewer gloves disposable pack', priority: 'essential' },
      { title: 'Clear sewer elbow adapter', priority: 'recommended' },
      { title: '30 amp extension cord 25ft', priority: 'essential' },
      { title: '50 amp extension cord 25ft', priority: 'recommended' },
      { title: 'Tire pressure gauge digital', priority: 'essential' },
      { title: 'TPMS Tire Pressure Monitoring System', priority: 'recommended' },
      { title: 'Portable air compressor 12V', priority: 'recommended' },
      { title: 'RV antifreeze non-toxic gallon', priority: 'recommended' },
      { title: 'Spare fuses various sizes pack', priority: 'essential' },
      { title: 'Voltage meter surge tester', priority: 'recommended' },
      { title: 'Rubber mallet', priority: 'recommended' },
      { title: 'Step stool folding', priority: 'essential' },
      { title: 'Jack stands set', priority: 'optional' },
      { title: 'Wheel bearing grease tube', priority: 'optional' },
      { title: 'Awning tie-downs stakes', priority: 'recommended' },
      { title: 'Slide-out stabilizer jacks', priority: 'optional' },
      { title: 'Spare tire for RV', priority: 'essential' },
      { title: 'Tire iron lug wrench', priority: 'essential' },
      { title: 'Battery jumper cables heavy duty', priority: 'essential' },
      { title: 'Portable battery jump starter', priority: 'recommended' },
      { title: 'Tire repair kit plug kit', priority: 'recommended' },
      { title: 'Wheel blocks plastic',priority: 'optional' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen & Cooking',
    icon: 'Kitchen',
    items: [
      { title: 'Large pot 8 quart with lid', priority: 'essential' },
      { title: 'Medium pot 4 quart with lid', priority: 'essential' },
      { title: 'Small saucepan 2 quart', priority: 'essential' },
      { title: 'Large frying pan skillet 12 inch', priority: 'essential' },
      { title: 'Small frying pan 8 inch', priority: 'recommended' },
      { title: 'Cast iron skillet 10 inch', priority: 'optional' },
      { title: 'Baking sheet cookie sheet', priority: 'recommended' },
      { title: 'Cake pan 9x13', priority: 'optional' },
      { title: 'Mixing bowls stainless steel set of 3', priority: 'essential' },
      { title: 'Dinner plates set of 6', priority: 'essential' },
      { title: 'Salad plates set of 6', priority: 'optional' },
      { title: 'Bowls for cereal soup set of 6', priority: 'essential' },
      { title: 'Cups mugs set of 6', priority: 'essential' },
      { title: 'Wine glasses set of 4', priority: 'optional' },
      { title: 'Drinking glasses tumblers set of 6', priority: 'recommended' },
      { title: 'Forks dinner set of 6', priority: 'essential' },
      { title: 'Knives dinner set of 6', priority: 'essential' },
      { title: 'Spoons tablespoons set of 6', priority: 'essential' },
      { title: 'Spoons teaspoons set of 6', priority: 'essential' },
      { title: 'Steak knives set of 6', priority: 'recommended' },
      { title: 'Salad forks set of 6', priority: 'optional' },
      { title: 'Cutting board plastic large', priority: 'essential' },
      { title: 'Cutting board wood medium', priority: 'optional' },
      { title: 'Cutting board small prep', priority: 'optional' },
      { title: 'Chef knife 8 inch', priority: 'essential' },
      { title: 'Paring knife 3 inch', priority: 'essential' },
      { title: 'Bread knife serrated', priority: 'recommended' },
      { title: 'Utility knife 5 inch', priority: 'optional' },
      { title: 'Kitchen shears heavy duty', priority: 'recommended' },
      { title: 'Can opener manual', priority: 'essential' },
      { title: 'Bottle opener', priority: 'essential' },
      { title: 'Wine opener corkscrew', priority: 'recommended' },
      { title: 'Measuring cups dry set', priority: 'essential' },
      { title: 'Measuring cup liquid 2 cup', priority: 'essential' },
      { title: 'Measuring spoons set', priority: 'essential' },
      { title: 'Large serving spoon', priority: 'essential' },
      { title: 'Slotted serving spoon', priority: 'recommended' },
      { title: 'Spatula metal turner', priority: 'essential' },
      { title: 'Spatula silicone heat resistant', priority: 'recommended' },
      { title: 'Ladle soup ladle', priority: 'recommended' },
      { title: 'Tongs 12 inch', priority: 'essential' },
      { title: 'Tongs 9 inch', priority: 'optional' },
      { title: 'Whisk large', priority: 'recommended' },
      { title: 'Grater box grater', priority: 'recommended' },
      { title: 'Zester microplane', priority: 'optional' },
      { title: 'Vegetable peeler Y-peeler', priority: 'essential' },
      { title: 'Garlic press', priority: 'optional' },
      { title: 'Potato masher', priority: 'optional' },
      { title: 'Colander large', priority: 'essential' },
      { title: 'Strainer fine mesh', priority: 'recommended' },
      { title: 'Funnel kitchen funnel', priority: 'optional' },
      { title: 'Coffee maker drip 12 cup', priority: 'essential' },
      { title: 'Coffee filters 100 pack', priority: 'essential' },
      { title: 'French press as backup', priority: 'optional' },
      { title: 'Travel mugs insulated 2 pack', priority: 'recommended' },
      { title: 'Food storage containers glass set', priority: 'recommended' },
      { title: 'Food storage containers plastic set', priority: 'essential' },
      { title: 'Plastic wrap box', priority: 'recommended' },
      { title: 'Aluminum foil roll', priority: 'recommended' },
      { title: 'Parchment paper roll', priority: 'optional' },
      { title: 'Ziploc bags gallon box', priority: 'essential' },
      { title: 'Ziploc bags quart box', priority: 'essential' },
      { title: 'Ziploc bags sandwich box', priority: 'recommended' },
      { title: 'Dish soap biodegradable bottle', priority: 'essential' },
      { title: 'Dish scrubber non-scratch', priority: 'essential' },
      { title: 'Sponges pack of 6', priority: 'essential' },
      { title: 'Dish brush with handle', priority: 'recommended' },
      { title: 'Dish drying rack collapsible', priority: 'recommended' },
      { title: 'Dish drying mat microfiber', priority: 'recommended' },
      { title: 'Dish towels cotton 6 pack', priority: 'essential' },
      { title: 'Paper towels 6 roll pack', priority: 'essential' },
      { title: 'Napkins paper', priority: 'recommended' },
      { title: 'Napkins cloth set', priority: 'optional' },
      { title: 'Trash bags 13 gallon 50 pack', priority: 'essential' },
      { title: 'Trash can 13 gallon with lid', priority: 'essential' },
      { title: 'Compost bin small', priority: 'optional' },
      { title: 'Oven mitts 2 pack', priority: 'essential' },
      { title: 'Pot holders 4 pack', priority: 'recommended' },
      { title: 'Trivet hot pads', priority: 'recommended' },
      { title: 'Salt shaker', priority: 'essential' },
      { title: 'Pepper grinder', priority: 'essential' },
      { title: 'Spice rack organizer', priority: 'recommended' },
      { title: 'Garlic powder', priority: 'recommended' },
      { title: 'Onion powder', priority: 'recommended' },
      { title: 'Paprika', priority: 'optional' },
      { title: 'Italian seasoning', priority: 'recommended' },
      { title: 'Cumin', priority: 'optional' },
      { title: 'Chili powder', priority: 'optional' },
      { title: 'Cinnamon', priority: 'optional' },
      { title: 'Olive oil extra virgin', priority: 'essential' },
      { title: 'Vegetable oil cooking oil', priority: 'essential' },
      { title: 'Cooking spray non-stick', priority: 'recommended' },
      { title: 'Vinegar white and balsamic', priority: 'recommended' },
      { title: 'Soy sauce', priority: 'optional' },
      { title: 'Hot sauce', priority: 'optional' },
      { title: 'Ketchup', priority: 'recommended' },
      { title: 'Mustard', priority: 'recommended' },
      { title: 'Mayonnaise', priority: 'recommended' }
    ]
  }
,
  {
    id: 'bathroom',
    name: 'Bathroom & Cleaning',
    icon: 'Bathroom',
    items: [
      { title: 'Toilet paper 12 mega roll pack', priority: 'essential' },
      { title: 'RV toilet paper septic safe 24 pack', priority: 'essential' },
      { title: 'Toilet bowl cleaner RV safe', priority: 'essential' },
      { title: 'Toilet brush with holder', priority: 'essential' },
      { title: 'Plunger sink and toilet', priority: 'essential' },
      { title: 'Tank treatment holding tank chemicals', priority: 'essential' },
      { title: 'Black tank deodorizer', priority: 'essential' },
      { title: 'Hand soap dispenser and refills', priority: 'essential' },
      { title: 'Body wash shower gel', priority: 'essential' },
      { title: 'Shampoo and conditioner bottles', priority: 'essential' },
      { title: 'Bar soap backup', priority: 'recommended' },
      { title: 'Face wash cleanser', priority: 'recommended' },
      { title: 'Toothbrushes 2 pack', priority: 'essential' },
      { title: 'Toothpaste tube', priority: 'essential' },
      { title: 'Dental floss', priority: 'recommended' },
      { title: 'Mouthwash bottle', priority: 'recommended' },
      { title: 'Razor shavers pack', priority: 'essential' },
      { title: 'Shaving cream or gel', priority: 'recommended' },
      { title: 'Deodorant', priority: 'essential' },
      { title: 'Hairbrush or comb', priority: 'essential' },
      { title: 'Hair dryer compact', priority: 'recommended' },
      { title: 'Hair styling products gel mousse', priority: 'optional' },
      { title: 'Towels bath large 4 pack', priority: 'essential' },
      { title: 'Towels hand 4 pack', priority: 'essential' },
      { title: 'Washcloths 6 pack', priority: 'essential' },
      { title: 'Shower caddy organizer', priority: 'recommended' },
      { title: 'Shower curtain and liner', priority: 'essential' },
      { title: 'Shower hooks rings', priority: 'essential' },
      { title: 'Bath mat non-slip', priority: 'essential' },
      { title: 'Bathroom cleaner all-purpose spray', priority: 'essential' },
      { title: 'Glass cleaner mirror cleaner', priority: 'recommended' },
      { title: 'Disinfecting wipes canister', priority: 'essential' },
      { title: 'Paper towels bathroom', priority: 'recommended' },
      { title: 'Toilet paper holder wall mount', priority: 'optional' },
      { title: 'Trash can small bathroom', priority: 'essential' },
      { title: 'Trash bags small 4 gallon', priority: 'essential' },
      { title: 'Air freshener spray', priority: 'recommended' },
      { title: 'Laundry detergent pods portable', priority: 'essential' },
      { title: 'Fabric softener sheets dryer', priority: 'recommended' },
      { title: 'Stain remover stick or spray', priority: 'recommended' },
      { title: 'Laundry basket collapsible', priority: 'essential' },
      { title: 'Clothesline portable travel', priority: 'recommended' },
      { title: 'Clothespins 24 pack', priority: 'recommended' },
      { title: 'Iron compact travel', priority: 'optional' },
      { title: 'Ironing board small tabletop', priority: 'optional' },
      { title: 'All-purpose cleaner multi-surface', priority: 'essential' },
      { title: 'Bleach small bottle', priority: 'recommended' },
      { title: 'Rubber gloves cleaning', priority: 'essential' },
      { title: 'Microfiber cloths 12 pack', priority: 'essential' },
      { title: 'Broom and dustpan compact', priority: 'essential' }
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom & Linens',
    icon: 'Bedroom',
    items: [
      { title: 'Sheets queen fitted 2 sets', priority: 'essential' },
      { title: 'Sheets queen flat 2 sets', priority: 'essential' },
      { title: 'Pillowcases queen 4 pack', priority: 'essential' },
      { title: 'Pillows bed pillows 4 pack', priority: 'essential' },
      { title: 'Comforter queen size', priority: 'essential' },
      { title: 'Duvet cover queen', priority: 'optional' },
      { title: 'Blanket warm fleece queen', priority: 'recommended' },
      { title: 'Throw blanket couch', priority: 'recommended' },
      { title: 'Mattress protector waterproof queen', priority: 'essential' },
      { title: 'Mattress topper memory foam', priority: 'recommended' },
      { title: 'Alarm clock battery backup', priority: 'recommended' },
      { title: 'Nightlight LED plugin', priority: 'recommended' },
      { title: 'Blackout curtains or shades', priority: 'recommended' },
      { title: 'Hangers plastic 20 pack', priority: 'essential' },
      { title: 'Hangers wooden 10 pack', priority: 'optional' },
      { title: 'Closet organizer hanging shelves', priority: 'recommended' },
      { title: 'Shoe rack or organizer', priority: 'recommended' },
      { title: 'Storage bins under bed', priority: 'recommended' },
      { title: 'Vacuum bags space saver', priority: 'optional' },
      { title: 'Fan portable oscillating', priority: 'recommended' },
      { title: 'Humidifier small travel', priority: 'optional' },
      { title: 'Essential oil diffuser', priority: 'optional' },
      { title: 'Reading light clip-on LED', priority: 'recommended' },
      { title: 'Earplugs sleeping foam', priority: 'recommended' },
      { title: 'Sleep mask eye mask', priority: 'optional' }
    ]
  },
  {
    id: 'clothing',
    name: 'Clothing & Personal',
    icon: 'Clothing',
    items: [
      { title: 'T-shirts casual 10 pack', priority: 'essential' },
      { title: 'Long sleeve shirts 5 pack', priority: 'recommended' },
      { title: 'Button-up shirts 3 pack', priority: 'optional' },
      { title: 'Jeans denim pants 3 pairs', priority: 'essential' },
      { title: 'Shorts casual 4 pairs', priority: 'recommended' },
      { title: 'Athletic wear workout clothes', priority: 'recommended' },
      { title: 'Sweatpants lounge pants 2 pairs', priority: 'recommended' },
      { title: 'Hoodie or sweatshirt 2 pack', priority: 'recommended' },
      { title: 'Jacket light windbreaker', priority: 'essential' },
      { title: 'Jacket heavy winter coat', priority: 'essential' },
      { title: 'Rain jacket waterproof', priority: 'essential' },
      { title: 'Fleece jacket mid-layer', priority: 'recommended' },
      { title: 'Underwear 14 pack', priority: 'essential' },
      { title: 'Socks everyday 14 pairs', priority: 'essential' },
      { title: 'Socks wool hiking 4 pairs', priority: 'recommended' },
      { title: 'Sneakers athletic shoes', priority: 'essential' },
      { title: 'Hiking boots waterproof', priority: 'essential' },
      { title: 'Sandals casual flip flops', priority: 'recommended' },
      { title: 'Dress shoes nice pair', priority: 'optional' },
      { title: 'Slippers indoor', priority: 'recommended' },
      { title: 'Belt leather', priority: 'essential' },
      { title: 'Hat baseball cap', priority: 'recommended' },
      { title: 'Hat sun hat wide brim', priority: 'recommended' },
      { title: 'Beanie winter hat', priority: 'recommended' },
      { title: 'Gloves winter insulated', priority: 'essential' },
      { title: 'Scarf neck warmer', priority: 'recommended' },
      { title: 'Sunglasses UV protection', priority: 'essential' },
      { title: 'Swimsuit bathing suit', priority: 'recommended' },
      { title: 'Pajamas sleepwear 3 sets', priority: 'essential' },
      { title: 'Robe bathrobe', priority: 'optional' },
      { title: 'Watch everyday', priority: 'recommended' },
      { title: 'Jewelry basics', priority: 'optional' },
      { title: 'Wallet or purse', priority: 'essential' },
      { title: 'Backpack daypack', priority: 'essential' },
      { title: 'Duffel bag gym bag', priority: 'recommended' }
    ]
  },
  {
    id: 'technology',
    name: 'Technology & Work',
    icon: 'Tech',
    items: [
      { title: 'Laptop computer', priority: 'essential' },
      { title: 'Laptop charger power adapter', priority: 'essential' },
      { title: 'Laptop case or sleeve', priority: 'recommended' },
      { title: 'External monitor portable 15 inch', priority: 'optional' },
      { title: 'Wireless mouse', priority: 'recommended' },
      { title: 'Wireless keyboard compact', priority: 'optional' },
      { title: 'USB hub multi-port', priority: 'recommended' },
      { title: 'External hard drive 2TB backup', priority: 'essential' },
      { title: 'USB flash drives 3 pack 64GB', priority: 'recommended' },
      { title: 'Smartphone', priority: 'essential' },
      { title: 'Smartphone charger', priority: 'essential' },
      { title: 'Phone case protective', priority: 'essential' },
      { title: 'Screen protector tempered glass', priority: 'recommended' },
      { title: 'Car phone mount dashboard', priority: 'recommended' },
      { title: 'Portable charger power bank 20000mAh', priority: 'essential' },
      { title: 'Charging cables USB-C 3 pack', priority: 'essential' },
      { title: 'Charging cables Lightning 2 pack', priority: 'recommended' },
      { title: 'Charging cables Micro-USB 2 pack', priority: 'optional' },
      { title: 'Multi-device charging station', priority: 'recommended' },
      { title: 'Surge protector power strip 6 outlet', priority: 'essential' },
      { title: 'Extension cord indoor 15 ft', priority: 'recommended' },
      { title: 'Headphones noise canceling', priority: 'recommended' },
      { title: 'Earbuds wireless Bluetooth', priority: 'essential' },
      { title: 'Tablet iPad or similar', priority: 'optional' },
      { title: 'Tablet charger and cable', priority: 'optional' },
      { title: 'E-reader Kindle', priority: 'optional' },
      { title: 'Camera DSLR or mirrorless', priority: 'optional' },
      { title: 'Camera charger and batteries', priority: 'optional' },
      { title: 'Memory cards SD 64GB 2 pack', priority: 'optional' },
      { title: 'Tripod compact travel', priority: 'optional' },
      { title: 'GoPro action camera', priority: 'optional' },
      { title: 'Drone with camera', priority: 'optional' },
      { title: 'WiFi range extender booster', priority: 'recommended' },
      { title: 'Mobile hotspot device', priority: 'essential' },
      { title: 'Cell phone signal booster', priority: 'recommended' },
      { title: 'Printer portable wireless', priority: 'optional' },
      { title: 'Printer paper 100 sheets', priority: 'optional' },
      { title: 'Scanner portable document', priority: 'optional' },
      { title: 'Webcam HD 1080p', priority: 'recommended' },
      { title: 'Microphone USB podcasting', priority: 'optional' },
      { title: 'Cable organizer travel case', priority: 'recommended' },
      { title: 'Velcro cable ties 50 pack', priority: 'recommended' },
      { title: 'Bluetooth speaker portable waterproof', priority: 'recommended' },
      { title: 'Smart watch fitness tracker', priority: 'optional' },
      { title: 'Streaming device Roku or Fire Stick', priority: 'optional' },
      { title: 'HDMI cables 6 ft 2 pack', priority: 'recommended' },
      { title: 'Flashlight headlamp rechargeable', priority: 'essential' },
      { title: 'Flashlight handheld LED tactical', priority: 'essential' },
      { title: 'Lantern camping LED', priority: 'recommended' },
      { title: 'Batteries AA 24 pack', priority: 'essential' }
    ]
  },
  {
    id: 'safety',
    name: 'Safety & Emergency',
    icon: 'Safety',
    items: [
      { title: 'Fire extinguisher 5 lb ABC rated', priority: 'essential' },
      { title: 'Smoke detector battery powered', priority: 'essential' },
      { title: 'Carbon monoxide detector', priority: 'essential' },
      { title: 'Propane gas detector', priority: 'essential' },
      { title: 'First aid kit comprehensive', priority: 'essential' },
      { title: 'Bandages assorted sizes box', priority: 'essential' },
      { title: 'Gauze pads sterile', priority: 'essential' },
      { title: 'Medical tape adhesive', priority: 'essential' },
      { title: 'Antibiotic ointment Neosporin', priority: 'essential' },
      { title: 'Pain relievers Ibuprofen Tylenol', priority: 'essential' },
      { title: 'Allergy medication Benadryl', priority: 'recommended' },
      { title: 'Stomach medicine Pepto Bismol', priority: 'recommended' },
      { title: 'Thermometer digital', priority: 'essential' },
      { title: 'Tweezers stainless steel', priority: 'essential' },
      { title: 'Scissors medical trauma shears', priority: 'recommended' },
      { title: 'Cold packs instant ice', priority: 'recommended' },
      { title: 'Elastic bandage ACE wrap', priority: 'recommended' },
      { title: 'Burn gel packets', priority: 'recommended' },
      { title: 'Emergency blanket space blanket', priority: 'essential' },
      { title: 'Flashlight emergency crank', priority: 'recommended' },
      { title: 'Weather radio NOAA alert', priority: 'essential' },
      { title: 'Whistle emergency safety', priority: 'recommended' },
      { title: 'Road flares or LED emergency lights', priority: 'essential' },
      { title: 'Reflective safety vest 2 pack', priority: 'essential' },
      { title: 'Roadside emergency kit triangles', priority: 'essential' },
      { title: 'Tow strap heavy duty 20 ft', priority: 'recommended' },
      { title: 'Emergency water pouches 12 pack', priority: 'essential' },
      { title: 'Water purification tablets', priority: 'recommended' },
      { title: 'Emergency food bars 72 hour', priority: 'recommended' },
      { title: 'Matches waterproof container', priority: 'essential' },
      { title: 'Lighter multi-pack', priority: 'essential' },
      { title: 'Firestarter cubes', priority: 'recommended' },
      { title: 'Multi-tool Leatherman', priority: 'essential' },
      { title: 'Duct tape heavy duty roll', priority: 'essential' },
      { title: 'Zip ties assorted sizes 100 pack', priority: 'recommended' },
      { title: 'Paracord 550 100 ft', priority: 'recommended' },
      { title: 'Bungee cords assorted 10 pack', priority: 'recommended' },
      { title: 'Ratchet straps tie-downs 4 pack', priority: 'recommended' },
      { title: 'Work gloves heavy duty', priority: 'essential' },
      { title: 'Safety glasses protective eyewear', priority: 'recommended' },
      { title: 'N95 masks 20 pack', priority: 'recommended' },
      { title: 'Hand sanitizer pump bottle', priority: 'essential' },
      { title: 'Sunscreen SPF 50 lotion', priority: 'essential' },
      { title: 'Bug spray insect repellent DEET', priority: 'essential' },
      { title: 'Bear spray canister', priority: 'recommended' },
      { title: 'Pepper spray personal defense', priority: 'optional' },
      { title: 'Safe lockbox fireproof', priority: 'recommended' },
      { title: 'Padlocks keyed alike 3 pack', priority: 'recommended' },
      { title: 'Emergency contact list laminated', priority: 'essential' },
      { title: 'Emergency cash $200 hidden', priority: 'essential' }
    ]
  },
  {
    id: 'outdoor',
    name: 'Outdoor & Recreation',
    icon: 'Outdoor',
    items: [
      { title: 'Camping chairs folding 2 pack', priority: 'essential' },
      { title: 'Camping table folding portable', priority: 'recommended' },
      { title: 'Outdoor rug mat 9x12', priority: 'recommended' },
      { title: 'Picnic blanket waterproof', priority: 'recommended' },
      { title: 'Cooler hard-sided 48 quart', priority: 'essential' },
      { title: 'Cooler soft-sided lunch bag', priority: 'recommended' },
      { title: 'Ice packs reusable 6 pack', priority: 'recommended' },
      { title: 'Water bottles insulated 32oz 2 pack', priority: 'essential' },
      { title: 'Water jug 5 gallon collapsible', priority: 'recommended' },
      { title: 'Hydration backpack CamelBak', priority: 'optional' },
      { title: 'Grill portable propane or charcoal', priority: 'recommended' },
      { title: 'Propane tank 1 lb canisters 4 pack', priority: 'recommended' },
      { title: 'BBQ tools spatula tongs set', priority: 'recommended' },
      { title: 'Grill brush cleaning', priority: 'recommended' },
      { title: 'Charcoal briquettes 10 lb bag', priority: 'optional' },
      { title: 'Lighter fluid or chimney starter', priority: 'optional' },
      { title: 'Cast iron grill pan', priority: 'optional' },
      { title: 'Dutch oven camp cooking', priority: 'optional' },
      { title: 'Skewers metal or bamboo', priority: 'optional' },
      { title: 'Tent 4-person backup', priority: 'optional' },
      { title: 'Sleeping bags 2 pack 20F rated', priority: 'optional' },
      { title: 'Sleeping pads inflatable 2 pack', priority: 'optional' },
      { title: 'Air pump battery powered', priority: 'optional' },
      { title: 'Tarp heavy duty 10x12', priority: 'recommended' },
      { title: 'Stakes tent stakes 12 pack', priority: 'recommended' },
      { title: 'Rope utility 50 ft', priority: 'recommended' },
      { title: 'Carabiners climbing clips 12 pack', priority: 'recommended' },
      { title: 'Hiking backpack 40L', priority: 'recommended' },
      { title: 'Trekking poles pair', priority: 'optional' },
      { title: 'Binoculars 10x42 waterproof', priority: 'optional' },
      { title: 'Compass navigation', priority: 'recommended' },
      { title: 'Maps paper trail maps', priority: 'recommended' },
      { title: 'GPS handheld Garmin', priority: 'optional' },
      { title: 'Fishing rods 2 pack collapsible', priority: 'optional' },
      { title: 'Fishing tackle box with lures', priority: 'optional' },
      { title: 'Fishing license state permits', priority: 'optional' },
      { title: 'Bike rack hitch mounted', priority: 'optional' },
      { title: 'Bicycles 2 pack mountain or hybrid', priority: 'optional' },
      { title: 'Bike helmets 2 pack', priority: 'optional' },
      { title: 'Bike locks U-lock 2 pack', priority: 'optional' },
      { title: 'Kayak inflatable or foldable', priority: 'optional' },
      { title: 'Kayak paddles 2 pack', priority: 'optional' },
      { title: 'Life jackets PFD 2 pack', priority: 'optional' },
      { title: 'Frisbee flying disc', priority: 'optional' },
      { title: 'Football or soccer ball', priority: 'optional' },
      { title: 'Playing cards waterproof deck', priority: 'recommended' },
      { title: 'Board games travel size', priority: 'optional' },
      { title: 'Hammock camping double', priority: 'optional' },
      { title: 'Hammock straps tree friendly', priority: 'optional' },
      { title: 'Portable shower solar heated', priority: 'optional' }
    ]
  },
  {
    id: 'documents',
    name: 'Documents & Important Items',
    icon: 'Docs',
    items: [
      { title: 'Drivers licenses both', priority: 'essential' },
      { title: 'Passports both valid', priority: 'essential' },
      { title: 'Birth certificates copies', priority: 'essential' },
      { title: 'Social security cards', priority: 'essential' },
      { title: 'Marriage certificate copy', priority: 'recommended' },
      { title: 'Vehicle registration RV', priority: 'essential' },
      { title: 'Vehicle registration tow vehicle', priority: 'essential' },
      { title: 'Vehicle insurance cards current', priority: 'essential' },
      { title: 'RV insurance policy documents', priority: 'essential' },
      { title: 'Health insurance cards', priority: 'essential' },
      { title: 'Medicare or Medicaid cards', priority: 'recommended' },
      { title: 'Dental insurance information', priority: 'recommended' },
      { title: 'Vision insurance information', priority: 'optional' },
      { title: 'Prescription medication list', priority: 'essential' },
      { title: 'Medical history records', priority: 'recommended' },
      { title: 'Vaccination records', priority: 'recommended' },
      { title: 'Pet vaccination records', priority: 'optional' },
      { title: 'Pet microchip information', priority: 'optional' },
      { title: 'Bank account information', priority: 'essential' },
      { title: 'Credit cards 2 backups', priority: 'essential' },
      { title: 'Debit cards', priority: 'essential' },
      { title: 'Checkbook with checks', priority: 'recommended' },
      { title: 'Investment account access', priority: 'recommended' },
      { title: 'Retirement account info 401k IRA', priority: 'recommended' },
      { title: 'Tax returns last 3 years copies', priority: 'essential' },
      { title: 'W-2 forms or 1099 current', priority: 'recommended' },
      { title: 'Power of attorney documents', priority: 'recommended' },
      { title: 'Will and testament copies', priority: 'recommended' },
      { title: 'Trust documents if applicable', priority: 'optional' },
      { title: 'RV warranty paperwork', priority: 'essential' },
      { title: 'RV owner manual', priority: 'essential' },
      { title: 'Appliance manuals for RV equipment', priority: 'recommended' }
    ]
  }
];


function setupPackingGuide() {
  // Add form submission
  document.getElementById('add-packing-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addPackingItem();
  });
  
  // Search
  document.getElementById('packing-search').addEventListener('input', debounce(() => {
    currentPackingSearch = document.getElementById('packing-search').value.toLowerCase();
    renderPackingAccordion();
  }, 300));
  
  // Filter
  document.getElementById('packing-filter').addEventListener('change', () => {
    currentPackingFilter = document.getElementById('packing-filter').value;
    renderPackingAccordion();
  });
  
  // Export
  document.getElementById('export-packing-btn').addEventListener('click', () => {
    exportPackingList();
  });
  
  // Initial render
  renderPackingAccordion();
}

function addPackingItem() {
  const title = document.getElementById('packing-item-title').value.trim();
  const priority = document.getElementById('packing-item-priority').value;
  
  if (!title) return;
  
  const newItem = {
    id: generateId(),
    title,
    priority,
    checked: false,
    category: 'custom',
    createdAt: new Date().toISOString()
  };
  
  packingItems.push(newItem);
  savePackingItems();
  renderPackingAccordion();
  
  // Reset form
  document.getElementById('add-packing-form').reset();
  showToast('Item added!', 'success');
}

function renderPackingAccordion() {
  const accordion = document.getElementById('packing-accordion');
  accordion.innerHTML = '';
  
  // Render each category
  PACKING_CATEGORIES.forEach(category => {
    // Get items for this category
    const defaultItems = category.items.map(item => ({
      ...item,
      id: generateId(),
      category: category.id,
      isDefault: true
    }));
    
    // Merge with user's packed items
    const allItems = defaultItems.map(defItem => {
      const userItem = packingItems.find(pi => 
        pi.title === defItem.title && pi.category === category.id
      );
      return userItem || defItem;
    });
    
    // Add custom items for this category
    const customItems = packingItems.filter(pi => pi.category === category.id && !defaultItems.find(di => di.title === pi.title));
    allItems.push(...customItems);
    
    // Apply filters
    let filteredItems = allItems.filter(item => {
      // Priority filter
      if (currentPackingFilter !== 'all' && currentPackingFilter !== 'unchecked') {
        if (item.priority !== currentPackingFilter) return false;
      }
      if (currentPackingFilter === 'unchecked' && item.checked) return false;
      
      // Search filter
      if (currentPackingSearch && !item.title.toLowerCase().includes(currentPackingSearch)) {
        return false;
      }
      
      return true;
    });
    
    if (filteredItems.length === 0) return;
    
    const section = createAccordionSection(category, filteredItems);
    accordion.appendChild(section);
  });
  
  // Add custom items category
  const customItems = packingItems.filter(item => item.category === 'custom');
  if (customItems.length > 0) {
    let filteredCustom = customItems.filter(item => {
      if (currentPackingFilter !== 'all' && currentPackingFilter !== 'unchecked') {
        if (item.priority !== currentPackingFilter) return false;
      }
      if (currentPackingFilter === 'unchecked' && item.checked) return false;
      if (currentPackingSearch && !item.title.toLowerCase().includes(currentPackingSearch)) return false;
      return true;
    });
    
    if (filteredCustom.length > 0) {
      const customCategory = {
        id: 'custom',
        name: 'Custom Items',
        icon: 'Custom'
      };
      const section = createAccordionSection(customCategory, filteredCustom);
      accordion.appendChild(section);
    }
  }
}

function createAccordionSection(category, items) {
  const section = document.createElement('div');
  section.className = 'accordion-section';
  
  const header = document.createElement('div');
  header.className = 'accordion-header';
  const checkedCount = items.filter(i => i.checked).length;
  header.innerHTML = `
    <div>
      <span class="icon">${category.icon}</span>
      ${category.name}
      <span style="color: var(--color-text-secondary); font-weight: normal; margin-left: var(--space-2);">(${checkedCount}/${items.length})</span>
    </div>
    <span class="accordion-toggle">▼</span>
  `;
  
  const body = document.createElement('div');
  body.className = 'accordion-body';
  
  const content = document.createElement('div');
  content.className = 'accordion-content';
  
  items.forEach(item => {
    const row = createPackingItemRow(item);
    content.appendChild(row);
  });
  
  body.appendChild(content);
  section.appendChild(header);
  section.appendChild(body);
  
  // Toggle accordion
  header.addEventListener('click', () => {
    header.classList.toggle('active');
    body.classList.toggle('open');
  });
  
  return section;
}

function createPackingItemRow(item) {
  const row = document.createElement('div');
  row.className = 'item-row';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'item-checkbox';
  checkbox.checked = item.checked || false;
  checkbox.addEventListener('change', () => {
    togglePackingItem(item);
  });
  
  const content = document.createElement('div');
  content.className = 'item-content';
  
  const title = document.createElement('div');
  title.className = 'item-title';
  title.textContent = item.title;
  
  const badge = document.createElement('span');
  badge.className = `item-badge badge-${item.priority}`;
  badge.textContent = item.priority.charAt(0).toUpperCase() + item.priority.slice(1);
  
  content.appendChild(title);
  content.appendChild(badge);
  
  const actions = document.createElement('div');
  actions.className = 'item-actions';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.title = 'Delete item';
  deleteBtn.addEventListener('click', async () => {
    if (await confirmDialog(`Delete "${item.title}"?`)) {
      deletePackingItem(item);
    }
  });
  
  actions.appendChild(deleteBtn);
  
  row.appendChild(checkbox);
  row.appendChild(content);
  row.appendChild(actions);
  
  return row;
}

function togglePackingItem(item) {
  // Find existing item
  let existingItem = packingItems.find(pi => pi.title === item.title && pi.category === item.category);
  
  if (!existingItem) {
    // Add item to packingItems
    existingItem = {
      id: item.id || generateId(),
      title: item.title,
      priority: item.priority,
      category: item.category,
      checked: true,
      createdAt: new Date().toISOString()
    };
    packingItems.push(existingItem);
  } else {
    // Toggle existing item
    existingItem.checked = !existingItem.checked;
  }
  
  savePackingItems();
  renderPackingAccordion();
}

function deletePackingItem(item) {
  packingItems = packingItems.filter(pi => !(pi.title === item.title && pi.category === item.category));
  savePackingItems();
  renderPackingAccordion();
  showToast('Item deleted', 'info');
}

function exportPackingList() {
  let text = 'RV PACKING LIST\n\n';
  
  PACKING_CATEGORIES.forEach(category => {
    const categoryItems = packingItems.filter(item => item.category === category.id);
    if (categoryItems.length > 0) {
      text += `${category.name}\n`;
      categoryItems.forEach(item => {
        const status = item.checked ? '[✓]' : '[ ]';
        text += `  ${status} ${item.title} (${item.priority})\n`;
      });
      text += '\n';
    }
  });
  
  const customItems = packingItems.filter(item => item.category === 'custom');
  if (customItems.length > 0) {
    text += 'Custom Items\n';
    customItems.forEach(item => {
      const status = item.checked ? '[✓]' : '[ ]';
      text += `  ${status} ${item.title} (${item.priority})\n`;
    });
  }
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rv-packing-list.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Packing list exported!', 'success');
}

// ====================
// PREPARATION TASKS
// ====================

const TASK_PHASES = {
  phase1: {
    name: '6-4 Months Before (Sep-Nov 2025)',
    color: 'var(--color-primary)',
    tasks: [
      {
        title: 'Research RV-friendly states for registration',
        description: 'Look into SD, TX, FL for domicile. Consider taxes, insurance costs, and mail forwarding options.'
      },
      {
        title: 'Set up mail forwarding service',
        description: 'Sign up for Escapees, Americas Mailbox, or similar service.',
        steps: ['Research options', 'Compare pricing', 'Sign up for service', 'Update address with important contacts']
      },
      {
        title: "Update driver's license to new state",
        description: 'If changing domicile, get new licenses in person if required.'
      },
      {
        title: 'Research RV insurance options',
        description: 'Get quotes from Progressive, Good Sam, National General. Ask about full-timer coverage.'
      },
      {
        title: 'Get full RV inspection',
        description: 'Have professional inspect all systems before departure.',
        steps: ['Find certified RV technician', 'Schedule inspection', 'Address any issues found']
      },
      {
        title: 'Service RV engine and generator',
        description: 'Oil change, filter replacement, fluid checks. Generator load test.'
      },
      {
        title: 'Set up dedicated RV budget',
        description: 'Track expenses, set aside emergency fund.'
      },
      {
        title: 'Research campground memberships',
        description: 'Compare Passport America, KOA, Harvest Hosts, Thousand Trails.'
      },
      {
        title: 'Order Starlink for RVs',
        description: 'Essential for remote work. Order early for installation time.',
        steps: ['Order equipment from Starlink.com', 'Plan installation on RV roof', 'Test before departure']
      },
      {
        title: 'Confirm remote work arrangement with employer',
        description: 'Get written approval. Discuss any state tax implications.'
      }
    ]
  },
  phase2: {
    name: '3-2 Months Before (Dec 2025-Jan 2026)',
    color: 'var(--color-accent)',
    tasks: [
      {
        title: 'Give notice to landlord / prepare home for sale',
        description: 'Coordinate move-out date with Feb 28 departure.'
      },
      {
        title: 'Begin downsizing belongings',
        description: 'Start selling furniture on Facebook Marketplace.',
        steps: ['Inventory what to keep', 'List furniture for sale', 'Donate unused items', 'Digitize important documents']
      },
      {
        title: 'Research storage unit options',
        description: 'Get quotes for climate-controlled units. Book for January.'
      },
      {
        title: 'Schedule health checkups',
        description: 'Both get complete physicals. Address any issues before departure.'
      },
      {
        title: 'Schedule dental checkups',
        description: 'Get cleanings and handle any needed work.'
      },
      {
        title: 'Stock up on prescriptions',
        description: 'Request 90-day supplies. Transfer to national pharmacy.'
      },
      {
        title: 'Plan first 3 months of route',
        description: 'Map out Feb-May 2026. Head south to avoid cold weather.'
      },
      {
        title: 'Download campground apps',
        description: 'Get Campendium, The Dyrt, iOverlander, RV Parky. Create accounts.'
      },
      {
        title: 'Test remote work setup in RV',
        description: 'Work from RV for a week. Test Starlink, power needs, desk setup.'
      },
      {
        title: "Cancel subscriptions you won't need",
        description: 'Gym membership (unless national chain), local services.'
      }
    ]
  },
  phase3: {
    name: '1 Month Before (February 1-27, 2026)',
    color: 'var(--color-error)',
    tasks: [
      {
        title: 'Complete apartment move-out',
        description: 'Load items into storage, deep clean, final walkthrough.'
      },
      {
        title: 'Cancel or transfer utilities',
        description: 'Close electricity, gas, water, trash accounts.'
      },
      {
        title: 'Update all addresses',
        description: 'Bank, insurance, Amazon, subscriptions - use mail forwarding address.'
      },
      {
        title: 'Book first week of campgrounds',
        description: "Reserve Feb 28-Mar 7. Don't wing it first week!"
      },
      {
        title: 'Buy America the Beautiful pass',
        description: '$80/year pass for all national parks.'
      },
      {
        title: 'Final RV systems check',
        description: 'Test generator, AC, heater, water heater, fridge, stove, slide-out.',
        steps: ['Run generator under load', 'Test all appliances', 'Check for leaks', 'Verify slide-out operation']
      },
      {
        title: 'Stock RV pantry',
        description: 'Buy 2 weeks of non-perishable food.'
      },
      {
        title: 'Create packing list for departure day',
        description: 'Everything needed on Day 1: hoses, blocks, tools, first aid.'
      },
      {
        title: 'Say goodbyes to friends and family',
        description: 'Plan farewell gatherings. Exchange contact info.'
      },
      {
        title: 'Take final photos of RV',
        description: 'Document condition before departure for insurance.'
      }
    ]
  },
  departure: {
    name: 'Departure Day (February 28, 2026)',
    color: 'var(--color-success)',
    tasks: [
      {
        title: 'Fill fresh water tank',
        description: 'Fill to capacity. Test water pump.'
      },
      {
        title: 'Fill propane tanks',
        description: 'Top off both tanks for heat, hot water, cooking.'
      },
      {
        title: 'Check tire pressure on all tires',
        description: 'Including spare! Inflate to recommended PSI.'
      },
      {
        title: 'Do final exterior walk-around',
        description: 'Check for anything left out, all compartments closed.'
      },
      {
        title: 'Secure all cabinets and loose items',
        description: 'Ensure nothing will shift or fall during travel.'
      },
      {
        title: 'Test all lights and signals',
        description: 'Brake lights, turn signals, headlights.'
      },
      {
        title: 'Charge all devices',
        description: 'Phones, laptops, cameras, portable batteries to 100%.'
      },
      {
        title: 'Print/download important documents offline',
        description: 'Insurance, registration, campground confirmations.'
      },
      {
        title: 'One final systems check',
        description: 'Everything stowed, awning retracted, steps up, jacks up.'
      },
      {
        title: 'Hit the road!',
        description: 'Your adventure begins! Drive safe and enjoy the journey.'
      }
    ]
  }
};

function setupTasksTimeline() {
  // Add form submission
  document.getElementById('add-task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addPreparationTask();
  });
  
  // Search
  document.getElementById('tasks-search').addEventListener('input', debounce(() => {
    currentTasksSearch = document.getElementById('tasks-search').value.toLowerCase();
    renderTasksTimeline();
  }, 300));
  
  // Filter
  document.getElementById('tasks-filter').addEventListener('change', () => {
    currentTasksFilter = document.getElementById('tasks-filter').value;
    renderTasksTimeline();
  });
  
  // Export
  document.getElementById('export-tasks-btn').addEventListener('click', () => {
    exportTasksList();
  });
  
  // Initial render
  renderTasksTimeline();
}

function addPreparationTask() {
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const phase = document.getElementById('task-phase').value;
  
  if (!title) return;
  
  const newTask = {
    id: generateId(),
    title,
    description,
    phase,
    completed: false,
    isCustom: true,
    createdAt: new Date().toISOString()
  };
  
  preparationTasks.push(newTask);
  savePreparationTasks();
  renderTasksTimeline();
  
  // Reset form
  document.getElementById('add-task-form').reset();
  showToast('Task added!', 'success');
}

function renderTasksTimeline() {
  const timeline = document.getElementById('tasks-timeline');
  timeline.innerHTML = '';
  
  // Render each phase
  Object.keys(TASK_PHASES).forEach(phaseKey => {
    const phase = TASK_PHASES[phaseKey];
    
    // Filter: check if this phase should be shown
    if (currentTasksFilter !== 'all' && currentTasksFilter !== 'incomplete' && currentTasksFilter !== phaseKey) {
      return;
    }
    
    // Get all tasks for this phase
    const defaultTasks = phase.tasks.map(task => ({
      ...task,
      id: generateId(),
      phase: phaseKey,
      isDefault: true
    }));
    
    // Merge with user's task states
    let allTasks = defaultTasks.map(defTask => {
      const userTask = preparationTasks.find(pt => 
        pt.title === defTask.title && pt.phase === phaseKey
      );
      return userTask || defTask;
    });
    
    // Add custom tasks
    const customTasks = preparationTasks.filter(pt => pt.phase === phaseKey && pt.isCustom);
    allTasks.push(...customTasks);
    
    // Apply filters
    if (currentTasksFilter === 'incomplete') {
      allTasks = allTasks.filter(task => !task.completed);
    }
    
    // Apply search
    if (currentTasksSearch) {
      allTasks = allTasks.filter(task =>
        task.title.toLowerCase().includes(currentTasksSearch) ||
        (task.description && task.description.toLowerCase().includes(currentTasksSearch))
      );
    }
    
    if (allTasks.length === 0) return;
    
    // Create phase section
    const phaseSection = document.createElement('div');
    phaseSection.className = 'timeline-phase';
    
    const marker = document.createElement('div');
    marker.className = 'timeline-marker';
    marker.style.background = phase.color;
    marker.style.boxShadow = `0 0 0 2px ${phase.color}`;
    
    const header = document.createElement('div');
    header.className = 'phase-header';
    const completedCount = allTasks.filter(t => t.completed).length;
    header.textContent = `${phase.name} (${completedCount}/${allTasks.length})`;
    header.style.color = phase.color;
    
    phaseSection.appendChild(marker);
    phaseSection.appendChild(header);
    
    // Add tasks
    allTasks.forEach(task => {
      const taskCard = createTaskCard(task);
      phaseSection.appendChild(taskCard);
    });
    
    timeline.appendChild(phaseSection);
  });
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  
  const header = document.createElement('div');
  header.className = 'task-header';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'item-checkbox';
  checkbox.checked = task.completed || false;
  checkbox.addEventListener('change', () => {
    toggleTask(task);
  });
  
  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = task.title;
  if (task.completed) {
    title.style.textDecoration = 'line-through';
    title.style.opacity = '0.6';
  }
  
  const actions = document.createElement('div');
  actions.className = 'item-actions';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.title = 'Delete task';
  deleteBtn.addEventListener('click', async () => {
    if (await confirmDialog(`Delete task "${task.title}"?`)) {
      deleteTask(task);
    }
  });
  
  actions.appendChild(deleteBtn);
  
  header.appendChild(checkbox);
  header.appendChild(title);
  header.appendChild(actions);
  
  card.appendChild(header);
  
  // Description
  if (task.description) {
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    meta.textContent = task.description;
    card.appendChild(meta);
  }
  
  // Steps
  if (task.steps && task.steps.length > 0) {
    const steps = document.createElement('ul');
    steps.className = 'task-steps';
    task.steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      steps.appendChild(li);
    });
    card.appendChild(steps);
  }
  
  return card;
}

function toggleTask(task) {
  // Find existing task
  let existingTask = preparationTasks.find(pt => pt.title === task.title && pt.phase === task.phase);
  
  if (!existingTask) {
    // Add task to preparationTasks
    existingTask = {
      id: task.id || generateId(),
      title: task.title,
      description: task.description,
      phase: task.phase,
      steps: task.steps,
      completed: true,
      createdAt: new Date().toISOString()
    };
    preparationTasks.push(existingTask);
  } else {
    // Toggle existing task
    existingTask.completed = !existingTask.completed;
  }
  
  savePreparationTasks();
  renderTasksTimeline();
}

function deleteTask(task) {
  preparationTasks = preparationTasks.filter(pt => !(pt.title === task.title && pt.phase === task.phase));
  savePreparationTasks();
  renderTasksTimeline();
  showToast('Task deleted', 'info');
}

function exportTasksList() {
  let text = 'RV PREPARATION TASKS\n\n';
  
  Object.keys(TASK_PHASES).forEach(phaseKey => {
    const phase = TASK_PHASES[phaseKey];
    const phaseTasks = preparationTasks.filter(t => t.phase === phaseKey);
    
    if (phaseTasks.length > 0) {
      text += `${phase.name}\n`;
      phaseTasks.forEach(task => {
        const status = task.completed ? '[✓]' : '[ ]';
        text += `  ${status} ${task.title}\n`;
        if (task.description) {
          text += `      ${task.description}\n`;
        }
      });
      text += '\n';
    }
  });
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rv-preparation-tasks.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Tasks exported!', 'success');
}
