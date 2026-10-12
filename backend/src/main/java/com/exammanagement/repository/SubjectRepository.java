package com.exammanagement.repository;

import com.exammanagement.model.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends MongoRepository<Subject, String> {
    Optional<Subject> findByCode(String code);
    Boolean existsByCode(String code);
    List<Subject> findByDepartmentId(String departmentId);
}
