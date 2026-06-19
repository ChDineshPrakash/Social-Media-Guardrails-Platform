package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RedisService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

//    public void saveName(){
//        System.out.println("Inside saveName()");
//        redisTemplate
//                .opsForValue()
//                .set("name","dinesh");
//    }
//    public void tempSaveName(){
//        redisTemplate
//                .opsForValue()
//                .set("name","dinesh", Duration.ofSeconds(60));
//    }
//    public String getValue(){
//        return redisTemplate
//                .opsForValue()
//                .get("name");
//    }
//    public void delete(){
//       redisTemplate.delete("name");
//    }
}
