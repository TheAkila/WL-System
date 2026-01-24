# Data Persistence - Quick Reference

## 🎯 What Changed
**500ms debounced save → IMMEDIATE save**

Every keystroke now saves to database instantly.

## ✅ How It Works

```
User edits cell
    ↓
UI updates immediately (you see change)
    ↓
Backend saves NOW (no wait)
    ↓
"✓ Saved" appears (green checkmark)
    ↓
Other devices sync in real-time
```

## 📊 Visual Indicators

| Icon | Meaning | What to Do |
|------|---------|-----------|
| 💾 Saving... | Data being sent | Wait 1-2 seconds |
| ✓ Saved | Data in database | You're good! Continue |
| ⚠️ Failed | Save failed | Try editing again |

## 🚀 Performance

- **Optimistic update**: 0-1ms (instant)
- **Network send**: 100-500ms (typical)
- **Database save**: 20-100ms (SupaBase)
- **Total**: ~150-600ms end-to-end

## 🛡️ Error Cases

### No Internet Connection
```
You edit → Shows immediately → "⚠️ Failed" toast
→ Data stays on screen → Fix connection → Try again
```

### Backend Down
```
You edit → Shows immediately → "⚠️ Failed" toast
→ Contact admin to restart → Try again
```

### Invalid Data
```
You enter weight > 500kg → Shows immediately → Backend rejects
→ "⚠️ Failed: Invalid weight" → Edit and try again
```

## 💡 Key Points

✅ Data ALWAYS shows immediately when you type
✅ Save happens in BACKGROUND (no waiting)
✅ If save fails, data STAYS in UI (not lost)
✅ Green checkmark = safe to continue
✅ Red error = need to retry (or check connection)

## ⚡ During Competition

**You can trust it:**
- Every attempt you enter is saved
- Even if you disconnect, UI data stays safe
- Once you reconnect, it saves

**If something goes wrong:**
1. Watch for error toast ⚠️
2. Check your internet
3. Retry the edit
4. If still fails, contact admin

## 🔄 Real-Time Sync

When you save, other tablets/screens update automatically:
- Other officials see your entries instantly
- Scoreboard updates in real-time
- Display screen reflects changes

## 📱 Testing

Quick test to verify it's working:
1. Edit any attempt cell
2. Watch for green "✓ Saved" checkmark in header
3. Done! Data is in database

## ⚠️ Emergency: Data Lost?

**Step 1**: Refresh page (Cmd+R or Ctrl+R)
**Step 2**: Data should reappear (it's in database)

**If still gone**: Contact admin immediately with screenshot.

---

**Bottom line**: You can now use the competition sheet with confidence that every entry is saved immediately and safely in the database.
