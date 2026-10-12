package com.exammanagement.service.impl;

import com.exammanagement.dto.request.ExamCreateRequest;
import com.exammanagement.dto.request.ExamUpdateRequest;
import com.exammanagement.exception.BadRequestException;
import com.exammanagement.exception.ResourceNotFoundException;
import com.exammanagement.model.*;
import com.exammanagement.repository.ExamRepository;
import com.exammanagement.repository.QuestionRepository;
import com.exammanagement.repository.SubjectRepository;
import com.exammanagement.service.ExamService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;

    public ExamServiceImpl(ExamRepository examRepository,
                           SubjectRepository subjectRepository,
                           QuestionRepository questionRepository) {
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public Page<Exam> getAllExams(Pageable pageable) {
        return examRepository.findAll(pageable);
    }

    @Override
    public Page<Exam> getPublishedExams(Pageable pageable) {
        return examRepository.findByStatus(ExamStatus.PUBLISHED, pageable);
    }

    @Override
    public Page<Exam> getExamsForExaminer(String examinerId, Pageable pageable) {
        return examRepository.findByAssignedExaminerIdsContaining(examinerId, pageable);
    }

    @Override
    public Page<Exam> getExamsForStudent(String studentId, Pageable pageable) {
        return examRepository.findByStatus(ExamStatus.PUBLISHED, pageable);
    }

    @Override
    public Exam getExamById(String id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", id));
    }

    @Override
    public Exam createExam(ExamCreateRequest request, String creatorId, String creatorName) {
        if (examRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Exam code already exists: " + request.getCode());
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setCode(request.getCode());
        exam.setDescription(request.getDescription());
        exam.setInstructions(request.getInstructions());
        exam.setSubjectId(subject.getId());
        exam.setSubjectName(subject.getName());
        exam.setDepartment(request.getDepartment() != null ? request.getDepartment() : subject.getDepartmentName());
        exam.setCreatedBy(creatorId);
        exam.setCreatedByName(creatorName);
        exam.setAssignedExaminerIds(request.getAssignedExaminerIds());
        exam.setEnrolledStudentIds(request.getEnrolledStudentIds());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setPassingMarks(request.getPassingMarks());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setStatus(request.getStatus() != null ? request.getStatus() : ExamStatus.DRAFT);
        exam.setQuestionIds(request.getQuestionIds());
        exam.setShuffleQuestions(request.isShuffleQuestions());
        exam.setShuffleOptions(request.isShuffleOptions());
        exam.setShowResultsImmediately(request.isShowResultsImmediately());
        exam.setAllowReview(request.isAllowReview());
        exam.setMaxAttempts(request.getMaxAttempts());

        syncQuestionsSnapshot(exam, request.getQuestionIds());

        return examRepository.save(exam);
    }

    @Override
    public Exam updateExam(String id, ExamUpdateRequest request) {
        Exam exam = getExamById(id);

        if (request.getTitle() != null) exam.setTitle(request.getTitle());
        if (request.getDescription() != null) exam.setDescription(request.getDescription());
        if (request.getInstructions() != null) exam.setInstructions(request.getInstructions());
        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
            exam.setSubjectId(subject.getId());
            exam.setSubjectName(subject.getName());
        }
        if (request.getDepartment() != null) exam.setDepartment(request.getDepartment());
        if (request.getAssignedExaminerIds() != null) exam.setAssignedExaminerIds(request.getAssignedExaminerIds());
        if (request.getEnrolledStudentIds() != null) exam.setEnrolledStudentIds(request.getEnrolledStudentIds());
        if (request.getDurationMinutes() != null) exam.setDurationMinutes(request.getDurationMinutes());
        if (request.getPassingMarks() != null) exam.setPassingMarks(request.getPassingMarks());
        if (request.getStartTime() != null) exam.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) exam.setEndTime(request.getEndTime());
        if (request.getStatus() != null) exam.setStatus(request.getStatus());
        if (request.getShuffleQuestions() != null) exam.setShuffleQuestions(request.getShuffleQuestions());
        if (request.getShuffleOptions() != null) exam.setShuffleOptions(request.getShuffleOptions());
        if (request.getShowResultsImmediately() != null) exam.setShowResultsImmediately(request.getShowResultsImmediately());
        if (request.getAllowReview() != null) exam.setAllowReview(request.getAllowReview());
        if (request.getMaxAttempts() != null) exam.setMaxAttempts(request.getMaxAttempts());

        if (request.getQuestionIds() != null) {
            exam.setQuestionIds(request.getQuestionIds());
            syncQuestionsSnapshot(exam, request.getQuestionIds());
        }

        return examRepository.save(exam);
    }

    @Override
    public void deleteExam(String id) {
        if (!examRepository.existsById(id)) {
            throw new ResourceNotFoundException("Exam", "id", id);
        }
        examRepository.deleteById(id);
    }

    @Override
    public Exam publishExam(String id) {
        Exam exam = getExamById(id);
        if (exam.getQuestionsSnapshot().isEmpty()) {
            throw new BadRequestException("Cannot publish an exam with no questions. Please add questions first.");
        }
        exam.setStatus(ExamStatus.PUBLISHED);
        return examRepository.save(exam);
    }

    @Override
    public Exam cancelExam(String id) {
        Exam exam = getExamById(id);
        exam.setStatus(ExamStatus.CANCELLED);
        return examRepository.save(exam);
    }

    @Override
    public Exam assignExaminers(String id, List<String> examinerIds) {
        Exam exam = getExamById(id);
        exam.setAssignedExaminerIds(examinerIds != null ? examinerIds : new ArrayList<>());
        return examRepository.save(exam);
    }

    @Override
    public Exam enrollStudents(String id, List<String> studentIds) {
        Exam exam = getExamById(id);
        exam.setEnrolledStudentIds(studentIds != null ? studentIds : new ArrayList<>());
        return examRepository.save(exam);
    }

    @Override
    public Exam addQuestionsToExam(String id, List<String> questionIds) {
        Exam exam = getExamById(id);
        exam.setQuestionIds(questionIds);
        syncQuestionsSnapshot(exam, questionIds);
        return examRepository.save(exam);
    }

    private void syncQuestionsSnapshot(Exam exam, List<String> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            exam.setQuestionsSnapshot(new ArrayList<>());
            return;
        }

        List<Question> questions = questionRepository.findByIdIn(questionIds);
        List<QuestionSnapshot> snapshots = questions.stream()
                .map(QuestionSnapshot::new)
                .collect(Collectors.toList());

        exam.setQuestionsSnapshot(snapshots);

        double totalMarks = snapshots.stream()
                .mapToDouble(QuestionSnapshot::getMarks)
                .sum();
        exam.setTotalMarks(totalMarks > 0 ? totalMarks : 100.0);
    }
}
