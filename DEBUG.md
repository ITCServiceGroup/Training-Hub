# Authentication Debugging Guide

This document provides steps for debugging the authentication issues in the Training Hub v2 application.

## Problem Description

The login process appears to start but then immediately redirects back to the login page, without showing any console errors. This could be caused by several issues:

1. Authentication state not persisting properly
2. Session not being correctly stored in localStorage
3. Redirect loop in the authentication flow
4. Issues with Supabase auth token validation

## Debugging Tools

We've added extensive debugging tools to help diagnose the issue:

### Browser Console Debug Helper

Open your browser console (F12) and use these commands:

```javascript
// View all persisted logs (from previous login attempts)
debugAuth.viewLogs();

// Check current authentication state
debugAuth.getSessionInfo();

// Inspect localStorage content
debugAuth.getLocalStorage();

// Force sign out and clear localStorage (to start fresh)
debugAuth.forceSignOut();
```

### Checking for Specific Issues

1. **Check if login succeeded but state didn't update:**
   - After login attempt, run `debugAuth.getSessionInfo()`
   - If this shows a valid session but you're still on the login page, it's a state issue

2. **Check if localStorage has the session token:**
   - Run `debugAuth.getLocalStorage()`
   - Look for a key starting with `sb-` that contains the auth token

3. **Check for redirect loop:**
   - Look at the logs from `debugAuth.viewLogs()`
   - If you see repeated "Redirecting to admin" followed by "User is not authenticated", there's a timing issue

## Potential Solutions

Try these steps to resolve the issue:

1. **Clear browser storage and try again:**
   ```javascript
   // Run this in console
   debugAuth.forceSignOut();
   ```

2. **Verify your Supabase credentials:**
   - Double-check the `.env` file values match what's in Supabase
   - Ensure the user exists in Supabase and has the right permissions

3. **Check browser network tab:**
   - Look for API calls to Supabase that might be failing
   - Check for CORS errors or blocked requests

4. **Try a different browser:**
   - Sometimes authentication issues can be browser-specific

5. **Inspect the Supabase JWT token directly:**
   - Look at the contents of the auth token to check if it's valid
   - Run `window.localStorage.getItem('<supabase-key>')` and paste the token into a JWT debugger

## Logging Analysis

If none of these steps work, copy the full logs from `debugAuth.viewLogs()` and analyze:

1. Did the login succeed but the session wasn't persisted?
2. Was there an error during authentication that wasn't displayed?
3. Is there a timing issue where the auth state changes too quickly?
