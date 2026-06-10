package com.example.demo.controller;

import com.example.demo.dto.UserRequestDto;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User createUser(@Valid @RequestBody UserRequestDto userRequestDto) {
        return userService.createUser(userRequestDto);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getByUserId(@PathVariable Long id) {
        return userService.getByUserId(id);
    }

    @DeleteMapping("/{id}")
    public String deleteUserById(@PathVariable Long id) {
        if (userService.deleteUser(id)) {
            return "Deleted successfully";
        } else {
            return "Failed to delete";
        }
    }

    @GetMapping("/premium/{isPremium}")
    public List<User> getByIsPremium(@PathVariable boolean isPremium) {
        return userService.getByIsPremium(isPremium);
    }
}
