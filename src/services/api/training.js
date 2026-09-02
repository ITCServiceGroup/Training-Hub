import { supabase } from "../../config/supabase";

class TrainingService {
  async getMyTraining() {
    const { data, error } = await supabase.rpc("list_my_training");
    if (error) throw error;
    return data || [];
  }

  async getMyCertifications() {
    const { data, error } = await supabase
      .from("certifications")
      .select(
        "id, certification_type, status, certificate_number, issued_at, expires_at",
      )
      .order("expires_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async getMyLearningPathProgress() {
    const { data, error } = await supabase.rpc(
      "list_my_learning_path_progress",
    );
    if (error) throw error;
    return data || [];
  }

  /** @param {string} enrollmentId */
  async beginEnrollment(enrollmentId) {
    const { data, error } = await supabase.rpc("begin_training_enrollment", {
      p_enrollment_id: enrollmentId,
    });
    if (error) throw error;
    return data;
  }

  /** @param {string} enrollmentId @param {number | string | null} evidenceResultId */
  async completeEnrollment(enrollmentId, evidenceResultId = null) {
    const { data, error } = await supabase.rpc("complete_training_enrollment", {
      p_enrollment_id: enrollmentId,
      p_evidence_result_id: evidenceResultId,
    });
    if (error) throw error;
    return data;
  }

  /** @param {string} enrollmentId */
  async issueAssignedQuizAccessCode(enrollmentId) {
    const { data, error } = await supabase.rpc(
      "issue_assigned_quiz_access_code",
      {
        p_enrollment_id: enrollmentId,
      },
    );
    if (error) throw error;
    return data;
  }

  /** @param {string} enrollmentId @param {number} sequenceNumber */
  async beginLearningPathItem(enrollmentId, sequenceNumber) {
    const { data, error } = await supabase.rpc("begin_learning_path_item", {
      p_enrollment_id: enrollmentId,
      p_sequence_number: sequenceNumber,
    });
    if (error) throw error;
    return data;
  }

  /** @param {string} enrollmentId @param {number} sequenceNumber */
  async completeLearningPathItem(enrollmentId, sequenceNumber) {
    const { data, error } = await supabase.rpc("complete_learning_path_item", {
      p_enrollment_id: enrollmentId,
      p_sequence_number: sequenceNumber,
      p_evidence_result_id: null,
    });
    if (error) throw error;
    return data;
  }

  /** @param {string} enrollmentId @param {number} sequenceNumber */
  async issueLearningPathQuizCode(enrollmentId, sequenceNumber) {
    const { data, error } = await supabase.rpc(
      "issue_learning_path_quiz_code",
      {
        p_enrollment_id: enrollmentId,
        p_sequence_number: sequenceNumber,
      },
    );
    if (error) throw error;
    return data;
  }
}

export const trainingService = new TrainingService();
