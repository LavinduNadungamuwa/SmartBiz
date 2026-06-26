package com.smartbiz.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenAiResponse {

    private List<OutputItem> output;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OutputItem {
        private List<ContentItem> content;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ContentItem {
        private String text;
    }
}