package com.swp391.backend.integration.jira.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Đại diện cho field "parent" trong Jira issue response.
 * Được dùng để resolve Epic cha của Story, và Story cha của Sub-task.
 * Shape ví dụ:
 * 
 * <pre>
 * { "id": "10001", "key": "PROJ-1", "fields": { "issuetype": { "name": "Epic" } } }
 * </pre>
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraParentRef {
    private String id;
    private String key;
    // fields.issuetype.name không cần thiết vì ta chỉ cần key
}
