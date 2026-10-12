package com.exammanagement.service;

import com.exammanagement.dto.request.ExamCreateRequest;
import com.exammanagement.dto.request.ExamUpdateRequest;
import com.exammanagement.model.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ExamService {
    Page<Exam> getAllExams(Pageable pageable);
    Page<Exam> getPublishedExams(Pageable pageable);
    Page<Exam> getExamsForExaminer(String examinerId, Pageable pageable);
    Page<Exam> getExamsForStudent(String studentId, Pageable pageable);
    Exam getExamById(String id);
    Exam createExam(ExamCreateRequest request, String creatorId, String creatorName);
    Exam updateExam(String id, ExamUpdateRequest request);
    void deleteExam(String id);
    Exam publishExam(String id);
    Exam cancelExam(String id);
    Exam assignExaminers(String id, List<String> examinerIds);
    Exam enrollStudents(String id, List<String> studentIds);
    Exam addQuestionsToExam(String id, List<String> questionIds);
}
