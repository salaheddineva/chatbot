---
applyTo: "**"
---

# Chatbot Project Knowledge

## Project Overview

This is a real-time voice chatbot application built with Laravel and OpenAI's Realtime API. The application creates an interactive voice conversation experience with specialized AI agents using browser-based audio processing. The system supports multiple agent types with distinct roles and capabilities, including appointment scheduling and customer interaction management.

## Architecture & Technology Stack

### Backend (Laravel 11)

-   **Framework**: Laravel 11.31 with PHP 8.2+
-   **Database**: SQLite (for development)
-   **Deployment**: AWS Lambda via Laravel Vapor
-   **Audio Serving**: Custom route for serving audio assets with proper MIME types
-   **Appointment System**: Full CRUD appointment management with calendar integration
-   **API Endpoints**: RESTful APIs for appointment availability, creation, and slot finding

### Frontend & Audio Processing

-   **Build Tool**: Vite for asset compilation
-   **Styling**: Tailwind CSS
-   **Audio Libraries**: Custom wavtools library for browser-based audio processing
-   **Real-time Communication**: OpenAI Realtime API (beta) client library
-   **Agent System**: Multiple specialized conversational agents with role-based capabilities

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
    - Enhanced transcription with gpt-4o-transcribe model
    - Tool integration for function calling capabilities
    - Multiple conversation modes and interruption handling
    - Uses latest gpt-4o-realtime-preview-2025-06-03 model

#### Agent System

-   **Multiple Agent Types**: Specialized conversational agents with distinct roles
    -   `prospecting-agent`: Sales and lead generation focused
    -   `reception-agent`: Customer service and appointment scheduling
    -   `assistant-agent`: General assistance and support
-   **Tool Integration**: Agents can access external functions and APIs
-   **Context-Aware Responses**: Role-specific instructions and conversation flow
-   **Dynamic Agent Selection**: Users can select agent type before conversation

#### Appointment Management

-   **Calendar Integration**: Full appointment scheduling system
-   **Availability Checking**: Real-time calendar availability queries
-   **Slot Finding**: Automatic available time slot detection
-   **Tool-Enabled Agents**: Reception agent can schedule appointments via voice
-   **RESTful API**: Complete CRUD operations for appointment management

#### Visual Interface

-   **Floating Bot Avatar**: Positioned bottom-right with state indicators
    -   `normal.png`: Default/listening state
    -   `speaking.png`: When AI is responding
    -   `hearing.png`: When user is speaking
-   **Wave Animation**: Visual feedback during audio playback with dynamic visibility
-   **Microphone Control**: Click-to-toggle voice interaction
-   **Agent Selection**: Dropdown interface for choosing specialized agents
-   **Conversation Management**: Intelligent goodbye detection and automatic conversation ending

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
-   Node.js development environment examples included
-   Multiple agent configuration system
-   Appointment API endpoints for calendar integration

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
-   Advanced interruption handling with track management
-   Tool-based function calling for agent capabilities
-   Natural conversation flow with goodbye detection

### Agent Architecture

```javascript
const agents = [
  { name: 'prospecting-agent', file: 'prospecting-agent.agent.js' },
  { name: 'reception-agent', file: 'reception-agent.agent.js' }, 
  { name: 'assistant-agent', file: 'assistant-agent.agent.js' },
];
```

### Appointment Integration

-   **AppointmentService.php**: Backend service for calendar management
-   **appointment.service.js**: Frontend service for API integration
-   **Tool Integration**: Agents can schedule appointments via function calls
-   **API Endpoints**: 
    - `/api/appointments/availability` - Check calendar availability
    - `/api/appointments/create` - Create new appointments
    - `/api/appointments/available-slots` - Find available time slots

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
6. **Multi-Agent System**: Specialized agents for different business functions
7. **Appointment Scheduling**: Voice-enabled calendar management
8. **Tool Integration**: Function calling capabilities for enhanced agent functionality
9. **Intelligent Conversation Flow**: Natural goodbye detection and conversation management
10. **API-First Design**: RESTful backend with frontend integration

## Development Guidelines

-   Follow Laravel 11 conventions and best practices
-   Use modern JavaScript ES6+ features
-   Maintain real-time performance with efficient audio processing
-   Ensure proper error handling for audio permissions and connections
-   Test across different browsers for audio compatibility
-   Implement agent-specific functionality through modular design
-   Use proper tool integration patterns for function calling
-   Follow RESTful API design principles for backend services
-   Maintain conversation state consistency across agent interactions
-   Optimize appointment scheduling workflows for user experience

## Recent Updates (2025)

### OpenAI Realtime API Enhancements
-   **Model Update**: Now using `gpt-4o-realtime-preview-2025-06-03`
-   **Transcription**: Enhanced with `gpt-4o-transcribe` model
-   **VAD Configuration**: Improved server-side voice activity detection

### Agent System Implementation
-   **Multi-Agent Architecture**: Support for specialized conversation agents
-   **Tool Integration**: Function calling capabilities for external API access
-   **Role-Based Instructions**: Agent-specific conversation guidelines and capabilities

### Appointment Management
-   **Backend Service**: Complete Laravel-based appointment management
-   **API Integration**: RESTful endpoints for calendar operations
-   **Voice Scheduling**: Natural language appointment booking through agents

### Conversation Enhancements
-   **Natural Flow**: Intelligent goodbye detection and conversation ending
-   **State Management**: Enhanced audio and conversation state handling
-   **Interruption Handling**: Improved audio track management and user interruptions

Coding standards, domain knowledge, and preferences that AI should follow.
