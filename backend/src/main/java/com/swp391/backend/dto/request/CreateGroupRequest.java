package com.swp391.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateGroupRequest {
    // classId có thể null, trong trường hợp đó sẽ dùng classCode + courseCode + semesterCode để tra cứu
    private Long classId;

    private String classCode;
    private String courseCode;
    private String semesterCode;

    // Frontend có thể gửi "semester" thay vì "semesterCode"
    private String semester;

    @NotBlank
    private String groupName;
}
