package com.example.demo.controller;

import com.example.demo.entity.Bot;
import com.example.demo.service.BotService;
import com.example.demo.dto.BotRequestDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bots")
public class BotController {
    private final BotService botService;

    public BotController(BotService botService) {
        this.botService = botService;
    }

    @PostMapping
    public Bot createBot(@Valid @RequestBody BotRequestDto botRequestDto) {
        return botService.createBot(botRequestDto);
    }

    @GetMapping
    public List<Bot> getAllBots() {
        return botService.getAllBots();
    }
}
