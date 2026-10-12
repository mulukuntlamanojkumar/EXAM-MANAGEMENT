package com.exammanagement.repository;

import com.exammanagement.model.Exam;
import com.exammanagement.model.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends MongoRepository<Exam, String> {
    Optional<Exam> findByCode(String code);
    Boolean existsByCode(String code);

    List<Exam> findByStatus(ExamStatus status);
    Page<Exam> findByStatus(ExamStatus status, Pageable pageable);
    Page<Exam> findByCreatedBy(String createdBy, Pageable pageable);
    Page<Exam> findByAssignedExaminerIdsContaining(String examinerId, Pageable pageable);
    List<Exam> findByAssignedExaminerIdsContaining(String examinerId);
    Page<Exam> findByEnrolledStudentIdsContaining(String studentId, Pageable pageable);
    List<Exam> findByEnrolledStudentIdsContaining(String studentId);
    List<Exam> findByStatusIn(List<ExamStatus> statuses);
    long countByStatus(ExamStatus status);
}
