package com.dajiangtang.upload.repository;

import java.util.Optional;

import com.dajiangtang.upload.dto.UploadImageResponse;

public interface UploadImageRepository {

    Optional<UploadImageResponse> find(String username, String pagePath, String target);

    UploadImageResponse save(String username, String pagePath, String target, String dataUrl);
}
