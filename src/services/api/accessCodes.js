import { assessmentGateway } from './assessmentGateway';

export const accessCodesService = {
  async generateCode(quizId, testTakerInfo) {
    return assessmentGateway.createAccessCode(quizId, testTakerInfo);
  },

  async getByQuizId(quizId) {
    return assessmentGateway.listAccessCodes(quizId);
  },

  async validateCode(code) {
    return assessmentGateway.loadQuiz({ accessCode: code.trim().toUpperCase() });
  },

  async delete(codeId) {
    return assessmentGateway.revokeAccessCode(codeId);
  }
};
