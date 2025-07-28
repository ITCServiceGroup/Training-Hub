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
// Removed complex dynamic pagination - using simple fixed approach instead

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
    minHeight: 0, // Prevent flex from forcing content overflow
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
    minHeight: 40, // Ensure minimum footer height
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

  // DYNAMIC APPROACH: Adjust questions per page based on explanations
  // Debug: Log question structure to identify potential issues
  console.log('🔍 PDF Debug - Quiz questions structure:', {
    totalQuestions: quiz.questions.length,
    sampleQuestion: quiz.questions[0],
    questionFields: quiz.questions[0] ? Object.keys(quiz.questions[0]) : [],
    explanationSample: quiz.questions.slice(0, 3).map(q => ({
      id: q.id,
      hasExplanation: !!q.explanation,
      explanationLength: q.explanation?.length || 0,
      explanationContent: q.explanation?.substring(0, 50) + '...'
    }))
  });

  // Check if any questions have explanations
  const hasExplanations = quiz.questions.some(question =>
    question.explanation && question.explanation.trim().length > 0
  );

  console.log('🔍 PDF Debug - Explanation detection:', {
    hasExplanations,
    questionsWithExplanations: quiz.questions.filter(q => q.explanation && q.explanation.trim().length > 0).length,
    questionsWithoutExplanations: quiz.questions.filter(q => !q.explanation || q.explanation.trim().length === 0).length
  });

  // Set questions per page based on explanation presence
  // 3 questions per page when explanations exist (current behavior)
  // 4 questions per page when no explanations (more efficient use of space)
  const questionsPerPage = hasExplanations ? 3 : 4;
  const questionPages = [];

  for (let i = 0; i < quiz.questions.length; i += questionsPerPage) {
    questionPages.push(quiz.questions.slice(i, i + questionsPerPage));
  }

  console.log('🔍 PDF Pagination (Dynamic):', {
    totalQuestions: quiz.questions.length,
    hasExplanations: hasExplanations,
    questionsPerPage: questionsPerPage,
    totalPages: questionPages.length,
    pageBreakdown: questionPages.map((page, index) => `Page ${index + 1}: ${page.length} questions`),
    logic: hasExplanations ? 'Found explanations → 3 per page' : 'No explanations → 4 per page'
  });

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

      {/* Question Analysis Pages - Dynamic questions per page (3 with explanations, 4 without) */}
      {questionPages.map((questionsGroup, pageIndex) => {
        // Simple calculation: pageIndex * questionsPerPage
        const startIndex = pageIndex * questionsPerPage;
        
        return (
          <Page key={pageIndex} size="A4" style={styles.page} wrap={false}>
            <View style={styles.content}>
              <QuizQuestionSection
                questions={questionsGroup}
                selectedAnswers={safeSelectedAnswers}
                startIndex={startIndex}
                isPractice={isPractice}
                showSectionTitle={false}
                totalQuestions={quiz.questions.length}
              />
            </View>

            <View style={styles.pageFooter}>
              <QuizFooter pageNumber={pageIndex + 2} totalPages={totalPages} />
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default QuizReportPDF;
