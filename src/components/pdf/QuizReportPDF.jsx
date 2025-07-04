import {
  Document,
  Page,
  View,
  StyleSheet
} from '@react-pdf/renderer';
import QuizHeader from './QuizHeader';
import QuizScoreSection from './QuizScoreSection';
import QuizQuestionSection from './QuizQuestionSection';
import QuizFooter from './QuizFooter';

// Note: Using built-in fonts to avoid CSP issues with external font loading

// Enterprise-level professional PDF styling
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40, // Reduced margins for more space
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.4,
    color: '#2d3748',
    minHeight: '100vh',
  },
  document: {
    title: 'Quiz Results Report',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

  // Compact page layout
  pageHeader: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pageFooter: {
    marginTop: 'auto',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexShrink: 0,
  },
});

const QuizReportPDF = ({
  quiz,
  selectedAnswers,
  score,
  timeTaken,
  ldap,
  isPractice = false,
  accessCodeData = null,
  companyLogo = null
}) => {
  // Ensure all required data is present and valid
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
    console.error('Invalid quiz data provided to QuizReportPDF');
    return null;
  }

  // Ensure score object has all required properties
  const safeScore = {
    correct: score?.correct ?? 0,
    total: score?.total ?? 0,
    percentage: score?.percentage ?? 0
  };

  // Ensure selectedAnswers is an object
  const safeSelectedAnswers = selectedAnswers || {};

  // Ensure ldap is a string
  const safeLdap = ldap || 'Unknown';

  // Ensure timeTaken is a number
  const safeTimeTaken = typeof timeTaken === 'number' ? timeTaken : 0;

  // Determine pass/fail status
  const passingScore = quiz.passing_score || 70;
  const passed = safeScore.percentage >= passingScore;

  // Split questions into groups of 5 for efficient page usage
  const questionsPerPage = 5;
  const questionPages = [];
  for (let i = 0; i < quiz.questions.length; i += questionsPerPage) {
    questionPages.push(quiz.questions.slice(i, i + questionsPerPage));
  }

  const totalPages = 1 + questionPages.length;

  return (
    <Document style={styles.document} title={`Quiz Results - ${quiz.title}`}>
      {/* Executive Summary Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <QuizHeader
            quiz={quiz}
            ldap={safeLdap}
            timeTaken={safeTimeTaken}
            companyLogo={companyLogo}
          />
        </View>

        <View style={styles.content}>
          <QuizScoreSection
            score={safeScore}
            passed={passed}
            passingScore={passingScore}
            isPractice={isPractice}
          />
        </View>

        <View style={styles.pageFooter}>
          <QuizFooter pageNumber={1} totalPages={totalPages} />
        </View>
      </Page>

      {/* Question Analysis Pages - 5 questions per page */}
      {questionPages.map((questionsGroup, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View style={styles.content}>
            <QuizQuestionSection
              questions={questionsGroup}
              selectedAnswers={safeSelectedAnswers}
              startIndex={pageIndex * questionsPerPage}
              isPractice={isPractice}
              showSectionTitle={false}
              totalQuestions={quiz.questions.length}
            />
          </View>

          <View style={styles.pageFooter}>
            <QuizFooter pageNumber={pageIndex + 2} totalPages={totalPages} />
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default QuizReportPDF;
