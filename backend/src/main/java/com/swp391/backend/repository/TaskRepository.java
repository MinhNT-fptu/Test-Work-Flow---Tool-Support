package com.swp391.backend.repository;

import com.swp391.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {

    Optional<Task> findByJiraIssueKey(String jiraIssueKey);

    /** Preload batch để tránh N+1 khi upsert */
    List<Task> findAllByJiraIssueKeyIn(List<String> jiraIssueKeys);
}
