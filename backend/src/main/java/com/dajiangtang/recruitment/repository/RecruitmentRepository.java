package com.dajiangtang.recruitment.repository;

import java.util.List;
import java.util.Optional;

import com.dajiangtang.recruitment.domain.Recruitment;

public interface RecruitmentRepository {

    List<Recruitment> findAll();

    Optional<Recruitment> findById(String id);

    Recruitment save(Recruitment recruitment);
}
