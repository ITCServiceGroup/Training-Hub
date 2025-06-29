import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';

// Enterprise-level professional header styling
const styles = StyleSheet.create({
  // Main header container
  headerContainer: {
    marginBottom: 0,
  },

  // Compact letterhead section
  letterhead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e0',
  },

  // Company branding
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1a202c',
    marginBottom: 1,
  },
  companyTagline: {
    fontSize: 9,
    color: '#718096',
    fontStyle: 'italic',
  },

  // Document metadata
  documentMeta: {
    alignItems: 'flex-end',
  },
  documentType: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
    marginBottom: 2,
  },
  generatedDate: {
    fontSize: 9,
    color: '#718096',
    marginBottom: 1,
  },

  // Compact title section with better spacing
  titleSection: {
    textAlign: 'center',
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1a202c',
    marginBottom: 12,
    textAlign: 'center',
  },
  assessmentTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#4299e1',
    marginBottom: 2,
    textAlign: 'center',
  },
  assessmentDescription: {
    fontSize: 10,
    color: '#718096',
    lineHeight: 1.4,
    textAlign: 'center',
    maxWidth: 400,
    marginHorizontal: 'auto',
  },

  // Ultra compact info grid
  infoGrid: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 12,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoItem: {
    flex: 1,
    paddingHorizontal: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
  },

  // Divider
  divider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 15,
  },
});

const QuizHeader = ({ quiz, ldap, timeTaken, companyLogo }) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const formatTimeTaken = (seconds) => {
    // Handle case where timeTaken is 0 or invalid
    if (!seconds || seconds <= 0) {
      return 'Not recorded';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <View style={styles.headerContainer}>
      {/* Corporate Letterhead */}
      <View style={styles.letterhead}>
        <View style={styles.brandSection}>
          {companyLogo && (
            <Image style={styles.logo} src={companyLogo} />
          )}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Training Hub</Text>
            <Text style={styles.companyTagline}>Professional Development & Assessment</Text>
          </View>
        </View>

        <View style={styles.documentMeta}>
          <Text style={styles.documentType}>Assessment Report</Text>
          <Text style={styles.generatedDate}>Generated: {formattedDate}</Text>
          <Text style={styles.generatedDate}>Time: {formattedTime}</Text>
        </View>
      </View>

      {/* Report Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.reportTitle}>Quiz Results Report</Text>
        <Text style={styles.assessmentTitle}>{quiz.title}</Text>
      </View>

      {/* Professional Information Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>LDAP</Text>
            <Text style={styles.infoValue}>{ldap}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Assessment Duration</Text>
            <Text style={styles.infoValue}>{formatTimeTaken(timeTaken)}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, styles.infoRowLast]}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Questions</Text>
            <Text style={styles.infoValue}>{quiz.questions?.length || 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Time Limit</Text>
            <Text style={styles.infoValue}>
              {quiz.time_limit ? `${Math.floor(quiz.time_limit / 60)} minutes` : 'No limit'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default QuizHeader;
