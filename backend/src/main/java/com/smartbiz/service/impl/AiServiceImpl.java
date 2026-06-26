package com.smartbiz.service.impl;

import com.smartbiz.dto.*;
import com.smartbiz.entity.User;
import com.smartbiz.repository.CustomerRepository;
import com.smartbiz.repository.ExpenseRepository;
import com.smartbiz.repository.ProductRepository;
import com.smartbiz.repository.SaleRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.security.SecurityUtils;
import com.smartbiz.service.AiService;
import com.smartbiz.util.SecurityHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AiServiceImpl implements AiService {

    @Value("${openai.api.key}")
    private String openAiApiKey;

    @Value("${openai.api.url}")
    private String openAiApiUrl;

    @Value("${openai.model}")
    private String model;

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;
    private final RestTemplate restTemplate;

    public AiServiceImpl(UserRepository userRepository,
                         CustomerRepository customerRepository,
                         ProductRepository productRepository,
                         SaleRepository saleRepository,
                         ExpenseRepository expenseRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.expenseRepository = expenseRepository;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public AiResponseDto askQuestion(String question) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        long totalCustomers = customerRepository.findByBusinessId(businessId).size();
        long totalProducts = productRepository.findByBusinessId(businessId).size();
        long totalSales = saleRepository.findByBusinessId(businessId).size();
        long totalExpensesCount = expenseRepository.findByBusinessId(businessId).size();

        BigDecimal totalRevenue = saleRepository.findByBusinessId(businessId)
                .stream()
                .map(sale -> sale.getTotalAmount() == null ? BigDecimal.ZERO : sale.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenseRepository.findByBusinessId(businessId)
                .stream()
                .map(expense -> expense.getAmount() == null ? BigDecimal.ZERO : expense.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);

        String prompt = buildPrompt(
                question,
                totalCustomers,
                totalProducts,
                totalSales,
                totalExpensesCount,
                totalRevenue,
                totalExpenses,
                netProfit
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if (openAiApiKey == null || openAiApiKey.isBlank() || openAiApiKey.equals("YOUR_OPENAI_API_KEY")) {
            String mockAnswer = generateMockResponse(totalRevenue, totalExpenses, netProfit);
            return new AiResponseDto(mockAnswer);
        }

        headers.setBearerAuth(openAiApiKey);

        OpenAiRequest requestBody = OpenAiRequest.builder()
                .model(model)
                .input(prompt)
                .build();

        HttpEntity<OpenAiRequest> requestEntity = new HttpEntity<>(requestBody, headers);


        // below, commented out the code for real api key implementation ///////////////////////////////

//        ResponseEntity<OpenAiResponse> response = restTemplate.exchange(
//                openAiApiUrl,
//                HttpMethod.POST,
//                requestEntity,
//                OpenAiResponse.class
//        );
//
//        String answer = extractText(response.getBody());
//
//        return new AiResponseDto(answer);                    //for real open api key (purchase)


        // instead, using a mock API //////////////////////////////////////////////////////////
        try {
            ResponseEntity<OpenAiResponse> response = restTemplate.exchange(
                    openAiApiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    OpenAiResponse.class
            );

            String answer = extractText(response.getBody());
            return new AiResponseDto(answer);

        } catch (Exception e) {

            // 🔥 MOCK fallback
            String mockAnswer = generateMockResponse(
                    totalRevenue,
                    totalExpenses,
                    netProfit
            );

            return new AiResponseDto(mockAnswer);
        }

        /// ////////////////////////////////////////////////////////////////////////////////////////
    }

    private String buildPrompt(String question,
                               long totalCustomers,
                               long totalProducts,
                               long totalSales,
                               long totalExpensesCount,
                               BigDecimal totalRevenue,
                               BigDecimal totalExpenses,
                               BigDecimal netProfit) {

        return """
                You are an AI assistant for SmartBiz.
                Give clear, practical, business-focused answers.

                Business Summary:
                - Total Customers: %d
                - Total Products: %d
                - Total Sales: %d
                - Total Expense Records: %d
                - Total Revenue: %s
                - Total Expenses: %s
                - Net Profit: %s

                User Question:
                %s
                """.formatted(
                totalCustomers,
                totalProducts,
                totalSales,
                totalExpensesCount,
                totalRevenue,
                totalExpenses,
                netProfit,
                question
        );
    }

    private String extractText(OpenAiResponse response) {
        if (response == null || response.getOutput() == null) {
            return "No response from AI service.";
        }

        StringBuilder sb = new StringBuilder();

        for (OpenAiResponse.OutputItem outputItem : response.getOutput()) {
            if (outputItem.getContent() != null) {
                for (OpenAiResponse.ContentItem contentItem : outputItem.getContent()) {
                    if (contentItem.getText() != null) {
                        sb.append(contentItem.getText());
                    }
                }
            }
        }

        String result = sb.toString().trim();
        return result.isEmpty() ? "No answer generated." : result;
    }

    // mock api method /////////////////////////////////////////////////////////////////////////
    private String generateMockResponse(BigDecimal revenue,
                                        BigDecimal expenses,
                                        BigDecimal profit) {

        return """
            Business Summary:
            - Revenue: %s
            - Expenses: %s
            - Profit: %s

            Suggestions:
            1. Increase sales through promotions or discounts
            2. Reduce unnecessary expenses
            3. Focus on high-performing products

            Overall:
            Your business is currently %s.
            """.formatted(
                revenue,
                expenses,
                profit,
                profit.compareTo(BigDecimal.ZERO) > 0 ? "profitable" : "making a loss"
        );
    }
}