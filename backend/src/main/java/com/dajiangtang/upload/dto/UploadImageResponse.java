package com.dajiangtang.upload.dto;

public record UploadImageResponse(
        String username,
        String pagePath,
        String target,
        String dataUrl
) {
}
