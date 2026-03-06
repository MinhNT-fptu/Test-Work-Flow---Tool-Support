package com.swp391.backend.integration.jira.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Đại diện cho các field name-based của Jira (issuetype, priority, v.v.)
 * Nếu là status, thêm statusCategory để mapping sang internal status code.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraName {
    private String name;

    /**
     * Chỉ xuất hiện khi JiraName dùng cho field "status".
     * Có thể null (không ảnh hưởng khi dùng cho issuetype/priority).
     */
    private JiraStatusCategory statusCategory;
}
