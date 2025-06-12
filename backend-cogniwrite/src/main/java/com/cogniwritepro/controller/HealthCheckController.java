// File: src/main/java/com/cogniwritepro/controller/HealthCheckController.java
package com.cogniwritepro.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api") // You could make this just "/" or "/health"
public class HealthCheckController {

    /**
     * GET /api/ping
     * Returns "pong" to indicate the backend is running.
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return new ResponseEntity<>("pong", HttpStatus.OK);
    }
}
