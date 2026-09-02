import { supabase } from "../../config/supabase";

/** @param {string} name @param {Record<string, unknown>} parameters @param {string} message */
const call = async (name, parameters, message) => {
  const { data, error } = await supabase.rpc(name, parameters);
  if (error || data?.error_code) {
    const gatewayError = Object.assign(new Error(message), {
      code: data?.error_code || error?.code || "service_error",
    });
    throw gatewayError;
  }
  return data;
};

/**
 * @typedef {object} LearnerIdentity
 * @property {string} ldap
 * @property {string} email
 * @property {string} market
 * @property {string} supervisor
 */

/**
 * @typedef {object} Submission
 * @property {string} accessCode
 * @property {Record<string, unknown>} answers
 * @property {string} idempotencyKey
 * @property {number | null | undefined} timeTaken
 * @property {Record<string, unknown> | null | undefined} questionTimings
 */

export const assessmentGateway = {
  /** @param {{ quizId?: string | null, accessCode?: string | null }} input */
  loadQuiz({ quizId = null, accessCode = null }) {
    return call(
      "load_quiz_for_learner",
      {
        p_quiz_id: quizId,
        p_access_code: accessCode,
      },
      accessCode
        ? "Access code is invalid or unavailable"
        : "Quiz is unavailable",
    );
  },

  /** @param {string} quizId @param {LearnerIdentity} learner @param {number} expiresInMinutes */
  createAccessCode(quizId, learner, expiresInMinutes = 30) {
    return call(
      "create_quiz_access_code",
      {
        p_quiz_id: quizId,
        p_ldap: learner.ldap,
        p_email: learner.email,
        p_market: learner.market,
        p_supervisor: learner.supervisor,
        p_expires_in_minutes: expiresInMinutes,
      },
      "Failed to generate access code",
    );
  },

  /** @param {string} quizId */
  async listAccessCodes(quizId) {
    return (
      (await call(
        "list_quiz_access_codes",
        {
          p_quiz_id: quizId,
        },
        "Failed to fetch access codes",
      )) || []
    );
  },

  /** @param {string} accessCodeId */
  async revokeAccessCode(accessCodeId) {
    await call(
      "revoke_quiz_access_code",
      {
        p_access_code_id: accessCodeId,
      },
      "Failed to revoke access code",
    );
  },

  /** @param {Submission} submission */
  submitOfficialAttempt({
    accessCode,
    answers,
    idempotencyKey,
    timeTaken,
    questionTimings,
  }) {
    return call(
      "submit_quiz_attempt",
      {
        p_access_code: accessCode,
        p_answers: answers,
        p_idempotency_key: idempotencyKey,
        p_time_taken: Math.max(0, Math.round(timeTaken || 0)),
        p_question_timings: questionTimings || {},
      },
      "Your quiz could not be submitted. Retry to safely check whether it was already saved.",
    );
  },

  /** @param {{ quizId: string, answers: Record<string, unknown> }} input */
  gradePracticeAttempt({ quizId, answers }) {
    return call(
      "grade_practice_attempt",
      {
        p_quiz_id: quizId,
        p_answers: answers,
      },
      "Practice quiz could not be graded",
    );
  },
};
