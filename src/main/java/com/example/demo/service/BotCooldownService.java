package com.example.demo.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
@Service
public class BotCooldownService {
    private final RedisTemplate<String,Object> redisTemplate;
    public BotCooldownService(RedisTemplate<String,Object> redisTemplate){
        this.redisTemplate=redisTemplate;
    }
    public String getCooldownKey(Long botId,Long userId){
        return "cooldown:bot:"+botId+":user:"+userId;
    }
    public void startCooldown(Long botId, Long userId) {
        redisTemplate.opsForValue().set(
                getCooldownKey(botId, userId),
                true,
                Duration.ofMinutes(10)
        );
    }
    public boolean canReply(Long botId ,Long userId){
        return !Boolean.TRUE.equals(
                redisTemplate.hasKey(getCooldownKey(botId, userId))
        );
    }
}
