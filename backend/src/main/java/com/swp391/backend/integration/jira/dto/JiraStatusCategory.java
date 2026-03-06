package com.swp391.backend.integration.jira.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Đại diện cho statusCategory trong Jira issue status.
 * key có thể là: "new", "indeterminate", "done"
 * Shape ví dụ:
 * 
 * <pre>
 * { "status": { "statusCategory": { "key": "done" } } }
 * </pre>
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraStatusCategory {

    /** "new" | "indeterminate" | "done" */
    private String key;
}
