package com.swp391.backend.repository;

import com.swp391.backend.entity.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PriorityRepository extends JpaRepository<Priority, Integer> {

    Optional<Priority> findByCode(String code);
}
