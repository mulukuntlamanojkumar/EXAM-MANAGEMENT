package com.exammanagement.controller;

import com.exammanagement.model.Announcement;
import com.exammanagement.service.AnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public")
public class PublicController {

    private final AnnouncementService announcementService;

    public PublicController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Exam Management Backend API"));
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements(@RequestParam(defaultValue = "ALL") String role) {
        return ResponseEntity.ok(announcementService.getAnnouncementsForRole(role));
    }
}
