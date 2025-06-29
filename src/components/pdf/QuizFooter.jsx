import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
  },
  pageNumber: {
    fontSize: 9,
    color: '#6b7280',
    fontFamily: 'Helvetica-Bold',
  },
  confidential: {
    fontSize: 8,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});

const QuizFooter = ({ pageNumber, totalPages }) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US');

  return (
    <View style={styles.footer}>
      <View>
        <Text style={styles.footerText}>Training Hub - Quiz Results Report</Text>
        <Text style={styles.confidential}>Confidential - For Training Purposes Only</Text>
      </View>
      
      <View>
        <Text style={styles.pageNumber}>
          Page {pageNumber}{totalPages ? ` of ${totalPages}` : ''}
        </Text>
        <Text style={styles.footerText}>Generated: {formattedDate}</Text>
      </View>
    </View>
  );
};

export default QuizFooter;
