import { supabase } from "../../config/supabase";

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const toIso = (value) => (value ? new Date(value).toISOString() : null);

const fetchRows = async (table, columns, orderBy = "created_at") => {
  const response = await supabase
    .from(table)
    .select(columns)
    .order(orderBy, { ascending: false })
    .range(0, 499);
  return unwrap(response) || [];
};

export const trainingAdminService = {
  async getWorkspace() {
    const [
      assignments,
      audiences,
      prerequisites,
      enrollments,
      certifications,
      profiles,
      markets,
      studyGuides,
      quizzes,
      learningPaths,
      learningPathItems,
      contentVersions,
      contentReviews,
    ] = await Promise.all([
      fetchRows("training_assignments", "*"),
      fetchRows("assignment_audiences", "*"),
      fetchRows("training_assignment_prerequisites", "*"),
      fetchRows("enrollments", "*", "assigned_at"),
      fetchRows("certifications", "*", "expires_at"),
      fetchRows(
        "user_profiles",
        "user_id, display_name, email, role, market_id, is_active",
        "display_name",
      ),
      fetchRows("markets", "id, name", "name"),
      fetchRows(
        "study_guides",
        "id, title, content, category_id, is_published",
        "title",
      ),
      fetchRows(
        "quizzes",
        "id, title, is_practice, archived_at, market_id",
        "title",
      ),
      fetchRows("learning_paths", "*"),
      fetchRows("learning_path_items", "*", "sequence_number"),
      fetchRows(
        "content_versions",
        "id, study_guide_id, version_number, title, status, owner_user_id, approved_by, approved_at, published_by, published_at, effective_at, review_due_at, created_at, updated_at",
      ),
      fetchRows(
        "content_reviews",
        "id, content_version_id, assigned_to, status, comments, decided_by, decided_at, created_at, updated_at",
      ),
    ]);

    const byAssignment = (rows) =>
      rows.reduce((map, row) => {
        (map[row.assignment_id] ||= []).push(row);
        return map;
      }, {});
    const audiencesByAssignment = byAssignment(audiences);
    const prerequisitesByAssignment = byAssignment(prerequisites);
    const enrollmentsByAssignment = byAssignment(enrollments);
    const profileById = Object.fromEntries(
      profiles.map((profile) => [profile.user_id, profile]),
    );

    return {
      assignments: assignments.map((assignment) => ({
        ...assignment,
        audiences: audiencesByAssignment[assignment.id] || [],
        prerequisites: prerequisitesByAssignment[assignment.id] || [],
        enrollments: enrollmentsByAssignment[assignment.id] || [],
      })),
      enrollments: enrollments.map((enrollment) => ({
        ...enrollment,
        learner: profileById[enrollment.user_id] || null,
        assignment:
          assignments.find(
            (assignment) => assignment.id === enrollment.assignment_id,
          ) || null,
      })),
      certifications: certifications.map((certification) => ({
        ...certification,
        learner: profileById[certification.user_id] || null,
      })),
      profiles,
      markets,
      studyGuides,
      quizzes: quizzes.filter((quiz) => !quiz.archived_at),
      learningPaths: learningPaths.map((path) => ({
        ...path,
        items: learningPathItems
          .filter((item) => item.learning_path_id === path.id)
          .sort((a, b) => a.sequence_number - b.sequence_number),
      })),
      contentVersions,
      contentReviews,
    };
  },

  async saveAssignment(values) {
    return unwrap(
      await supabase.rpc("save_training_assignment", {
        p_assignment_id: values.id || null,
        p_title: values.title.trim(),
        p_description: values.description.trim() || null,
        p_content_type: values.contentType,
        p_content_id: values.contentId,
        p_content_version_id: values.contentVersionId || null,
        p_is_required: values.isRequired,
        p_priority: values.priority,
        p_available_from:
          toIso(values.availableFrom) || new Date().toISOString(),
        p_due_at: toIso(values.dueAt),
        p_grace_period_days: Number(values.gracePeriodDays || 0),
        p_market_id: values.marketId ? Number(values.marketId) : null,
        p_certification_type: values.certificationType.trim() || null,
        p_certification_valid_months: values.certificationType
          ? Number(values.certificationValidMonths)
          : null,
        p_audiences: values.audiences,
      }),
    );
  },

  async setPrerequisites(assignmentId, prerequisiteIds) {
    return unwrap(
      await supabase.rpc("set_training_assignment_prerequisites", {
        p_assignment_id: assignmentId,
        p_prerequisite_assignment_ids: prerequisiteIds,
      }),
    );
  },

  async activateAssignment(assignmentId) {
    return unwrap(
      await supabase.rpc("activate_training_assignment", {
        p_assignment_id: assignmentId,
      }),
    );
  },

  async setAssignmentStatus(assignmentId, status) {
    return unwrap(
      await supabase.rpc("set_training_assignment_status", {
        p_assignment_id: assignmentId,
        p_status: status,
      }),
    );
  },

  async waiveEnrollment(enrollmentId, reason) {
    return unwrap(
      await supabase.rpc("waive_training_enrollment", {
        p_enrollment_id: enrollmentId,
        p_reason: reason,
      }),
    );
  },

  async setCertificationStatus(certificationId, status, reason = null) {
    return unwrap(
      await supabase.rpc("set_certification_status", {
        p_certification_id: certificationId,
        p_status: status,
        p_reason: reason,
      }),
    );
  },

  async refreshDeadlines() {
    return unwrap(await supabase.rpc("refresh_training_deadlines"));
  },

  async saveLearningPath(values) {
    return unwrap(
      await supabase.rpc("save_learning_path", {
        p_learning_path_id: values.id || null,
        p_title: values.title.trim(),
        p_description: values.description.trim() || null,
        p_market_id: values.marketId ? Number(values.marketId) : null,
        p_items: values.items.map((item, index) => ({
          content_type: item.contentType,
          content_id: item.contentId,
          sequence_number: index + 1,
          is_required: item.isRequired,
        })),
      }),
    );
  },

  async activateLearningPath(learningPathId) {
    return unwrap(
      await supabase.rpc("activate_learning_path", {
        p_learning_path_id: learningPathId,
      }),
    );
  },

  async createContentVersion(studyGuide, reviewDueAt = null) {
    let content;
    try {
      content =
        typeof studyGuide.content === "string"
          ? JSON.parse(studyGuide.content)
          : studyGuide.content;
    } catch {
      content = { type: "legacy_text", value: studyGuide.content };
    }
    return unwrap(
      await supabase.rpc("create_content_version", {
        p_study_guide_id: studyGuide.id,
        p_title: studyGuide.title,
        p_content: content,
        p_review_due_at: toIso(reviewDueAt),
      }),
    );
  },

  async submitContentVersion(versionId, assignedTo = null) {
    return unwrap(
      await supabase.rpc("submit_content_version_for_review", {
        p_content_version_id: versionId,
        p_assigned_to: assignedTo || null,
      }),
    );
  },

  async decideContentReview(reviewId, decision, comments = null) {
    return unwrap(
      await supabase.rpc("decide_content_review", {
        p_review_id: reviewId,
        p_decision: decision,
        p_comments: comments || null,
      }),
    );
  },

  async publishContentVersion(versionId) {
    return unwrap(
      await supabase.rpc("publish_content_version", {
        p_content_version_id: versionId,
        p_effective_at: new Date().toISOString(),
      }),
    );
  },

  async republishContentVersion(versionId, reason) {
    return unwrap(
      await supabase.rpc("republish_content_version", {
        p_content_version_id: versionId,
        p_reason: reason,
        p_effective_at: new Date().toISOString(),
      }),
    );
  },
};
