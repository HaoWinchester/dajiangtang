package com.dajiangtang.home.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.home.dto.HomeRecruitmentItemResponse;
import com.dajiangtang.home.service.HomeRecruitmentService;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final HomeRecruitmentService homeRecruitmentService;

    public HomeController(HomeRecruitmentService homeRecruitmentService) {
        this.homeRecruitmentService = homeRecruitmentService;
    }

    @GetMapping("/recruitments")
    public List<HomeRecruitmentItemResponse> recruitments() {
        return homeRecruitmentService.listFeaturedRecruitments();
    }
}
