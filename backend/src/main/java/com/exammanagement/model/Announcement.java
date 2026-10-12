package com.exammanagement.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "announcements")
public class Announcement {

    @Id
    private String id;

    private String title;
    private String content;
    private String targetRole; // ALL, ROLE_STUDENT, ROLE_EXAMINER
    private String authorName;
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    @CreatedDate
    private Instant createdAt;

    public Announcement() {
    }

    public Announcement(String title, String content, String targetRole, String authorName, String priority) {
        this.title = title;
        this.content = content;
        this.targetRole = targetRole;
        this.authorName = authorName;
        this.priority = priority;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
