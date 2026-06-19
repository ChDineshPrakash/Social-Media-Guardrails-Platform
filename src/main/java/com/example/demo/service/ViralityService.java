package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class ViralityService {

    private final RedisTemplate<String, Object> redisTemplate;

    public ViralityService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    private String getViralityKey(Long postId){
        return "post:"+postId+":virality_score";
    }
    public void initializeViralityScore(Long postId){
        redisTemplate.opsForValue().set(getViralityKey(postId),0);
    }
    private void incrementScore(Long postId,int points){
        redisTemplate.opsForValue().increment(getViralityKey(postId),points);
    }
    public void addBotReply(Long postId){
        incrementScore(postId,1);
    }
    public void addHumanLike(Long postId){
        incrementScore(postId,20);
    }
    public void addHumanComment(Long postId){
        incrementScore(postId,50);
    }
    public Long getViralityScore(Long postId) {
        Object score = redisTemplate
                .opsForValue()
                .get(getViralityKey(postId));

        if(score==null) {
            return 0L;
        }
        return Long.parseLong(score.toString());
    }


}
