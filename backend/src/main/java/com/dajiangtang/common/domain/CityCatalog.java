package com.dajiangtang.common.domain;

import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class CityCatalog {

    private static final Set<String> STANDARD_CITY_NAMES = Set.of(
            "北京市",
            "上海市",
            "广州市",
            "深圳市",
            "杭州市",
            "成都市",
            "南京市",
            "武汉市",
            "西安市"
    );

    public boolean isStandardCityName(String city) {
        return city != null && STANDARD_CITY_NAMES.contains(city.trim());
    }
}
