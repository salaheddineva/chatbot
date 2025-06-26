---
applyTo: "**"
---

# Chatbot Project Knowledge

## Project Overview

This is a real-time voice chatbot application built with Laravel and OpenAI's Realtime API. The application creates an interactive voice conversation experience with an AI assistant using browser-based audio processing.

## Architecture & Technology Stack

### Backend (Laravel 11)

-   **Framework**: Laravel 11.31 with PHP 8.2+
-   **Database**: SQLite (for development)
-   **Deployment**: AWS Lambda via Laravel Vapor
-   **Audio Serving**: Custom route for serving audio assets with proper MIME types

### Frontend & Audio Processing

-   **Build Tool**: Vite for asset compilation
-   **Styling**: Tailwind CSS
-   **Audio Libraries**: Custom wavtools library for browser-based audio processing
-   **Real-time Communication**: OpenAI Realtime API (beta) client library

### Key Components

#### Audio Processing Pipeline

1. **WavRecorder**: Records user audio from microphone as PCM16 data

    - 24kHz sample rate for optimal quality
    - Real-time VAD (Voice Activity Detection)
    - Browser AudioWorklet-based processing

2. **WavStreamPlayer**: Plays AI-generated audio responses

    - Streams PCM16 audio chunks in real-time
    - Handles audio interruption and track management

3. **RealtimeClient**: Manages OpenAI Realtime API connection
    - WebSocket-based communication
    - Server-side VAD configuration
    - Whisper-1 transcription integration

#### Visual Interface

-   **Floating Bot Avatar**: Positioned bottom-right with state indicators
    -   `normal.png`: Default/listening state
    -   `speaking.png`: When AI is responding
    -   `hearing.png`: When user is speaking
-   **Wave Animation**: Visual feedback during audio playback
-   **Microphone Control**: Click-to-toggle voice interaction

## Environment Configuration

### Required Environment Variables

```env
VITE_LOCAL_RELAY_SERVER_URL=""  # Realtime API relay server
VITE_ASSET_URL_BASE=""          # Base URL for audio assets
```

### Development Setup

-   Uses SQLite database
-   Concurrent development script runs: server, queue, logs, vite
-   Hot reload enabled for frontend assets

### Production Deployment

-   AWS Lambda via Laravel Vapor
-   Multi-environment support (staging/production)
-   Optimized build process with asset compilation

## Code Architecture Patterns

### Audio State Management

```javascript
const BOT_ACTIONS = {
    NORMAL: "normal",
    SPEAKING: "speaking",
    HEARING: "hearing",
};
```

### Real-time Event Handling

-   Event-driven architecture for audio processing
-   Conversation state management through RealtimeClient
-   Audio buffer management for seamless streaming

### Asset Management

-   Custom Laravel route for serving images with proper MIME detection
-   Environment-aware asset URL generation
-   Optimized for both local development and production

## Key Features

1. **Voice-First Interface**: Primary interaction through speech
2. **Real-time Processing**: Low-latency audio streaming and response
3. **Visual Feedback**: Dynamic avatar states and wave animations
4. **Cross-Platform**: Browser-based, works on any device with microphone
5. **Scalable Deployment**: Serverless architecture via Laravel Vapor

## Development Guidelines

-   Follow Laravel 11 conventions and best practices
-   Use modern JavaScript ES6+ features
-   Maintain real-time performance with efficient audio processing
-   Ensure proper error handling for audio permissions and connections
-   Test across different browsers for audio compatibility

Coding standards, domain knowledge, and preferences that AI should follow.
