import { View, Text, StyleSheet } from '@react-pdf/renderer';

// Clean, professional score section styling
const styles = StyleSheet.create({
  // Ultra compact container spacing
  scoreContainer: {
    marginTop: 5,
    marginBottom: 10,
  },

  // Ultra compact section header
  sectionHeader: {
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
  },

  // Ultra compact results card
  resultsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 15,
  },

  // Ultra compact status row
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusLabel: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgePassed: {
    backgroundColor: '#38a169',
  },
  statusBadgeFailed: {
    backgroundColor: '#e53e3e',
  },
  statusBadgePractice: {
    backgroundColor: '#4299e1',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Ultra compact metrics grid with proper spacing
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 15,
    minHeight: 70, // Ensure consistent height
  },
  metricValue: {
    fontSize: 20, // Reduced from 36 to prevent overlap
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10, // Increased spacing between number and label
  },
  metricValuePassed: {
    color: '#38a169',
  },
  metricValueFailed: {
    color: '#e53e3e',
  },
  metricValueNeutral: {
    color: '#4299e1',
  },
  metricLabel: {
    fontSize: 11,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },

  // Ultra compact performance bar section
  performanceSection: {
    marginBottom: 15,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#4a5568',
  },
  performanceScore: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
  },
  performanceBar: {
    height: 16,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  performanceFill: {
    height: '100%',
    borderRadius: 7,
  },
  performanceFillPassed: {
    backgroundColor: '#38a169',
  },
  performanceFillFailed: {
    backgroundColor: '#e53e3e',
  },
  performanceFillPractice: {
    backgroundColor: '#4299e1',
  },

  // Ultra compact summary section
  summarySection: {
    backgroundColor: '#f7fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#4299e1',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 11,
    color: '#4a5568',
    lineHeight: 1.4,
  },
});

const QuizScoreSection = ({ score, passed, passingScore, isPractice }) => {
  const getSummaryText = () => {
    if (isPractice) {
      return `This was a practice quiz. Your performance shows ${score.correct} correct answers out of ${score.total} questions (${score.percentage.toFixed(1)}%). Use this feedback to identify areas for improvement.`;
    }
    
    if (passed) {
      return `Congratulations! You have successfully passed this quiz with a score of ${score.percentage.toFixed(1)}%, which exceeds the required passing score of ${passingScore}%.`;
    } else {
      return `You scored ${score.percentage.toFixed(1)}%, which is below the required passing score of ${passingScore}%. Please review the material and retake the quiz when ready.`;
    }
  };

  return (
    <View style={styles.scoreContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assessment Results</Text>
        <Text style={styles.sectionSubtitle}>
          {isPractice ? 'Practice Assessment Summary' : 'Performance Analysis'}
        </Text>
      </View>

      {/* Results Card */}
      <View style={styles.resultsCard}>
        {/* Status Row */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Assessment Status:</Text>
          {!isPractice ? (
            <View style={[
              styles.statusBadge,
              passed ? styles.statusBadgePassed : styles.statusBadgeFailed
            ]}>
              <Text style={styles.statusText}>
                {passed ? 'PASSED' : 'FAILED'}
              </Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.statusBadgePractice]}>
              <Text style={styles.statusText}>PRACTICE</Text>
            </View>
          )}
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={[
              styles.metricValue,
              isPractice ? styles.metricValueNeutral : (passed ? styles.metricValuePassed : styles.metricValueFailed)
            ]}>
              {score.correct}
            </Text>
            <Text style={styles.metricLabel}>Correct</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={[
              styles.metricValue,
              isPractice ? styles.metricValueNeutral : (passed ? styles.metricValuePassed : styles.metricValueFailed)
            ]}>
              {score.total}
            </Text>
            <Text style={styles.metricLabel}>Total</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={[
              styles.metricValue,
              isPractice ? styles.metricValueNeutral : (passed ? styles.metricValuePassed : styles.metricValueFailed)
            ]}>
              {score.percentage.toFixed(1)}%
            </Text>
            <Text style={styles.metricLabel}>Score</Text>
          </View>
        </View>

        {/* Performance Section */}
        <View style={styles.performanceSection}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceLabel}>Performance</Text>
            <Text style={styles.performanceScore}>
              {score.percentage.toFixed(1)}%{!isPractice && ` (Required: ${passingScore}%)`}
            </Text>
          </View>
          <View style={styles.performanceBar}>
            <View style={[
              styles.performanceFill,
              isPractice ? styles.performanceFillPractice : (passed ? styles.performanceFillPassed : styles.performanceFillFailed),
              { width: `${Math.min(score.percentage, 100)}%` }
            ]} />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            {getSummaryText()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default QuizScoreSection;
