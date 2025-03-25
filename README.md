# Sleep Tracker Application

A comprehensive sleep tracking application that integrates with various health data sources and provides detailed sleep analysis and visualization.

## Architecture Overview

The application follows a modular architecture built with React and TypeScript, integrating with native health platforms through platform-specific bridges.

### Core Architecture

1. **Frontend Layer**
   - React components for UI and user interaction
   - TypeScript for type safety and better development experience
   - Material-UI for consistent design
   - Recharts for data visualization

2. **Service Layer**
   - Health data services (Apple HealthKit, Samsung Health, Health Connect)
   - Local storage service for offline data persistence
   - Cloud sync service for data backup and cross-device sync

3. **Data Layer**
   - Standardized data types for sleep, heart rate, and motion data
   - Cross-platform data format compatibility
   - Real-time data processing and analysis

### Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard and overview
│   ├── health/          # Health data components
│   └── sleep/           # Sleep tracking components
├── contexts/            # React contexts
├── services/            # Service layer
│   ├── health/          # Health data services
│   ├── storage/         # Data storage services
│   └── sync/            # Cloud sync services
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Data Types and Services

#### Core Data Types
- **SleepData**: Tracks sleep sessions with duration, quality, and phases
- **HeartRateData**: Records heart rate measurements with timestamps and confidence
- **MotionData**: Captures motion data with acceleration values and magnitude

#### Key Services
- **CloudSyncService**: Handles data synchronization with remote servers
- **LocalStorageService**: Manages local data persistence and user management
- **Health Services**: Platform-specific services for health data integration

## Key Features

### Health Data Integration
- **iOS**: Deep integration with Apple HealthKit (Not Implemented)
  - Sleep analysis
  - Heart rate monitoring
  - Motion tracking
  - Background data collection
  - Native notifications

- **Android**: Support for multiple health platforms
  - Samsung Health integration
  - Health Connect support
  - Background services
  - Native permissions handling

### Data Management
- Local storage for offline access
- Cloud synchronization
- Data export/import functionality
- Real-time data processing
- Cross-device data sync

### User Interface
- Dashboard with key metrics
- Sleep tracking interface
- Health data visualization
- Profile management
- Multi-user support (parents and children)

## Technical Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Material-UI
- **Data Visualization**: Recharts
- **State Management**: React Context API
- **Health Integration**: 
  - Samsung Health SDK
  - Apple HealthKit
- **Storage**: Local Storage + Cloud Sync

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Environment Setup

Required environment variables:
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_SAMSUNG_HEALTH_KEY`: Samsung Health API Key
- `REACT_APP_APPLE_HEALTH_KEY`: Apple Health API Key

## Data Flow

1. **Data Collection**
   ```
   Native Platform → Platform Bridge → Health Service → React Components
   ```

2. **Data Processing**
   ```
   Raw Data → Standardized Format → Analysis → Visualization
   ```

3. **Data Storage**
   ```
   Local Storage ←→ Cloud Sync ←→ Native Storage
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 