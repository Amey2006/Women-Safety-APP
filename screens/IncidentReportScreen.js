import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function IncidentReportScreen({ navigation }) {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.name || 'Priya Sharma';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fbf9ff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.reportCard}>
          {/* Title Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircleRed}>
              <Ionicons name="clipboard" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.reportTitle}>ABHAYA INCIDENT REPORT</Text>
              <Text style={styles.reportDate}>Date: 18 Apr 2026 | 11:42 PM</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* User Info */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="person" size={16} color="#4da6ff" />
              <Text style={styles.sectionTitle}>User Information</Text>
            </View>
            <Text style={styles.dataPrimary}>{displayName}</Text>
            <Text style={styles.dataSecondary}>Mobile: 98XXXXXX90</Text>
          </View>

          <View style={styles.dividerLight} />

          {/* Vehicle Info */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="car" size={16} color="#ed5565" />
              <Text style={styles.sectionTitle}>Vehicle Details</Text>
            </View>
            <Text style={styles.dataPrimary}>MH12 AB 1234</Text>
            <Text style={styles.dataSecondary}>Driver: Ramesh Kumar</Text>
            <Text style={styles.dataSecondary}>License: Valid ✅</Text>
          </View>

          <View style={styles.dividerLight} />

          {/* Location */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="location" size={16} color="#ed5565" />
              <Text style={styles.sectionTitle}>Last Known Location</Text>
            </View>
            <Text style={styles.dataPrimary}>Lat: 21.14 | Long: 79.08</Text>
            <TouchableOpacity style={styles.mapLink}>
              <Ionicons name="map" size={14} color="#7b57d1" />
              <Text style={styles.mapLinkText}>View on Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerLight} />

          {/* Evidence */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="folder" size={16} color="#f8d664" />
              <Text style={styles.sectionTitle}>Evidence Files</Text>
            </View>
            
            <View style={styles.evidenceFile}>
              <View style={styles.evidenceIconWrap}>
                <Ionicons name="play" size={14} color="#7b57d1" />
              </View>
              <Text style={styles.evidenceName}>Audio Evidence</Text>
              <Text style={styles.evidenceMeta}>2:34</Text>
            </View>

            <View style={styles.evidenceFile}>
              <View style={styles.evidenceIconWrap}>
                <Ionicons name="eye" size={14} color="#7b57d1" />
              </View>
              <Text style={styles.evidenceName}>Video Evidence</Text>
              <Text style={styles.evidenceMeta}>1:45</Text>
            </View>

            <View style={styles.evidenceFile}>
              <View style={styles.evidenceIconWrap}>
                <Ionicons name="map-outline" size={14} color="#7b57d1" />
              </View>
              <Text style={styles.evidenceName}>Route Timeline</Text>
              <Text style={styles.evidenceMeta}>View</Text>
            </View>
          </View>

          {/* Risk Score */}
          <View style={styles.riskBadge}>
            <Text style={styles.riskBadgeText}>Risk Score</Text>
            <View style={styles.riskBadgeValueWrap}>
              <Text style={styles.riskBadgeValue}>HIGH</Text>
              <View style={styles.riskDot} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={[styles.actionBtn, styles.btnRed]}>
          <Ionicons name="share-social" size={18} color="#fff" />
          <Text style={styles.btnText}>Share with Police</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.btnGreen]}>
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.btnText}>Saved to Cloud ✅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.btnPurple]}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Download Report</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fbf9ff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  
  reportCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#14092c', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4, marginBottom: 24, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircleRed: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ea4335', justifyContent: 'center', alignItems: 'center' },
  reportTitle: { fontSize: 15, fontWeight: '800', color: '#111' },
  reportDate: { fontSize: 12, color: '#8f8f96', marginTop: 2 },
  
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  dividerLight: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 16 },
  
  section: {},
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 13, color: '#8f8f96', fontWeight: '500' },
  dataPrimary: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 4 },
  dataSecondary: { fontSize: 13, color: '#666', marginBottom: 2 },
  
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  mapLinkText: { fontSize: 13, color: '#7b57d1', fontWeight: '700' },
  
  evidenceFile: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7f4fb', padding: 14, borderRadius: 16, marginBottom: 10 },
  evidenceIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#eaddff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  evidenceName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111' },
  evidenceMeta: { fontSize: 12, color: '#8f8f96' },
  
  riskBadge: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffeaea', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginTop: 10 },
  riskBadgeText: { fontSize: 13, color: '#666' },
  riskBadgeValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  riskBadgeValue: { fontSize: 14, fontWeight: '800', color: '#ea4335' },
  riskDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ea4335' },
  
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderRadius: 16, marginBottom: 12 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnRed: { backgroundColor: '#ea5455' },
  btnGreen: { backgroundColor: '#4caf50' },
  btnPurple: { backgroundColor: '#7b57d1' },
});
