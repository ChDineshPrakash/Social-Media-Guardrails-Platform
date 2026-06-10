package com.example.demo.controller;

import com.example.demo.entity.Post;
import com.example.demo.service.PostService;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.PostRequestDto;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public Post createPost(@Valid @RequestBody PostRequestDto postRequestDto) {
        return postService.createPost(postRequestDto);
    }

    @GetMapping
    public java.util.List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public Post getPostById(@PathVariable Long id) {
        Post post = postService.getPostById(id);
        if (post == null) {
            throw new IllegalArgumentException("Post with ID " + id + " not found.");
        }
        return post;
    }

    @PostMapping("/{postId}/like")
    public String likePost(@PathVariable Long postId, @RequestParam Long userId) {
        // Stub: This will be connected to Redis Virality logic in Phase 3
        return "Post with ID " + postId + " was liked by User " + userId + ". (Virality Score will be updated in Phase 3)";
    }
}
