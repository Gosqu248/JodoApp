import { useState, useEffect, useRef, useCallback } from 'react';
     import * as Location from 'expo-location';
     import { Alert } from 'react-native';
     import { updateLocation } from '@/api/activity';
     import { LocationResponse } from '@/types/LocationResponse';
     import AsyncStorage from '@react-native-async-storage/async-storage';

     // ================== CONSTANTS ==================
     const LOCATION_UPDATE_INTERVAL = 60000; // 1 min
     const STORAGE_KEYS = {
         USER_ID: 'user_id_for_location',
     } as const;

     const LOCATION_CONFIG = {
         accuracy: Location.Accuracy.High,
     };

     // ================== INTERFACES ==================
     interface LocationTrackingState {
         isInGym: boolean;
         sessionDetails: {
             startTime: string | null;
             currentSessionMinutes: number | null;
         };
         isTracking: boolean;
         startTracking: () => Promise<void>;
         stopTracking: () => Promise<void>;
     }

     // ================== MAIN HOOK ==================
     export function useLocationTracking(userId: string | null): LocationTrackingState {
         const [isInGym, setIsInGym] = useState(false);
         const [sessionDetails, setSessionDetails] = useState<{
             startTime: string | null;
             currentSessionMinutes: number | null;
         }>({ startTime: null, currentSessionMinutes: null });
         const [isTracking, setIsTracking] = useState(false);

         const locationSubscription = useRef<Location.LocationSubscription | null>(null);
         const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

         /**
          * Save user ID in AsyncStorage
          */
         useEffect(() => {
             if (userId) {
                 void AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
             } else {
                 void AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
             }
         }, [userId]);

         /**
          * Function sending location to the backend
          */
         const sendLocationUpdate = useCallback(async () => {
             if (!userId) {
                 console.log('No userId, stopping location updates.');
                 return;
             }

             try {
                 const location = await Location.getCurrentPositionAsync(LOCATION_CONFIG);
                 const { latitude, longitude } = location.coords;

                 const response: LocationResponse = await updateLocation(userId, { latitude, longitude });

                 console.log('Server response:', response);

                 setIsInGym(response.isInGym);
                 setSessionDetails({
                     startTime: response.startTime,
                     currentSessionMinutes: response.currentSessionMinutes,
                 });

             } catch (error) {
                 console.error('Error sending location:', error);
             }
         }, [userId]);

         /**
          * Start location tracking
          */
         const startTracking = useCallback(async () => {
             if (!userId || isTracking) {
                 console.log('Tracking already active or no user ID.');
                 return;
             }

             try {
                 const { status } = await Location.requestForegroundPermissionsAsync();
                 if (status !== 'granted') {
                     Alert.alert('Error', 'The app requires location access to work properly.');
                     return;
                 }

                 setIsTracking(true);
                 await sendLocationUpdate(); // Send location immediately after starting

                 // Set interval for sending location
                 trackingInterval.current = setInterval(sendLocationUpdate, LOCATION_UPDATE_INTERVAL);
                 console.log('Location tracking started.');

             } catch (error) {
                 console.error('Failed to start tracking:', error);
                 Alert.alert('Error', 'Could not start location tracking.');
             }
         }, [userId, isTracking, sendLocationUpdate]);

         /**
          * Stop location tracking
          */
         const stopTracking = useCallback(async () => {
             if (trackingInterval.current) {
                 clearInterval(trackingInterval.current);
                 trackingInterval.current = null;
             }

             if (locationSubscription.current) {
                 locationSubscription.current.remove();
                 locationSubscription.current = null;
             }

             setIsTracking(false);
             setIsInGym(false);
             setSessionDetails({ startTime: null, currentSessionMinutes: null });
             console.log('Location tracking stopped.');
         }, []);

         /**
          * Cleanup on component unmount
          */
         useEffect(() => {
             return () => {
                 if (trackingInterval.current) {
                     clearInterval(trackingInterval.current);
                 }
                 if (locationSubscription.current) {
                     locationSubscription.current.remove();
                 }
             };
         }, []);

         return {
             isInGym,
             sessionDetails,
             isTracking,
             startTracking,
             stopTracking,
         };
     }