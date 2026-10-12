package com.exammanagement.service.impl;

import com.exammanagement.dto.request.QuestionRequest;
import com.exammanagement.exception.ResourceNotFoundException;
import com.exammanagement.model.Question;
import com.exammanagement.model.Subject;
import com.exammanagement.repository.QuestionRepository;
import com.exammanagement.repository.SubjectRepository;
import com.exammanagement.service.QuestionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;

    public QuestionServiceImpl(QuestionRepository questionRepository, SubjectRepository subjectRepository) {
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    public Page<Question> getAllQuestions(Pageable pageable) {
        return questionRepository.findAll(pageable);
    }

    @Override
    public Page<Question> getQuestionsBySubject(String subjectId, Pageable pageable) {
        return questionRepository.findBySubjectId(subjectId, pageable);
    }

    @Override
    public List<Question> getQuestionsBySubject(String subjectId) {
        return questionRepository.findBySubjectId(subjectId);
    }

    @Override
    public Page<Question> getQuestionsByCreator(String creatorId, Pageable pageable) {
        return questionRepository.findByCreatorId(creatorId, pageable);
    }

    @Override
    public Question getQuestionById(String id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
    }

    @Override
    public Question createQuestion(QuestionRequest request, String creatorId, String creatorName) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        Question question = new Question();
        question.setSubjectId(subject.getId());
        question.setSubjectName(subject.getName());
        question.setCreatorId(creatorId);
        question.setCreatorName(creatorName);
        question.setType(request.getType());
        question.setTitle(request.getTitle());
        question.setOptions(request.getOptions());
        question.setCorrectAnswers(request.getCorrectAnswers());
        question.setExplanation(request.getExplanation());
        question.setMarks(request.getMarks() > 0 ? request.getMarks() : 1.0);
        question.setNegativeMarks(request.getNegativeMarks());
        question.setDifficulty(request.getDifficulty());
        question.setTags(request.getTags());

        return questionRepository.save(question);
    }

    @Override
    public Question updateQuestion(String id, QuestionRequest request) {
        Question question = getQuestionById(id);

        if (!question.getSubjectId().equals(request.getSubjectId())) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
            question.setSubjectId(subject.getId());
            question.setSubjectName(subject.getName());
        }

        question.setType(request.getType());
        question.setTitle(request.getTitle());
        question.setOptions(request.getOptions());
        question.setCorrectAnswers(request.getCorrectAnswers());
        question.setExplanation(request.getExplanation());
        question.setMarks(request.getMarks() > 0 ? request.getMarks() : 1.0);
        question.setNegativeMarks(request.getNegativeMarks());
        question.setDifficulty(request.getDifficulty());
        question.setTags(request.getTags());

        return questionRepository.save(question);
    }

    @Override
    public void deleteQuestion(String id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question", "id", id);
        }
        questionRepository.deleteById(id);
    }

    @Override
    public List<Question> getQuestionsByIds(List<String> ids) {
        return questionRepository.findByIdIn(ids);
    }
}
