package com.swp391.backend.service.impl;

import com.swp391.backend.dto.request.CreateClassRequest;
import com.swp391.backend.dto.request.UpdateClassRequest;
import com.swp391.backend.dto.response.AcademicClassResponse;
import com.swp391.backend.entity.AcademicClass;
import com.swp391.backend.entity.Course;
import com.swp391.backend.entity.Semester;
import com.swp391.backend.entity.User;
import com.swp391.backend.exception.BusinessException;
import com.swp391.backend.repository.AcademicClassRepository;
import com.swp391.backend.repository.CourseRepository;
import com.swp391.backend.repository.SemesterRepository;
import com.swp391.backend.repository.UserRepository;
import com.swp391.backend.service.AcademicClassService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AcademicClassServiceImpl implements AcademicClassService {

    private final AcademicClassRepository academicClassRepository;
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;

    public AcademicClassServiceImpl(AcademicClassRepository academicClassRepository,
                                    CourseRepository courseRepository,
                                    SemesterRepository semesterRepository,
                                    UserRepository userRepository) {
        this.academicClassRepository = academicClassRepository;
        this.courseRepository        = courseRepository;
        this.semesterRepository      = semesterRepository;
        this.userRepository          = userRepository;
    }

    @Override
    public Page<AcademicClassResponse> searchClasses(String keyword, String courseCode,
                                                     String semesterCode, Pageable pageable) {
        return academicClassRepository
                .searchClasses(keyword, courseCode, semesterCode, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public AcademicClassResponse createClass(CreateClassRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new BusinessException("Course not found: " + request.getCourseId(), 404));
        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new BusinessException("Semester not found: " + request.getSemesterId(), 404));

        boolean exists = academicClassRepository
                .findByClassCodeAndCourse_CourseCodeAndSemester_SemesterCode(
                        request.getClassCode().trim(), course.getCourseCode(), semester.getSemesterCode())
                .isPresent();
        if (exists) {
            throw new BusinessException(
                    "Class '" + request.getClassCode() + "' already exists in this course and semester.", 409);
        }

        AcademicClass ac = new AcademicClass();
        ac.setClassCode(request.getClassCode().trim().toUpperCase());
        ac.setCourse(course);
        ac.setSemester(semester);
        return toResponse(academicClassRepository.save(ac));
    }

    @Override
    @Transactional
    public AcademicClassResponse updateClass(Long id, UpdateClassRequest request) {
        AcademicClass ac = academicClassRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Class not found: " + id, 404));

        ac.setClassCode(request.getClassCode().trim().toUpperCase());

        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new BusinessException("Course not found: " + request.getCourseId(), 404));
            ac.setCourse(course);
        }
        if (request.getSemesterId() != null) {
            Semester semester = semesterRepository.findById(request.getSemesterId())
                    .orElseThrow(() -> new BusinessException("Semester not found: " + request.getSemesterId(), 404));
            ac.setSemester(semester);
        }
        return toResponse(academicClassRepository.save(ac));
    }

    @Override
    @Transactional
    public AcademicClassResponse assignLecturer(Long classId, Long lecturerId) {
        AcademicClass ac = academicClassRepository.findById(classId)
                .orElseThrow(() -> new BusinessException("Class not found: " + classId, 404));

        if (lecturerId == null) {
            ac.setLecturer(null);
        } else {
            User lecturer = userRepository.findById(lecturerId)
                    .orElseThrow(() -> new BusinessException("User not found: " + lecturerId, 404));
            ac.setLecturer(lecturer);
        }
        return toResponse(academicClassRepository.save(ac));
    }

    @Override
    @Transactional
    public void deleteClass(Long id) {
        if (!academicClassRepository.existsById(id)) {
            throw new BusinessException("Class not found: " + id, 404);
        }
        academicClassRepository.deleteById(id);
    }

    private AcademicClassResponse toResponse(AcademicClass c) {
        AcademicClassResponse r = new AcademicClassResponse();
        r.setClassId(c.getClassId());
        r.setClassCode(c.getClassCode());
        if (c.getCourse() != null) {
            r.setCourseId(c.getCourse().getCourseId());
            r.setCourseCode(c.getCourse().getCourseCode());
            r.setCourseName(c.getCourse().getCourseName());
        }
        if (c.getSemester() != null) {
            r.setSemesterId(c.getSemester().getSemesterId());
            r.setSemesterCode(c.getSemester().getSemesterCode());
            r.setSemesterName(c.getSemester().getSemesterName());
        }
        if (c.getLecturer() != null) {
            r.setLecturerId(c.getLecturer().getUserId());
            r.setLecturerName(c.getLecturer().getFullName());
            r.setLecturerEmail(c.getLecturer().getEmail());
        }
        return r;
    }
}