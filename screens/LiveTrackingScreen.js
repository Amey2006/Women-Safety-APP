import React, { useEffect, useMemo, useRef, useState } from 'react';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
// import crimeHotspots from '../data/crimeHotspots.json';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

const FALLBACK_REGION = {
  latitude: 18.5204,
  longitude: 73.8567,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const CarIcon = () => (
  <View style={styles.carIconContainer}>
    <View style={styles.carBody} />
    <View style={styles.carRoof} />
    <View style={styles.carWheelLeft} />
    <View style={styles.carWheelRight} />
  </View>
);

const formatTime = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

const formatElapsed = (startDate) => {
  const diffMs = Date.now() - startDate.getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const toKm = (meters) => (meters / 1000).toFixed(2);

const haversineDistanceInMeters = (prev, next) => {
  if (!prev || !next) return 0;

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000;

  const dLat = toRad(next.latitude - prev.latitude);
  const dLon = toRad(next.longitude - prev.longitude);

  const lat1 = toRad(prev.latitude);
  const lat2 = toRad(next.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getRiskFromSpeed = (speedKmh) => {
  if (speedKmh >= 80) {
    return { label: 'HIGH', color: '#DC2626', bg: '#FEE2E2', percent: 88 };
  }
  if (speedKmh >= 50) {
    return { label: 'MEDIUM', color: '#D97706', bg: '#FEF3C7', percent: 58 };
  }
  return { label: 'LOW', color: '#16A34A', bg: '#DCFCE7', percent: 24 };
};

export default function LiveTrackingScreen() {
  const [location, setLocation] = useState(null);
  const [currentPlace, setCurrentPlace] = useState('Fetching area...');
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [tripDistance, setTripDistance] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());
  const [trackingStartedAt] = useState(new Date());
  const [isRecording] = useState(true);

  const previousCoordsRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['18%', '45%', '78%'], []);

  useEffect(() => {
    let subscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permission denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (position) => {
          const coords = position.coords;

          setLocation(coords);
          setLastUpdatedAt(new Date());

          const speedInKmh =
            coords.speed && coords.speed > 0
              ? Math.round(coords.speed * 3.6)
              : 0;
          setSpeed(speedInKmh);

          if (previousCoordsRef.current) {
            const delta = haversineDistanceInMeters(previousCoordsRef.current, {
              latitude: coords.latitude,
              longitude: coords.longitude,
            });

            if (delta > 0 && delta < 1000) {
              setTripDistance((prev) => prev + delta);
            }
          }

          previousCoordsRef.current = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!location) return;

    let cancelled = false;

    const fetchAddress = async () => {
      try {
        setIsAddressLoading(true);

        const result = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        if (cancelled) return;

        if (result && result.length > 0) {
          const place = result[0];
          const areaParts = [
            place.name,
            place.street,
            place.city,
            place.region,
          ].filter(Boolean);

          setCurrentPlace(areaParts.slice(0, 3).join(', ') || 'Location found');
        } else {
          setCurrentPlace('Area not available');
        }
      } catch (error) {
        if (!cancelled) {
          setCurrentPlace('Unable to fetch address');
        }
      } finally {
        if (!cancelled) {
          setIsAddressLoading(false);
        }
      }
    };

    fetchAddress();

    return () => {
      cancelled = true;
    };
  }, [location]);

  const handleSOS = () => {
    Alert.alert(
      'EMERGENCY SOS',
      'Are you sure you want to send an emergency alert to your contacts?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'SEND ALERT', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const risk = getRiskFromSpeed(speed);

  const mapRegion = {
    latitude: location ? location.latitude : FALLBACK_REGION.latitude,
    longitude: location ? location.longitude : FALLBACK_REGION.longitude,
    latitudeDelta: FALLBACK_REGION.latitudeDelta,
    longitudeDelta: FALLBACK_REGION.longitudeDelta,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mapContainer}>
          <MapView
            style={{ flex: 1 }}
            showsUserLocation={true}
            region={mapRegion}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="You are here"
              />
            )}
          </MapView>

          <View style={styles.journeyBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.journeyBadgeText}>Journey Active</Text>
          </View>

          <View style={styles.speedContainer}>
            <Text style={styles.speedValue}>{speed}</Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          handleIndicatorStyle={styles.dragHandle}
          backgroundStyle={styles.sheetBackground}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.userRow}>
              <View style={styles.avatarContainer}>
                <CarIcon />
              </View>

              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>Ramesh Kumar</Text>
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>

                <Text style={styles.vehicleNumber}>
                  {location
                    ? `Lat ${location.latitude.toFixed(4)} • Lng ${location.longitude.toFixed(4)}`
                    : 'Waiting for GPS...'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>CURRENT AREA</Text>
                {isAddressLoading ? (
                  <View style={styles.inlineLoaderRow}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.infoLoadingText}>Fetching...</Text>
                  </View>
                ) : (
                  <Text style={styles.infoValue}>{currentPlace}</Text>
                )}
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>STARTED</Text>
                <Text style={styles.infoValue}>
                  {formatTime(trackingStartedAt)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>TRIP DURATION</Text>
                <Text style={styles.infoValue}>
                  {formatElapsed(trackingStartedAt)}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>DISTANCE</Text>
                <Text style={styles.infoValue}>{toKm(tripDistance)} km</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>LAST UPDATED</Text>
                <Text style={styles.infoValue}>{formatTime(lastUpdatedAt)}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>GPS ACCURACY</Text>
                <Text style={styles.infoValue}>
                  {location?.accuracy
                    ? `${Math.round(location.accuracy)} m`
                    : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.riskContainer}>
              <View style={styles.riskHeader}>
                <Text style={styles.riskLabel}>Risk Level</Text>
                <View
                  style={[
                    styles.riskBadge,
                    {
                      backgroundColor: risk.bg,
                    },
                  ]}
                >
                  <Text style={[styles.riskBadgeText, { color: risk.color }]}>
                    {risk.label}
                  </Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${risk.percent}%`,
                      backgroundColor: risk.color,
                    },
                  ]}
                />
              </View>

              <Text style={styles.riskSubText}>
                Calculated live from current speed.
              </Text>
            </View>

            <View style={styles.statusRow}>
              <View style={[styles.statusItem, styles.statusGreen]}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.statusTextGreen}>
                  GPS tracking active
                </Text>
              </View>

              <View style={[styles.statusItem, styles.statusRed]}>
                <View style={styles.recDot} />
                <Text style={styles.statusTextRed}>
                  {isRecording ? 'Recording live' : 'Recording off'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.sosButton}
              onPress={handleSOS}
              activeOpacity={0.85}
            >
              <Text style={styles.sosText}>⚠ EMERGENCY SOS</Text>
            </TouchableOpacity>
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },

  journeyBadge: {
    position: 'absolute',
    top: 20,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  greenDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },

  journeyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },

  speedContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  speedValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 26,
  },

  speedUnit: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },

  dragHandle: {
    backgroundColor: '#CBD5E1',
    width: 42,
    height: 5,
  },

  sheetContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  carIconContainer: {
    width: 28,
    height: 20,
    position: 'relative',
  },

  carBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },

  carRoof: {
    position: 'absolute',
    top: 0,
    left: 5,
    right: 5,
    height: 11,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },

  carWheelLeft: {
    position: 'absolute',
    bottom: -3,
    left: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E40AF',
  },

  carWheelRight: {
    position: 'absolute',
    bottom: -3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E40AF',
  },

  userInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },

  liveBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.8,
  },

  vehicleNumber: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  infoCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 5,
  },

  infoLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },

  inlineLoaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoLoadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  riskContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  riskLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.4,
  },

  riskBadge: {
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },

  riskBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  progressTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  riskSubText: {
    marginTop: 8,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  statusRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 9,
    marginHorizontal: 5,
  },

  statusGreen: {
    backgroundColor: '#F0FDF4',
  },

  statusRed: {
    backgroundColor: '#FFF1F2',
  },

  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  checkMark: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },

  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 7,
  },

  statusTextGreen: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },

  statusTextRed: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991B1B',
  },

  sosButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  sosText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});