# Jodo Gym App 🏋️‍♂️

A comprehensive React Native mobile application for Jodo Gym members, built with Expo and TypeScript. The app provides gym members with workout tracking, class scheduling, membership management, and location-based features.

## 🌟 Features

### 🔐 Authentication & User Management
- **User Registration & Login** - Secure authentication with JWT tokens
- **Password Reset** - Three-step password recovery process
- **User Profile Management** - Edit profile, change password, upload photos
- **First-time User Setup** - Guided onboarding experience

### 🏃‍♂️ Activity Tracking
- **Automatic Workout Detection** - GPS-based gym entry/exit detection
- **Background Location Tracking** - Continuous monitoring when near gym
- **Workout Session Management** - Start, track, and end workout sessions
- **Activity History** - View past workout sessions and statistics

### 📅 Class Scheduling & Booking
- **Weekly Schedule View** - Browse gym classes and personal training slots
- **Class Booking System** - Reserve spots in fitness classes
- **Booking Management** - View and cancel existing bookings
- **Real-time Availability** - Live updates on class capacity

### 💳 Membership Management
- **Membership Types** - View available membership plans
- **Purchase History** - Track membership purchases and renewals
- **Active Membership Status** - Monitor current membership details

### 🏆 Social Features
- **Gym Rankings** - Leaderboards based on workout frequency
- **Community Posts** - Share updates and interact with other members
- **Sativa Life Products** - Browse wellness and nutrition products

### 🛍️ Sativa Life Products
- **Product Catalog** - Browse wellness and nutrition products by category
- **Product Details** - View detailed information about supplements and gear
- **Integrated Shopping** - Seamless purchasing experience

## 🛠️ Technology Stack

### Frontend
- **React Native** (0.79.5) - Cross-platform mobile development
- **Expo** (53.0.19) - Development platform and build tools
- **TypeScript** (~5.8.3) - Type-safe development
- **Expo Router** (~5.1.3) - File-based navigation system

### Key Libraries
- **Authentication**: JWT tokens with expo-secure-store
- **State Management**: React Context API (AuthContext, UserContext)
- **HTTP Client**: Axios (1.11.0) for API communication
- **Location Services**: Expo Location (18.1.6) with background tracking
- **UI Components**: Custom components with @expo/vector-icons
- **Date Handling**: Day.js (1.11.13) and date-fns-tz
- **Image Handling**: Expo Image Picker and Expo Image
- **Notifications**: Expo Notifications for workout alerts
- **Animations**: React Native Reanimated (3.17.4)

## 📱 App Structure

```
JodoApp/
├── app/                     # Expo Router app directory
│   ├── (tabs)/             # Tab-based navigation
│   │   ├── index.tsx       # Home/Profile screen
│   │   ├── posts.tsx       # Community posts
│   │   └── sativa.tsx      # Product catalog
│   ├── activity.tsx        # Activity tracking
│   ├── schedule.tsx        # Class scheduling
│   ├── ranking.tsx         # Gym leaderboards
│   ├── purchase.tsx        # Purchase history
│   └── membershipTypes.tsx # Membership plans
��
├── components/             # Reusable UI components
│   ├── auth/              # Authentication screens
│   ├── user/              # User profile & settings
│   ├── schedule/          # Scheduling components
│   ├── ranking/           # Ranking displays
│   ├── sativa/            # Product catalog
│   ├── post/              # Social features
│   └── ui/                # Base UI components
│
├── api/                   # API layer
│   ├── client.ts          # HTTP client configuration
│   ├── auth.ts            # Authentication endpoints
│   ├── activity.ts        # Workout tracking
│   ├── schedule.ts        # Class booking
│   ├── user.ts            # User management
│   └── membership.ts      # Membership operations
│
├── context/               # Global state management
│   ├── AuthContext.tsx    # Authentication state
│   └── UserContext.tsx    # User data state
│
├── hooks/                 # Custom React hooks
│   ├── useLocationTracking.ts
│   └── useColorScheme.ts
│
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (16.15.0 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **EAS CLI** (`npm install -g eas-cli`)
- **iOS Simulator** or **Android Emulator** (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gosqu248/JodoApp.git
   cd JodoApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   API_URL=http://your-api-url/api
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

### Development Scripts

```bash
npm run start          # Start Expo development server
npm run android        # Run on Android emulator/device
npm run ios           # Run on iOS simulator/device
npm run web           # Run in web browser
npm run lint          # Run ESLint
```

## 📍 Location Features

The app includes sophisticated location tracking capabilities:

- **Geofencing**: Automatic workout detection when entering/leaving gym premises
- **Background Tracking**: Continues monitoring location when app is backgrounded
- **Distance Calculation**: Precise distance measurement from gym location
- **Smart Notifications**: Contextual alerts for workout start/end

### Location Permissions
- **iOS**: Location access when in use and always (background)
- **Android**: Fine location, coarse location, and background location

## 🔧 Configuration

### App Configuration (`app.config.js`)
```json
{
  "expo": {
    "name": "JodoGym App",
    "slug": "JodoGymApp",
    "version": "1.0.0",
    "bundleIdentifier": "com.gosqu.JodoApp",
    "scheme": "jodoapp"
  }
}
```

### Build Configuration (`eas.json`)
- **Development**: Internal distribution with development client
- **Preview**: Internal testing builds  
- **Production**: Auto-increment versioning for app stores

### TypeScript Configuration
- **Strict mode** enabled for better type safety
- **Path mapping** configured (`@/*` points to project root)
- **Expo TypeScript base** configuration extended

## 🎨 Design System

- **Color Scheme**: Custom dark theme with yellow (#ffc500) accents
- **Typography**: SpaceMono font integration
- **Layout**: Gradient backgrounds with responsive design
- **Icons**: Expo Vector Icons with platform-specific adaptations
- **Navigation**: Bottom tab navigation with haptic feedback

## 🧪 Development Features

- **TypeScript**: Full type safety with strict configuration
- **ESLint**: Expo ESLint configuration for code quality
- **Hot Reload**: Instant development feedback with Expo Dev Client
- **Cross-platform**: Simultaneous iOS, Android, and web development
- **New Architecture**: React Native's new architecture enabled

## 📦 Key Dependencies

- **Navigation**: React Navigation with bottom tabs
- **Storage**: Async Storage for data persistence, Secure Store for sensitive data
- **Forms**: Custom form handling with validation
- **Media**: Image picker and camera integration
- **Gestures**: React Native Gesture Handler for smooth interactions

## 🏗️ Architecture

The app follows a modular architecture with:

- **File-based Routing**: Expo Router for intuitive navigation structure
- **Context Providers**: AuthContext and UserContext for global state
- **Custom Hooks**: Reusable logic for location tracking and theme management
- **Type Definitions**: Comprehensive TypeScript interfaces in `/types`
- **Utility Functions**: Helper functions for calculations and error handling
- **API Layer**: Centralized HTTP client with interceptors for authentication

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Secure Storage**: Sensitive data encrypted with expo-secure-store
- **API Security**: Request/response interceptors for token management
- **Background Processing**: Secure background task management

## 📱 Platform Support

- **iOS**: Full native support with iOS-specific optimizations
  - Bundle ID: `com.gosqu.JodoApp`
  - Supports iPad
  - Background location tracking
  
- **Android**: Complete Android integration
  - Package: `com.gosqu.JodoApp`
  - Adaptive icons with dark theme
  - Edge-to-edge enabled

- **Web**: Progressive web app capabilities (limited features)

## 🚀 Deployment

### EAS Build
```bash
# Development build
eas build --profile development

# Preview build
eas build --profile preview

# Production build
eas build --profile production
```

### EAS Submit
```bash
# Submit to app stores
eas submit --profile production
```

## 📊 Project Stats

- **TypeScript Coverage**: 100% (strict mode enabled)
- **Bundle ID**: `com.gosqu.JodoApp`
- **EAS Project ID**: `8b7a1333-655e-4701-ba0c-dc6c22c7f95b`
- **Minimum Node Version**: 16.15.0

---

**Built with ❤️ for Jodo Gym members**

For technical support or feature requests, please contact the development team.
