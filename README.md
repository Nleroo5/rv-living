# RV Adventures - Full-Time RV Living Planning Hub

A personal website to help plan and prepare for full-time RV living. Track finances, manage checklists, plan destinations, and budget for the adventure ahead!

## Features

### 🚐 RV Finance Calculator
- Calculate RV purchase affordability
- Estimate monthly payments with loan terms
- Factor in insurance, maintenance, and ongoing costs
- See total cost of ownership over loan term
- Get financing tips and recommendations

### ✅ Preparation Checklist
- Track everything you need to buy, organize, and prepare
- Categorize items (Purchase, Organize, Sell, Research, Documents, etc.)
- Set priority levels for each item
- Upload and store important documents locally
- Filter and track completion progress

### 🗺️ Travel Destinations & Bucket List
- Plan destinations you want to visit
- Quick-add popular national parks
- Mark destinations as visited
- Filter by type (National Parks, State Parks, Campgrounds, etc.)
- Add notes, best season to visit, and priority levels

### 💰 Monthly Budget Tracker
- Track monthly income from all sources
- Categorize and estimate all RV living expenses
- See budget breakdown by category
- Get personalized budget recommendations
- Calculate surplus/deficit automatically

## Tech Stack

- **HTML5** - Semantic markup for accessibility
- **CSS3** - Custom properties (CSS variables) for design system
- **Vanilla JavaScript** - No frameworks, pure JS for maximum performance
- **LocalStorage API** - All data persists in browser (no backend needed)

## Design System

The site uses a comprehensive design system with:
- **Brand Colors**: Teal primary (#05908C), Navy secondary (#012E40), Gold accent (#F2A922)
- **Typography Scale**: Responsive font sizes with proper hierarchy
- **Spacing Scale**: 8px baseline grid
- **Component Library**: Reusable buttons, cards, forms, badges, etc.

## Getting Started

### Local Development

1. Clone or download this repository
2. Open `index.html` in your browser
3. Start planning your RV adventure!

No build process required - it's all static HTML/CSS/JS.

### Deploying to Vercel

1. Create a GitHub repository and push this code
2. Sign up for [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Deploy! (automatic deployments on every push)

#### Alternative: Manual Deploy
```bash
cd rv-adventures
vercel deploy
```

## File Structure

```
rv-adventures/
├── index.html              # Homepage
├── calculator.html         # RV Finance Calculator
├── checklist.html         # Preparation Checklist
├── destinations.html      # Travel Destinations
├── budget.html            # Budget Tracker
├── css/
│   ├── reset.css          # Browser normalization
│   ├── variables.css      # Design system tokens
│   ├── components.css     # Reusable components
│   └── main.css           # Layout & page styles
├── js/
│   ├── utils.js           # Helper functions
│   ├── components.js      # Shared UI components
│   ├── main.js            # Homepage logic
│   ├── calculator.js      # Calculator functionality
│   ├── checklist.js       # Checklist management
│   ├── destinations.js    # Destinations management
│   └── budget.js          # Budget tracker
├── vercel.json            # Vercel configuration
├── robots.txt             # Block search engines (private site)
└── README.md              # This file
```

## Privacy & Data

**Important:** This is a personal planning website, not intended for public use.

- All data is stored locally in your browser using LocalStorage
- No data is sent to any server
- Files uploaded are stored as base64 in LocalStorage (max 5MB recommended)
- For permanent file storage, consider using Google Drive/Dropbox and linking in checklist notes
- Clear browser data = lose all stored information (export/backup recommended)

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)

Requires JavaScript enabled for full functionality.

## Future Enhancements

Consider adding:
- Export/import data functionality (JSON backup)
- Print-friendly views for checklists
- Dark mode toggle
- Budget charts/visualizations
- Map integration for destinations
- Cloud storage integration (Firebase/Supabase)
- Progressive Web App (PWA) for offline access

## License

This is a personal project. Feel free to use it as inspiration for your own RV planning!

## Credits

Built with planning, excitement, and anticipation for the RV adventure ahead! 🚐✨
