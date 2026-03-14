package com.swp391.backend.controller;

import com.swp391.backend.common.ApiResponse;
import com.swp391.backend.entity.Course;
import com.swp391.backend.exception.BusinessException;
import com.swp391.backend.repository.CourseRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    /** GET /api/courses */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'STUDENT')")
    public ApiResponse<List<Course>> getAllCourses() {
        return ApiResponse.success(courseRepository.findAll());
    }

    /** POST /api/courses — ADMIN only */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Course> createCourse(@Valid @RequestBody CourseRequest req) {
        if (courseRepository.findByCourseCode(req.getCourseCode()).isPresent()) {
            throw new BusinessException("Course code already exists: " + req.getCourseCode(), 409);
        }
        Course c = new Course();
        c.setCourseCode(req.getCourseCode().toUpperCase().trim());
        c.setCourseName(req.getCourseName().trim());
        return ApiResponse.success(courseRepository.save(c));
    }

    /** PUT /api/courses/{id} — ADMIN only */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Course> updateCourse(@PathVariable Long id,
                                            @Valid @RequestBody CourseRequest req) {
        Course c = courseRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Course not found: " + id, 404));
        c.setCourseCode(req.getCourseCode().toUpperCase().trim());
        c.setCourseName(req.getCourseName().trim());
        return ApiResponse.success(courseRepository.save(c));
    }

    /** DELETE /api/courses/{id} — ADMIN only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteCourse(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            throw new BusinessException("Course not found: " + id, 404);
        }
        courseRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    /* ── Inner DTO ── */
    @Data
    public static class CourseRequest {
        @NotBlank
        private String courseCode;

        @NotBlank
        private String courseName;
    }
}
