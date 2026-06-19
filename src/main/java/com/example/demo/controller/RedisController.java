package com.example.demo.controller;

import com.example.demo.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/redis")
//public class RedisController{
//    @Autowired
//    private RedisService redisService;
//
//    @PostMapping("/save")
//    public String save() {
//
//        redisService.saveName();
//
//        return "Saved Successfully";
//    }
//    @PostMapping("/tempsave")
//    public String tempSave() {
//
//        redisService.tempSaveName();
//
//        return "Saved Successfully";
//    }
//    @GetMapping("/name")
//    public String getValue(){
//        return redisService.getValue();
//    }
//    @DeleteMapping("/delete")
//    public String deleteValue(){
//        redisService.delete();
//        return "deleted succesfully";
//    }
//
//
//}
//
