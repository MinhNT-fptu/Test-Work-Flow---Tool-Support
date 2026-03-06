package com.swp391.backend.repository;

import com.swp391.backend.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaskStatusRepository extends JpaRepository<TaskStatus, Integer> {

    Optional<TaskStatus> findByCode(String code);
}
