package com.dajiangtang.upload.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.security.CurrentUserRoleResolver;
import com.dajiangtang.upload.dto.UploadImageRequest;
import com.dajiangtang.upload.dto.UploadImageResponse;
import com.dajiangtang.upload.service.UploadImageService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/me/uploads")
public class UploadImageController {

    private final CurrentUserRoleResolver userResolver;
    private final UploadImageService uploadImageService;

    public UploadImageController(CurrentUserRoleResolver userResolver, UploadImageService uploadImageService) {
        this.userResolver = userResolver;
        this.uploadImageService = uploadImageService;
    }

    @GetMapping("/{target}")
    public UploadImageResponse find(
            @PathVariable String target,
            @RequestParam(defaultValue = "/") String pagePath,
            HttpServletRequest request
    ) {
        userResolver.resolve(request);
        return uploadImageService.find(userResolver.resolveUsername(request), pagePath, target);
    }

    @PutMapping("/{target}")
    public UploadImageResponse save(
            @PathVariable String target,
            @RequestBody UploadImageRequest body,
            HttpServletRequest request
    ) {
        userResolver.resolve(request);
        return uploadImageService.save(userResolver.resolveUsername(request), body.pagePath(), target, body.dataUrl());
    }
}
