package com.exammanagement.service;

import com.exammanagement.dto.request.ManualGradeRequest;
import com.exammanagement.dto.request.ProctorEventRequest;
import com.exammanagement.dto.request.SaveAnswerRequest;
import com.exammanagement.dto.request.SubmitExamRequest;
import com.exammanagement.dto.response.ExamResultResponse;
import com.exammanagement.dto.response.ExamTakeResponse;
import com.exammanagement.model.ExamSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExamSubmissionService {
    ExamTakeResponse startExam(String examId, String studentId, String studentName, String studentEmail);
    void saveAnswer(String submissionId, String studentId, SaveAnswerRequest request);
    void logProctorEvent(String submissionId, String studentId, ProctorEventRequest request);
    ExamResultResponse submitExam(String submissionId, String studentId, SubmitExamRequest request);
    ExamResultResponse getSubmissionResult(String submissionId, String userId, boolean isAdminOrExaminer);
    Page<ExamSubmission> getSubmissionsForExam(String examId, Pageable pageable);
    Page<ExamSubmission> getSubmissionsForStudent(String studentId, Pageable pageable);
    Page<ExamSubmission> getAllSubmissions(Pageable pageable);
    ExamSubmission getSubmissionById(String submissionId);
    ExamSubmission manualGradeQuestion(String submissionId, String examinerId, ManualGradeRequest request);
}
