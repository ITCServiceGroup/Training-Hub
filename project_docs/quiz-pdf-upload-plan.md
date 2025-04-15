# Plan: Secure Quiz PDF Upload via Edge Function

## Problem

Direct client-side uploads of quiz result PDFs to the private `quiz-pdfs` Supabase Storage bucket are failing with a `403 Unauthorized` error. This is because the quiz taker uses an access code and is not logged in under the standard `authenticated` role, and therefore lacks the necessary storage permissions defined by Row Level Security (RLS) policies. Allowing anonymous uploads directly is insecure.

## Solution: Use a Supabase Edge Function

The recommended approach is to create a Supabase Edge Function to act as a secure intermediary for handling PDF uploads.

## Implementation Steps

1.  **Create Supabase Edge Function (`upload-quiz-pdf`)**
    *   **Setup:** Use the Supabase CLI to initialize and create a new Edge Function:
        ```bash
        # If functions directory doesn't exist
        supabase functions new upload-quiz-pdf
        ```
    *   **Function Logic (TypeScript/Deno):**
        *   The function will accept `POST` requests.
        *   It requires the following in the request body (JSON):
            *   `pdfData`: Base64 encoded string of the PDF blob.
            *   `accessCode`: The access code used by the quiz taker.
            *   `ldap`: The LDAP identifier associated with the access code.
            *   `quizId`: The ID of the quiz taken.
        *   **Import Supabase Admin Client:** Use environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) to initialize the Supabase client with admin privileges within the function. This bypasses RLS for internal operations.
        *   **Validate Access Code:**
            *   Query the `v2_access_codes` table using the admin client.
            *   Verify that the provided `accessCode` exists, `is_used` is `false`, `expires_at` is in the future (or null), and optionally matches the provided `ldap` and `quizId`.
            *   If validation fails, return a `403 Forbidden` response immediately.
        *   **Decode and Upload PDF:**
            *   If validation passes, decode the base64 `pdfData` back into a Blob or ArrayBuffer.
            *   Generate a unique filename (e.g., `${ldap}-${timestamp}.pdf`).
            *   Use the admin client's storage interface to upload the decoded PDF data to the `quiz-pdfs` bucket.
            *   Use `upsert: false` to avoid potential overwrites (though unlikely with timestamps).
        *   **Get Public URL:** Retrieve the public URL of the uploaded file using `supabase.storage.from('quiz-pdfs').getPublicUrl(filename)`.
        *   **Return Response:**
            *   On success, return a `200 OK` response with a JSON body containing `{ pdf_url: "..." }`.
            *   On failure (validation, upload, etc.), return an appropriate error status (e.g., `400 Bad Request`, `500 Internal Server Error`) with an error message.
    *   **Deployment:** Deploy the function using `supabase functions deploy upload-quiz-pdf --no-verify-jwt`. The `--no-verify-jwt` flag is often needed if the function needs to be called by unauthenticated users (like our quiz takers), but the function itself performs validation (access code check).

2.  **Modify Frontend (`v2/src/components/quiz/QuizTaker.jsx`)**
    *   **Remove Direct Upload Logic:** Delete the existing `generateAndUploadPdf` function and its direct calls to `supabase.storage.from(...).upload()` and `getPublicUrl()`.
    *   **Update `handleSubmitQuiz`:**
        *   After generating the PDF blob using `html2pdf.js`, convert the blob to a base64 string.
        *   Make a `fetch` `POST` request to the deployed Edge Function's endpoint (e.g., `/api/edge/upload-quiz-pdf` or the full Supabase function URL).
        *   Include `{ pdfData: base64String, accessCode: accessCodeData.code, ldap: accessCodeData.ldap, quizId: quiz.id }` in the JSON request body.
        *   Await the response from the Edge Function.
        *   Extract the `pdf_url` from the successful response. If the request fails or doesn't return a URL, set `pdf_url` to `null` and log an error/warning.
        *   Proceed to call `quizResultsService.create` with the complete data object, including:
            *   `quiz_id`
            *   `ldap`
            *   `supervisor`
            *   `market`
            *   `score_value` (percentage)
            *   `score_text` (formatted string)
            *   `answers`
            *   `time_taken`
            *   `date_of_test` (new Date().toISOString())
            *   `quiz_type` (quiz.title)
            *   `pdf_url` (from Edge Function response or null)

3.  **Supabase Storage Bucket (`quiz-pdfs`)**
    *   **Privacy:** Keep the bucket **private**.
    *   **RLS Policies (`storage.objects` table):**
        *   **No `INSERT` policy needed for `anon` or `authenticated` roles.** The Edge Function handles uploads with admin rights.
        *   **Add/Verify `SELECT` Policy:** Ensure appropriate `SELECT` policies exist to allow authorized users (e.g., `authenticated` role for admins/supervisors) to view/download the PDFs later. Example:
            ```sql
            CREATE POLICY "Allow authenticated select from quiz-pdfs"
            ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'quiz-pdfs');
            ```

## Benefits

*   **Security:** Prevents unauthorized anonymous uploads. Uploads are gated by valid access codes verified server-side.
*   **Privacy:** The storage bucket remains private.
*   **Simplified Client:** The frontend doesn't need complex storage permissions or direct upload logic.

## Next Steps

1.  Implement the Edge Function code.
2.  Deploy the Edge Function.
3.  Update the `QuizTaker.jsx` component to call the Edge Function.
4.  Verify Supabase Storage RLS policies for `SELECT` access.
5.  Test the end-to-end quiz submission flow.
