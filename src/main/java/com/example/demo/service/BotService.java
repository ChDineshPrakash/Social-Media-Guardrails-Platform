package com.example.demo.service;

import com.example.demo.entity.Bot;
import com.example.demo.repository.BotRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.demo.dto.BotRequestDto;

@Service
public class BotService {
    private final BotRepository botRepository;

    public BotService(BotRepository botRepository){
        this.botRepository=botRepository;
    }
    public Bot createBot(BotRequestDto dto){
        Bot bot = new Bot();
        bot.setName(dto.getName());
        bot.setPersonaDescription(dto.getPersonaDescription());
        return botRepository.save(bot);
    }
    public List<Bot> getAllBots(){
        return botRepository.findAll();
    }
    public Bot getBotById(Long id){
        return botRepository.findById(id).orElse(null);
    }
}
