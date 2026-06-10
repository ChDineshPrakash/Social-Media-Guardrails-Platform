package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

import com.example.demo.dto.UserRequestDto;

@Service
public class UserService {
    private final UserRepository userRepository;
    public UserService(UserRepository userRepository){
        this.userRepository=userRepository;
    }
    public User createUser(UserRequestDto dto){
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPremium(dto.getIsPremium() != null ? dto.getIsPremium() : false);
        return userRepository.save(user);
    }
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }
    public User getByUserId(Long id){
        return userRepository.findById(id).orElse(null);
    }
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<User> getByIsPremium(boolean isPremium) {
        return userRepository.findByIsPremium(isPremium);
    }
}
