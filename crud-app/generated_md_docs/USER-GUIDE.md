# Contact Manager - User Guide
## Quick Reference for End Users

**Version**: 2.0  
**Last Updated**: June 18, 2026

---

## Getting Started

### Accessing the Application

Open your web browser and navigate to:
- **Production**: http://localhost:5000 (or your deployed URL)
- **Development**: http://localhost:3000

---

## Main Interface

The Contact Manager has two main sections:

### 1. Add Contact Form (Top)
- **Name Field**: Enter the contact's full name
- **Address Field**: Enter the contact's complete address
- **Add Contact Button**: Click to save the new contact

### 2. Contact List (Bottom)
- **Scrollable List**: Browse through all your contacts
- **Contact Names**: Click any name to view details
- **Address Preview**: See a preview of each contact's address

---

## How to Use

### Adding a New Contact

1. Type the contact's name in the **Name** field
2. Type the contact's address in the **Address** field
3. Click the **Add Contact** button
4. The new contact appears in the list immediately

**Example**:
- Name: `Jane Smith`
- Address: `456 Oak Avenue, Portland, OR 97201`

### Viewing Contact Details

1. **Click on any contact name** in the list
2. A modal window opens showing:
   - Full name
   - Complete address
3. From here you can:
   - **Edit** the contact
   - **Delete** the contact
   - **Close** the window

### Editing a Contact

1. Click on the contact name to open the modal
2. Click the **Edit** button (green button with pencil icon)
3. Modify the name or address as needed
4. Click **Save Changes** to update
5. Or click **Cancel** to discard changes

**Tips**:
- Both name and address fields must be filled
- Changes are saved immediately
- The modal closes automatically after saving

### Deleting a Contact

1. Click on the contact name to open the modal
2. Click the **Delete** button (red button with trash icon)
3. A confirmation message appears showing:
   - The contact's name and address
   - Warning: "This action cannot be undone"
4. Click **Yes, Delete** to confirm
5. Or click **Cancel** to keep the contact

**Warning**: Deleted contacts cannot be recovered!

### Closing the Modal

You can close the modal window in three ways:

1. **X Button**: Click the ✕ in the top-right corner
2. **Close Button**: Click the "Close" button at the bottom
3. **Click Outside**: Click anywhere on the dark background

---

## Keyboard Navigation

### General Navigation
- **Tab**: Move to the next interactive element
- **Shift + Tab**: Move to the previous element
- **Enter**: Activate buttons and links
- **Escape**: Close the modal window

### In the Contact List
- **Arrow Up/Down**: Scroll through the list
- **Page Up/Down**: Scroll faster
- **Home**: Jump to the top of the list
- **End**: Jump to the bottom of the list

### In Forms
- **Tab**: Move between fields
- **Enter**: Submit the form (when in a field)

---

## Mobile Usage

### Touch Gestures

- **Tap**: Select items, open modals, press buttons
- **Swipe Up/Down**: Scroll through the contact list
- **Tap Outside Modal**: Close the modal window

### Mobile Tips

1. **Portrait Mode**: Best for viewing and editing
2. **Landscape Mode**: Optimized for browsing the list
3. **Zoom**: Pinch to zoom if text is too small
4. **Buttons**: All buttons are sized for easy tapping (44x44 pixels minimum)

---

## Tips and Best Practices

### Data Entry

✅ **Do**:
- Use full names (first and last)
- Include complete addresses with city, state, and ZIP
- Double-check spelling before saving
- Use consistent formatting

❌ **Don't**:
- Leave fields empty
- Use abbreviations that might be unclear
- Enter duplicate contacts

### Organization

- **Alphabetical Order**: Contacts are displayed in the order they were added
- **Search**: Use your browser's find function (Ctrl+F or Cmd+F) to search
- **Backup**: The data is automatically saved, but consider backing up `data.json`

### Performance

- **Scrolling**: The list handles hundreds of contacts smoothly
- **Loading**: First load may take 1-2 seconds
- **Updates**: Changes are instant and don't require page refresh

---

## Troubleshooting

### Common Issues

#### "Failed to fetch contacts"
**Problem**: Cannot load contacts from server  
**Solution**:
1. Check your internet connection
2. Ensure the server is running
3. Refresh the page (F5 or Cmd+R)

#### Modal won't open
**Problem**: Clicking contact names does nothing  
**Solution**:
1. Refresh the page
2. Check if JavaScript is enabled
3. Try a different browser

#### Can't scroll the list
**Problem**: Contact list doesn't scroll  
**Solution**:
1. Ensure you have more than 10 contacts
2. Try using arrow keys or mouse wheel
3. Check browser zoom level (should be 100%)

#### Changes not saving
**Problem**: Edits or new contacts disappear  
**Solution**:
1. Check server console for errors
2. Verify you have write permissions
3. Ensure `data.json` exists and is writable

#### Layout looks broken
**Problem**: Elements overlap or are misaligned  
**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Reset zoom to 100%
3. Update your browser to the latest version
4. Try a different browser

---

## Browser Compatibility

### Fully Supported Browsers

✅ **Desktop**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

✅ **Mobile**:
- Safari (iOS 14+)
- Chrome (Android 90+)
- Samsung Internet 14+

### Minimum Requirements

- JavaScript enabled
- CSS3 support
- Screen resolution: 320x568 or higher
- Internet connection (for initial load)

---

## Accessibility Features

### For Screen Reader Users

- All interactive elements have proper labels
- Modal dialogs announce their purpose
- Form fields have descriptive labels
- Error messages are announced

**Recommended Screen Readers**:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

### For Keyboard-Only Users

- All features accessible via keyboard
- Clear focus indicators on all elements
- Logical tab order
- No keyboard traps

### For Low Vision Users

- High contrast text (4.5:1 minimum)
- Resizable text (up to 200%)
- No horizontal scrolling required
- Large touch targets (44x44 pixels)

---

## Data Privacy

### What Data is Stored

- Contact names
- Contact addresses
- No personal user data
- No tracking or analytics

### Where Data is Stored

- **Local Storage**: `data.json` file on the server
- **No Cloud**: Data stays on your server
- **No Third Parties**: No data shared externally

### Data Backup

**Recommended**: Regularly backup your `data.json` file

**Location**: `crud-app/data.json`

**Backup Method**:
1. Copy `data.json` to a safe location
2. Or use your server's backup system
3. Consider version control (Git)

---

## Frequently Asked Questions

### Can I import contacts from another system?
Not currently. This feature is planned for a future version.

### Is there a limit to how many contacts I can add?
No hard limit, but performance may degrade with 1000+ contacts.

### Can I add photos to contacts?
Not in the current version. This is a planned enhancement.

### Can multiple users access the same contact list?
Yes, but there's no conflict resolution. Last save wins.

### Can I export my contacts?
Not currently. You can manually copy the `data.json` file.

### Is there a mobile app?
No, but the web interface is fully responsive and works on mobile browsers.

### Can I customize the appearance?
Not through the UI. Developers can modify the CSS files.

### Is there an undo feature?
No. Be careful when deleting contacts as this cannot be undone.

---

## Getting Help

### Support Resources

1. **Documentation**: Check [FRONTEND-UPDATES.md](./FRONTEND-UPDATES.md) for technical details
2. **Troubleshooting**: See the Troubleshooting section above
3. **Browser Console**: Press F12 to check for error messages
4. **Server Logs**: Check server console for backend errors

### Reporting Issues

When reporting a problem, include:
- Browser name and version
- Operating system
- Steps to reproduce the issue
- Any error messages
- Screenshots if applicable

---

## Keyboard Shortcuts Reference

| Action | Shortcut |
|--------|----------|
| Navigate forward | Tab |
| Navigate backward | Shift + Tab |
| Activate button/link | Enter or Space |
| Close modal | Escape |
| Scroll list up | Arrow Up |
| Scroll list down | Arrow Down |
| Page up | Page Up |
| Page down | Page Down |
| Top of list | Home |
| Bottom of list | End |
| Find in page | Ctrl+F (Cmd+F on Mac) |
| Refresh page | F5 or Ctrl+R (Cmd+R on Mac) |

---

## Version History

### Version 2.0 (June 18, 2026)
- ✨ New scrolling contact list
- ✨ Modal windows for view/edit/delete
- ✨ Fully responsive design
- ✨ Enhanced accessibility
- ✨ Improved mobile experience

### Version 1.0 (Previous)
- Initial release
- Basic CRUD operations
- Grid layout
- Simple responsive design

---

## Quick Tips

💡 **Pro Tips**:
1. Use Tab to quickly navigate between fields
2. Press Enter to submit forms without clicking
3. Click outside the modal to close it quickly
4. Use your browser's find function to search contacts
5. Bookmark the page for quick access

⚠️ **Important Reminders**:
1. Always double-check before deleting
2. Fill in both name and address fields
3. Refresh if something doesn't work
4. Backup your data regularly

---

*End of User Guide*