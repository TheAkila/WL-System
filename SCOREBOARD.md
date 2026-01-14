# Scoreboard App - Mobile-Friendly Spectator View

## 📱 Overview

Mobile-optimized React web app for spectators to follow weightlifting competitions in real-time.

## ✨ Features

### 4 Main Pages

#### 1. **Live View** (`/live`)
- **Current attempt display** - Shows athlete on platform with weight
- **Attempt stats** - Current attempt number, lift type, athlete info
- **Next up list** - Shows upcoming 5 athletes in lifting order
- **Real-time updates** - Instant updates via Socket.IO

#### 2. **Live Leaderboard** (`/leaderboard`)
- **Real-time rankings** - Updates automatically after each lift
- **Medal indicators** - 🥇🥈🥉 for top 3 positions
- **Lift breakdown** - Shows snatch, clean & jerk, and total
- **Color-coded cards** - Gold, silver, bronze for podium

#### 3. **Medal Table** (`/medals`)
- **Competition standings** - Medals by country
- **Sorted rankings** - Gold > Silver > Bronze priority
- **Total count** - Overall medal count per country
- **Multi-competition support** - Filter by competition

#### 4. **Session Results** (`/results`)
- **All sessions list** - Completed and in-progress
- **Filter options** - All, Live, Completed
- **Expandable cards** - View session details
- **Quick actions** - Jump to live view or rankings

## 🎨 Mobile-First Design

### Bottom Navigation
- **Fixed bottom bar** - Always accessible navigation
- **4 tab design** - Live, Rankings, Medals, Results
- **Active indicators** - Highlighted current page
- **Touch-friendly** - Large tap targets

### Top Bar
- **Competition branding** - Lifting Live logo
- **Live indicator** - Pulsing green dot when live
- **Sticky header** - Stays visible while scrolling

### Responsive Layout
- **Max-width containers** - Optimized for mobile screens
- **Card-based UI** - Easy to scan and tap
- **Large typography** - Readable on small screens
- **Touch gestures** - Swipe-friendly

## 🔌 Real-time Updates

### Socket.IO Integration

All pages automatically update when:
- New attempt is declared
- Lift decision is recorded
- Rankings change
- Session status updates

### Auto-reconnect
- Reconnects automatically on disconnect
- Shows connection status
- Buffers updates during offline

## 📐 Component Structure

```
App (Router)
└── Layout
    ├── TopBar (Sticky)
    ├── Pages (Routed)
    │   ├── LiveView
    │   │   ├── SessionSelector
    │   │   ├── LiveAttemptCard
    │   │   └── UpcomingAthletes
    │   ├── Leaderboard
    │   │   ├── SessionSelector
    │   │   └── LeaderboardCard
    │   ├── MedalTable
    │   │   └── MedalCard
    │   └── SessionResults
    │       └── SessionResultCard
    └── BottomNavigation (Fixed)
```

## 🚀 Usage

### Start the App
```bash
cd apps/scoreboard
npm install
npm run dev
```

Access at: `http://localhost:3002`

### URL Parameters

**Session-specific views:**
```
/live?session=SESSION_ID
/leaderboard?session=SESSION_ID
```

Auto-loads the specified session.

### Navigation Flow

1. **Open app** → Redirects to `/live`
2. **No session** → Shows session selector
3. **Select session** → Loads live view
4. **Bottom nav** → Switch between pages
5. **Change session** → Tap "Change Session" button

## 🎯 Use Cases

### For Spectators at Venue
- Follow competition on personal phone
- Check current rankings
- See medal standings
- View session schedule

### For Remote Viewers
- Watch live attempts remotely
- Track favorite athletes
- Monitor country medal count
- Review past session results

### For Coaches/Teams
- Monitor athlete performance
- Track lifting order
- Compare with competitors
- Plan strategy based on rankings

## 📱 Mobile Optimization

### Performance
- **Lazy loading** - Images load on demand
- **Efficient re-renders** - React optimization
- **Minimal bundle** - Code splitting
- **Fast updates** - Incremental DOM updates

### UX Enhancements
- **Pull-to-refresh** - Refresh data with swipe
- **Loading states** - Skeleton screens
- **Error handling** - User-friendly messages
- **Offline support** - Cached data access

### Accessibility
- **High contrast** - Easy to read
- **Large touch targets** - 44px minimum
- **Semantic HTML** - Screen reader friendly
- **Keyboard navigation** - Tab-accessible

## 🎨 Design System

### Colors
- **Primary Blue**: `#2563eb` (blue-600)
- **Success Green**: `#10b981` (green-500)
- **Warning Yellow**: `#f59e0b` (yellow-500)
- **Danger Red**: `#ef4444` (red-500)
- **Gold Medal**: `#fbbf24` (yellow-400)
- **Silver Medal**: `#d1d5db` (gray-300)
- **Bronze Medal**: `#fb923c` (orange-400)

### Typography
- **Headings**: Bold, 18-24px
- **Body**: Regular, 14-16px
- **Labels**: Medium, 12-14px
- **Large Numbers**: Black, 32-48px

### Spacing
- **Page padding**: 16px
- **Card padding**: 16px
- **Section gaps**: 16px
- **Element gaps**: 8-12px

## 🧪 Testing

### Test Workflow

1. **Start all services**
   ```bash
   # Backend
   cd apps/backend && npm run dev
   
   # Admin Panel
   cd apps/admin-panel && npm run dev
   
   # Scoreboard
   cd apps/scoreboard && npm run dev
   ```

2. **Test live updates**
   - Open scoreboard on phone: `http://YOUR_IP:3002`
   - Open admin panel on computer
   - Declare attempt → Verify scoreboard updates
   - Record decision → Check rankings refresh

3. **Test navigation**
   - Tap each bottom nav item
   - Verify smooth transitions
   - Check active state highlighting

4. **Test session switching**
   - Change session
   - Verify data refreshes
   - Check URL parameters

### Device Testing

**Recommended Devices:**
- iPhone (iOS Safari)
- Android phone (Chrome)
- Tablet (iPad, Android tablet)
- Desktop browser (responsive mode)

**Screen Sizes:**
- 320px (iPhone SE)
- 375px (iPhone 12/13)
- 414px (iPhone Plus)
- 768px (iPad)

## 🐛 Troubleshooting

### No Live Updates

1. **Check Socket Connection**
   - Open browser DevTools
   - Look for "✅ Connected to Socket.IO server"
   - Check Network tab for WebSocket connection

2. **Verify Session Selected**
   - URL should have `?session=...`
   - Session status must be 'in-progress'

3. **Test Backend**
   ```bash
   curl http://localhost:5000/api/technical/sessions/active
   ```

### Rankings Not Updating

1. **Check Realtime Hook**
   - `useRealtimeUpdates` should be called
   - Session ID should be valid UUID

2. **Verify Database Triggers**
   - Rankings should auto-update in DB
   - Check backend logs for errors

3. **Manual Refresh**
   - Pull down to refresh (if implemented)
   - Navigate away and back

### Medal Table Empty

1. **Check Session Status**
   - Only completed sessions count
   - Athletes must have final totals

2. **Verify Top 3**
   - At least 3 athletes with totals
   - Rankings must be calculated

### UI Issues on Small Screens

1. **Adjust Viewport**
   - Check `meta viewport` tag
   - Ensure responsive classes

2. **Test Text Overflow**
   - Long athlete names should truncate
   - Cards should not break layout

3. **Check Bottom Nav**
   - Should stay fixed at bottom
   - Icons should not overlap

## 🔐 Security

- **Public access** - No authentication required
- **Read-only** - Cannot modify data
- **Rate limiting** - Prevents API abuse
- **CORS enabled** - Allows cross-origin requests

## 📊 Analytics Integration

Track user engagement:
- Page views per route
- Session selection frequency
- Average time on page
- Real-time viewer count

## 🌐 PWA Support (Future)

Convert to Progressive Web App:
- **Install prompt** - Add to home screen
- **Offline mode** - Cache data locally
- **Push notifications** - Alert for favorite athletes
- **Background sync** - Update when online

## 🎬 Production Deployment

### Build for Production
```bash
npm run build
```

Outputs to `dist/` directory.

### Environment Variables
```bash
# .env.production
VITE_API_URL=https://api.yourcompetition.com/api
VITE_SOCKET_URL=https://api.yourcompetition.com
```

### Hosting Options
- **Vercel** - Automatic deployments
- **Netlify** - Static site hosting
- **Firebase Hosting** - Google infrastructure
- **AWS S3 + CloudFront** - Custom setup

### Performance Checklist
- ✅ Minified JavaScript
- ✅ Compressed images
- ✅ Cached API responses
- ✅ CDN for static assets
- ✅ HTTP/2 enabled
- ✅ Gzip compression

## 📱 QR Code Access

Generate QR code for easy access:
```
https://yourcompetition.com/live?session=SESSION_ID
```

Print and display at:
- Venue entrance
- Warm-up area
- Spectator seating
- Results board

## 🎯 Future Enhancements

- [ ] Push notifications for favorite athletes
- [ ] Video replay integration
- [ ] Athlete profiles
- [ ] Historical statistics
- [ ] Social sharing
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Accessibility improvements

---

**Ready for Spectators!** 📱🏋️‍♂️
