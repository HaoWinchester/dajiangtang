package com.dajiangtang.recruitment.domain;

public enum RecruitmentStatus {
    RECRUITING,
    ACTIVE,
    PAUSED,
    CLOSED;

    public boolean isVisibleInDefaultList() {
        return this == RECRUITING || this == ACTIVE;
    }
}
