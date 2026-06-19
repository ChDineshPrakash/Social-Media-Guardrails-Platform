package com.example.demo.service;

import com.example.demo.entity.Post;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.dto.PostRequestDto;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ViralityService viralityService;

    public PostService(PostRepository postRepository,
                       UserRepository userRepository,
                       ViralityService viralityService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.viralityService = viralityService;
    }

    public Post createPost(PostRequestDto dto) {
        // Validate that the user exists in our database
        if (!userRepository.existsById(dto.getAuthorId())) {
            throw new IllegalArgumentException("User with ID " + dto.getAuthorId() + " does not exist.");
        }
        
        Post post = new Post();
        post.setAuthorId(dto.getAuthorId());
        post.setContent(dto.getContent());
        post.setCreatedAt(LocalDateTime.now());
        Post savedPost=postRepository.save(post);
        viralityService.initializeViralityScore(savedPost.getId());
        return savedPost;
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id).orElse(null);
    }
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }
    public Long getViralityScore(Long postId){
        return viralityService.getViralityScore(postId);
    }
}
