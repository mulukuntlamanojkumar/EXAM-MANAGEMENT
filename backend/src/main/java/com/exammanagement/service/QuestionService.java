package com.exammanagement.service;

import com.exammanagement.dto.request.QuestionRequest;
import com.exammanagement.model.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuestionService {
    Page<Question> getAllQuestions(Pageable pageable);
    Page<Question> getQuestionsBySubject(String subjectId, Pageable pageable);
    List<Question> getQuestionsBySubject(String subjectId);
    Page<Question> getQuestionsByCreator(String creatorId, Pageable pageable);
    Question getQuestionById(String id);
    Question createQuestion(QuestionRequest request, String creatorId, String creatorName);
    Question updateQuestion(String id, QuestionRequest request);
    void deleteQuestion(String id);
    List<Question> getQuestionsByIds(List<String> ids);
}
