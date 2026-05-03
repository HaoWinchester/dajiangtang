package com.dajiangtang.upload.repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import com.dajiangtang.upload.dto.UploadImageResponse;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "memory", matchIfMissing = true)
public class InMemoryUploadImageRepository implements UploadImageRepository {

    private final Map<String, UploadImageResponse> uploads = new ConcurrentHashMap<>();

    @Override
    public Optional<UploadImageResponse> find(String username, String pagePath, String target) {
        return Optional.ofNullable(uploads.get(key(username, pagePath, target)));
    }

    @Override
    public UploadImageResponse save(String username, String pagePath, String target, String dataUrl) {
        UploadImageResponse response = new UploadImageResponse(normalize(username), normalizePath(pagePath), target, dataUrl);
        uploads.put(key(username, pagePath, target), response);
        return response;
    }

    private String key(String username, String pagePath, String target) {
        return normalize(username) + ":" + normalizePath(pagePath) + ":" + target;
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }

    private String normalizePath(String pagePath) {
        return pagePath == null || pagePath.isBlank() ? "/" : pagePath.trim();
    }
}
