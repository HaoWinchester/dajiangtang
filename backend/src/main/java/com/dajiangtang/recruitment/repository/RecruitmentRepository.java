package com.dajiangtang.recruitment.repository;

import java.util.List;

import com.dajiangtang.recruitment.domain.Recruitment;

public interface RecruitmentRepository {

    List<Recruitment> findAll();
}
