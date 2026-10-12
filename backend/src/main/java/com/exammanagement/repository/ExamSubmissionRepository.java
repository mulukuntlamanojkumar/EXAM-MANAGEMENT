package com.exammanagement.repository;

import com.exammanagement.model.ExamSubmission;
import com.exammanagement.model.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubmissionRepository extends MongoRepository<ExamSubmission, String> {
    List<ExamSubmission> findByExamId(String examId);
    Page<ExamSubmission> findByExamId(String examId, Pageable pageable);
    List<ExamSubmission> findByStudentId(String studentId);
    Page<ExamSubmission> findByStudentId(String studentId, Pageable pageable);
    List<ExamSubmission> findByExamIdAndStudentId(String examId, String studentId);
    Optional<ExamSubmission> findFirstByExamIdAndStudentIdAndStatus(String examId, String studentId, SubmissionStatus status);
    Page<ExamSubmission> findByStatus(SubmissionStatus status, Pageable pageable);
    long countByExamId(String examId);
    long countByExamIdAndPassed(String examId, boolean passed);
    long countByPassed(boolean passed);
}
