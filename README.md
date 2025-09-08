# Hvastik Alert project

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/agentgl007-7440s-projects/v0-hvastik-alert-project)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/VcPDUgLFpXa)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/agentgl007-7440s-projects/v0-hvastik-alert-project](https://vercel.com/agentgl007-7440s-projects/v0-hvastik-alert-project)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/VcPDUgLFpXa](https://v0.dev/chat/projects/VcPDUgLFpXa)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Supabase Keep-Alive System

The application includes an automatic Supabase keep-alive system to prevent the database from going into sleep mode.

### Features
- **Automatic pinging** of Supabase database
- **Configurable intervals** (5 minutes in development, 24 hours in production)
- **Error handling** with retry mechanism
- **Detailed logging** for monitoring
- **Development status widget** for real-time monitoring

### Configuration
- **Development:** Pings every 5 minutes with visual status indicator
- **Production:** Pings every 24 hours (invisible to users)
- **First ping:** 5 seconds after page load
- **Retry attempts:** Up to 3 attempts with 10-second delays

### Monitoring
- Check browser console for `[Keep-Alive]` messages
- Development mode shows status widget in bottom-right corner
- All operations are logged with timestamps

For detailed documentation, see [docs/SUPABASE_KEEP_ALIVE.md](docs/SUPABASE_KEEP_ALIVE.md)