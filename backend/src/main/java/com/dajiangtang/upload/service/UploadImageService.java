package com.dajiangtang.upload.service;

import org.springframework.stereotype.Service;

import com.dajiangtang.common.error.BadRequestException;
import com.dajiangtang.upload.dto.UploadImageResponse;
import com.dajiangtang.upload.repository.UploadImageRepository;

@Service
public class UploadImageService {

    private final UploadImageRepository uploadImageRepository;

    public UploadImageService(UploadImageRepository uploadImageRepository) {
        this.uploadImageRepository = uploadImageRepository;
    }

    public UploadImageResponse find(String username, String pagePath, String target) {
        ensureTarget(target);
        return uploadImageRepository.find(username, pagePath, target)
                .orElse(new UploadImageResponse(username, pagePath, target, ""));
    }

    public UploadImageResponse save(String username, String pagePath, String target, String dataUrl) {
        ensureTarget(target);
        if (dataUrl == null || !dataUrl.startsWith("data:image/")) {
            throw new BadRequestException("仅支持保存图片数据。");
        }
        return uploadImageRepository.save(username, pagePath, target, dataUrl);
    }

    private void ensureTarget(String target) {
        if (!"avatar".equals(target) && !"brand-asset".equals(target) && !"image".equals(target)) {
            throw new BadRequestException("上传目标不存在。");
        }
    }
}
