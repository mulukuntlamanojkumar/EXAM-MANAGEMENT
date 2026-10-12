package com.exammanagement.repository;

import com.exammanagement.model.Question;
import com.exammanagement.model.QuestionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findBySubjectId(String subjectId);
    Page<Question> findBySubjectId(String subjectId, Pageable pageable);
    Page<Question> findByCreatorId(String creatorId, Pageable pageable);
    List<Question> findByType(QuestionType type);
    long countBySubjectId(String subjectId);
    List<Question> findByIdIn(List<String> ids);
}
