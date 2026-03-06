package com.swp391.backend.repository;

import com.swp391.backend.entity.RequirementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RequirementStatusRepository extends JpaRepository<RequirementStatus, Integer> {

    Optional<RequirementStatus> findByCode(String code);
}
