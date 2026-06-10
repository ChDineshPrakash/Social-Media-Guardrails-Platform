const state = {
    users: [],
    bots: [],
    posts: [],
    comments: [],
    activeUserId: null,
    activeBotId: null,
    activePostId: null
};

const els = {
    activeUserSelect: document.getElementById("activeUserSelect"),
    activeUserBadge: document.getElementById("activeUserBadge"),
    activeUserAvatar: document.getElementById("activeUserAvatar"),
    activeUserUsername: document.getElementById("activeUserUsername"),
    activeUserRole: document.getElementById("activeUserRole"),
    activeBotSelect: document.getElementById("activeBotSelect"),
    activeUserPublishLabel: document.getElementById("activeUserPublishLabel"),
    connectionStatus: document.getElementById("connectionStatus"),
    quickUserForm: document.getElementById("quickUserForm"),
    quickBotForm: document.getElementById("quickBotForm"),
    createPostForm: document.getElementById("createPostForm"),
    postContent: document.getElementById("postContent"),
    postCharCount: document.getElementById("postCharCount"),
    submitPostBtn: document.getElementById("submitPostBtn"),
    postsFeed: document.getElementById("postsFeed"),
    feedCount: document.getElementById("feedCount"),
    metricHumansCount: document.getElementById("metricHumansCount"),
    metricBotsCount: document.getElementById("metricBotsCount"),
    metricPostsCount: document.getElementById("metricPostsCount"),
    seedDatabaseBtn: document.getElementById("seedDatabaseBtn"),
    refreshBtn: document.getElementById("refreshBtn"),
    warningLogs: document.getElementById("warningLogs"),
    clearLogsBtn: document.getElementById("clearLogsBtn"),
    commentsPanel: document.getElementById("commentsPanel"),
    commentsActivePostTitle: document.getElementById("commentsActivePostTitle"),
    closeCommentsBtn: document.getElementById("closeCommentsBtn"),
    commentForm: document.getElementById("commentForm"),
    commentAuthorType: document.getElementById("commentAuthorType"),
    selectedCommentAuthorName: document.getElementById("selectedCommentAuthorName"),
    replyParentId: document.getElementById("replyParentId"),
    replyingToIndicator: document.getElementById("replyingToIndicator"),
    cancelReplyBtn: document.getElementById("cancelReplyBtn"),
    commentContent: document.getElementById("commentContent"),
    commentCharCount: document.getElementById("commentCharCount"),
    submitCommentBtn: document.getElementById("submitCommentBtn"),
    commentsTree: document.getElementById("commentsTree"),
    toastContainer: document.getElementById("toastContainer")
};

window.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    updateCharacterCounts();
    refreshAll();
});

function bindEvents() {
    els.activeUserSelect.addEventListener("change", () => {
        state.activeUserId = numberOrNull(els.activeUserSelect.value);
        updateActiveUserUI();
        renderPostsFeed();
    });

    els.activeBotSelect.addEventListener("change", () => {
        state.activeBotId = numberOrNull(els.activeBotSelect.value);
        updateCommentAuthorLabel();
    });

    els.commentAuthorType.addEventListener("change", updateCommentAuthorLabel);
    els.quickUserForm.addEventListener("submit", handleRegisterUser);
    els.quickBotForm.addEventListener("submit", handleRegisterBot);
    els.createPostForm.addEventListener("submit", handleCreatePost);
    els.commentForm.addEventListener("submit", handleCreateComment);
    els.seedDatabaseBtn.addEventListener("click", seedDatabaseClientSide);
    els.refreshBtn.addEventListener("click", refreshAll);
    els.closeCommentsBtn.addEventListener("click", closeCommentsPanel);
    els.cancelReplyBtn.addEventListener("click", resetReplyTarget);
    els.clearLogsBtn.addEventListener("click", clearEventLogs);
    els.postContent.addEventListener("input", updateCharacterCounts);
    els.commentContent.addEventListener("input", updateCharacterCounts);
}

async function refreshAll() {
    setConnectionStatus("Loading", "");
    addEventLog("Refreshing records from backend API...", "info");

    try {
        await Promise.all([fetchUsers(), fetchBots(), fetchPosts()]);
        setConnectionStatus("Connected", "ok");
        addEventLog("Records loaded successfully.", "success");
    } catch (error) {
        setConnectionStatus("Offline", "error");
        addEventLog(`Backend connection failed: ${error.message}`, "error");
        showToast("Backend Connection Error", "Start the Spring Boot app on port 9091, then refresh.", "error");
    }

    updateActionStates();
}

async function fetchUsers() {
    state.users = await requestJson("/api/users");
    els.metricHumansCount.textContent = state.users.length;
    renderUserSelect();
}

async function fetchBots() {
    state.bots = await requestJson("/api/bots");
    els.metricBotsCount.textContent = state.bots.length;
    renderBotSelect();
}

async function fetchPosts() {
    state.posts = await requestJson("/api/posts");
    els.metricPostsCount.textContent = state.posts.length;
    renderPostsFeed();
}

function renderUserSelect() {
    if (state.users.length === 0) {
        els.activeUserSelect.innerHTML = `<option value="">No users found</option>`;
        state.activeUserId = null;
        updateActiveUserUI();
        return;
    }

    els.activeUserSelect.innerHTML = state.users
        .map((user) => `<option value="${user.id}">${escapeHtml(user.username)} (${user.premium ? "Premium" : "Standard"})</option>`)
        .join("");

    if (!state.activeUserId || !state.users.some((user) => user.id === state.activeUserId)) {
        state.activeUserId = state.users[0].id;
    }

    els.activeUserSelect.value = state.activeUserId;
    updateActiveUserUI();
}

function renderBotSelect() {
    if (state.bots.length === 0) {
        els.activeBotSelect.innerHTML = `<option value="">No bots found</option>`;
        state.activeBotId = null;
        updateCommentAuthorLabel();
        return;
    }

    els.activeBotSelect.innerHTML = state.bots
        .map((bot) => `<option value="${bot.id}">${escapeHtml(bot.name)}</option>`)
        .join("");

    if (!state.activeBotId || !state.bots.some((bot) => bot.id === state.activeBotId)) {
        state.activeBotId = state.bots[0].id;
    }

    els.activeBotSelect.value = state.activeBotId;
    updateCommentAuthorLabel();
}

function updateActiveUserUI() {
    const activeUser = state.users.find((user) => user.id === state.activeUserId);

    if (!activeUser) {
        els.activeUserBadge.hidden = true;
        els.activeUserPublishLabel.textContent = "None";
        updateActionStates();
        updateCommentAuthorLabel();
        return;
    }

    els.activeUserBadge.hidden = false;
    els.activeUserAvatar.textContent = initials(activeUser.username);
    els.activeUserUsername.textContent = activeUser.username;
    els.activeUserRole.textContent = activeUser.premium ? "Premium Human" : "Standard Human";
    els.activeUserPublishLabel.textContent = activeUser.username;
    updateActionStates();
    updateCommentAuthorLabel();
}

function updateCommentAuthorLabel() {
    if (els.commentAuthorType.value === "USER") {
        const activeUser = state.users.find((user) => user.id === state.activeUserId);
        els.selectedCommentAuthorName.textContent = activeUser ? `${activeUser.username} (Human)` : "No active user";
    } else {
        const activeBot = state.bots.find((bot) => bot.id === state.activeBotId);
        els.selectedCommentAuthorName.textContent = activeBot ? `${activeBot.name} (Bot)` : "No bot selected";
    }

    updateActionStates();
}

function updateActionStates() {
    els.submitPostBtn.disabled = !state.activeUserId;
    const needsBot = els.commentAuthorType.value === "BOT";
    els.submitCommentBtn.disabled = !state.activePostId || !state.activeUserId && !needsBot || needsBot && !state.activeBotId;
}

function renderPostsFeed() {
    els.feedCount.textContent = `${state.posts.length} ${state.posts.length === 1 ? "post" : "posts"}`;

    if (state.posts.length === 0) {
        els.postsFeed.innerHTML = `
            <div class="empty-state">
                <strong>No posts yet</strong>
                <span>Create a user and publish a post, or use Seed Demo Records.</span>
            </div>
        `;
        return;
    }

    const sortedPosts = [...state.posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    els.postsFeed.innerHTML = sortedPosts.map(renderPostCard).join("");
}

function renderPostCard(post) {
    const authorName = getAuthorName(post.authorId, "USER");
    const activeClass = state.activePostId === post.id ? " active" : "";

    return `
        <article class="post-card${activeClass}" id="post-card-${post.id}" tabindex="0" role="button" aria-label="Open comments for post ${post.id}">
            <div class="post-card-header">
                <div class="author-meta">
                    <div class="avatar">${escapeHtml(initials(authorName))}</div>
                    <div>
                        <strong>${escapeHtml(authorName)}</strong>
                        <span class="role-tag">Human</span>
                    </div>
                </div>
                <span class="time-stamp">${formatDate(post.createdAt)}</span>
            </div>
            <div class="post-content">${escapeHtml(post.content)}</div>
            <div class="post-actions">
                <button class="action-btn" type="button" data-action="comments" data-post-id="${post.id}">Comments</button>
                <button class="action-btn" type="button" data-action="like" data-post-id="${post.id}">Like</button>
            </div>
        </article>
    `;
}

els.postsFeed.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    const postCard = event.target.closest(".post-card");

    if (actionButton) {
        const postId = Number(actionButton.dataset.postId);
        if (actionButton.dataset.action === "like") {
            handleLikePost(postId);
            return;
        }
        selectPostForComments(postId);
        return;
    }

    if (postCard) {
        selectPostForComments(Number(postCard.id.replace("post-card-", "")));
    }
});

els.postsFeed.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("post-card")) {
        event.preventDefault();
        selectPostForComments(Number(event.target.id.replace("post-card-", "")));
    }
});

async function selectPostForComments(postId) {
    state.activePostId = postId;
    document.querySelectorAll(".post-card").forEach((card) => card.classList.toggle("active", card.id === `post-card-${postId}`));
    const post = state.posts.find((item) => item.id === postId);
    els.commentsActivePostTitle.textContent = post ? `Post #${post.id}: ${truncate(post.content, 72)}` : `Post #${postId}`;
    resetReplyTarget();
    updateActionStates();
    await loadComments(postId);
    els.commentsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeCommentsPanel() {
    state.activePostId = null;
    state.comments = [];
    els.commentsActivePostTitle.textContent = "Select a post to view comments";
    els.commentsTree.innerHTML = `
        <div class="empty-state">
            <strong>No post selected</strong>
            <span>Choose a post from the feed to open its comment thread.</span>
        </div>
    `;
    document.querySelectorAll(".post-card").forEach((card) => card.classList.remove("active"));
    resetReplyTarget();
    updateActionStates();
}

async function loadComments(postId) {
    els.commentsTree.innerHTML = `<div class="empty-state"><div class="spinner"></div><span>Loading comments...</span></div>`;

    try {
        state.comments = await requestJson(`/api/posts/${postId}/comments`);
        renderCommentsTree();
    } catch (error) {
        els.commentsTree.innerHTML = `<div class="empty-state"><strong>Comments failed to load</strong><span>${escapeHtml(error.message)}</span></div>`;
    }
}

function renderCommentsTree() {
    if (state.comments.length === 0) {
        els.commentsTree.innerHTML = `
            <div class="empty-state">
                <strong>No comments yet</strong>
                <span>Post the first comment or reply as a user or bot.</span>
            </div>
        `;
        return;
    }

    const byId = new Map();
    state.comments.forEach((comment) => byId.set(comment.id, { ...comment, children: [] }));

    const roots = [];
    state.comments.forEach((comment) => {
        const mapped = byId.get(comment.id);
        const parent = byId.get(comment.parentCommentId);
        if (parent) {
            parent.children.push(mapped);
        } else {
            roots.push(mapped);
        }
    });

    els.commentsTree.innerHTML = roots.map((comment) => renderCommentNode(comment, 1)).join("");
}

function renderCommentNode(comment, depth) {
    const authorName = getAuthorName(comment.authorId, comment.authorType);
    const children = comment.children.map((child) => renderCommentNode(child, depth + 1)).join("");

    return `
        <div class="comment-node" id="comment-node-${comment.id}">
            <div class="comment-wrapper">
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="avatar">${escapeHtml(initials(authorName))}</div>
                        <strong>${escapeHtml(authorName)}</strong>
                        <span class="role-tag">${escapeHtml(comment.authorType)}</span>
                    </div>
                    <div class="comment-meta">
                        <span class="depth-pill">Level ${comment.depthLevel || depth}</span>
                        <span class="time-stamp">${formatDate(comment.createdAt)}</span>
                    </div>
                </div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
                <div class="comment-actions">
                    <button class="action-btn" type="button" onclick="setReplyTarget(${comment.id}, '${escapeJsString(authorName)}')">Reply</button>
                </div>
            </div>
            ${children ? `<div class="comment-children">${children}</div>` : ""}
        </div>
    `;
}

window.setReplyTarget = function setReplyTarget(commentId, authorName) {
    els.replyParentId.value = commentId;
    els.replyingToIndicator.textContent = `Replying to ${authorName}`;
    els.cancelReplyBtn.hidden = false;
    els.commentContent.focus();
};

function resetReplyTarget() {
    els.replyParentId.value = "";
    els.replyingToIndicator.textContent = "Replying to Post";
    els.cancelReplyBtn.hidden = true;
}

async function handleRegisterUser(event) {
    event.preventDefault();
    const username = document.getElementById("regUsername").value.trim();
    const isPremium = document.getElementById("regPremium").checked;

    if (!username) return;

    try {
        const user = await requestJson("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, isPremium })
        });

        state.activeUserId = user.id;
        els.quickUserForm.reset();
        await fetchUsers();
        showToast("User Created", `${username} is now selected.`, "success");
        addEventLog(`Created user ${username}.`, "success");
    } catch (error) {
        showToast("User Error", error.message, "error");
        addEventLog(`User creation failed: ${error.message}`, "error");
    }
}

async function handleRegisterBot(event) {
    event.preventDefault();
    const name = document.getElementById("regBotName").value.trim();
    const personaDescription = document.getElementById("regBotPersona").value.trim();

    if (!name || !personaDescription) return;

    try {
        const bot = await requestJson("/api/bots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, personaDescription })
        });

        state.activeBotId = bot.id;
        els.quickBotForm.reset();
        await fetchBots();
        showToast("Bot Created", `${name} is ready for comments.`, "success");
        addEventLog(`Created bot ${name}.`, "success");
    } catch (error) {
        showToast("Bot Error", error.message, "error");
        addEventLog(`Bot creation failed: ${error.message}`, "error");
    }
}

async function handleCreatePost(event) {
    event.preventDefault();
    const content = els.postContent.value.trim();

    if (!state.activeUserId) {
        showToast("Select a User", "Create or select a human user before posting.", "error");
        return;
    }

    try {
        const post = await requestJson("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authorId: state.activeUserId, content })
        });

        els.postContent.value = "";
        updateCharacterCounts();
        await fetchPosts();
        showToast("Post Published", "The feed has been updated.", "success");
        addEventLog(`Created post #${post.id}.`, "success");
    } catch (error) {
        showToast("Post Error", error.message, "error");
        addEventLog(`Post creation failed: ${error.message}`, "error");
    }
}

async function handleCreateComment(event) {
    event.preventDefault();

    if (!state.activePostId) {
        showToast("Select a Post", "Open a post before adding comments.", "error");
        return;
    }

    const authorType = els.commentAuthorType.value;
    const authorId = authorType === "USER" ? state.activeUserId : state.activeBotId;
    const parentCommentId = numberOrNull(els.replyParentId.value);
    const content = els.commentContent.value.trim();

    if (!authorId) {
        showToast("Select an Author", `No active ${authorType.toLowerCase()} is selected.`, "error");
        return;
    }

    try {
        await requestJson(`/api/posts/${state.activePostId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authorId, authorType, content, parentCommentId })
        });

        els.commentContent.value = "";
        updateCharacterCounts();
        resetReplyTarget();
        await loadComments(state.activePostId);
        showToast("Comment Posted", "Thread updated.", "success");
        addEventLog("Posted a comment.", "success");
    } catch (error) {
        showToast("Comment Error", error.message, "error");
        addEventLog(`Comment failed: ${error.message}`, "error");
    }
}

async function handleLikePost(postId) {
    if (!state.activeUserId) {
        showToast("Select a User", "Likes require an active human user.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}/like?userId=${state.activeUserId}`, { method: "POST" });
        const text = await response.text();
        if (!response.ok) throw new Error(text || `Request failed with ${response.status}`);
        showToast("Post Liked", text, "success");
        addEventLog(text, "success");
    } catch (error) {
        showToast("Like Error", error.message, "error");
        addEventLog(`Like failed: ${error.message}`, "error");
    }
}

async function seedDatabaseClientSide() {
    els.seedDatabaseBtn.disabled = true;
    addEventLog("Creating demo users, bots, and a starter post...", "info");

    const demoUsers = [
        { username: uniqueName("john_doe"), isPremium: true },
        { username: uniqueName("alice_smith"), isPremium: false },
        { username: uniqueName("bob_jones"), isPremium: false }
    ];
    const demoBots = [
        { name: uniqueName("helper_bot"), personaDescription: "A friendly assistant bot" },
        { name: uniqueName("moderator_bot"), personaDescription: "A strict spam checker bot" }
    ];

    try {
        const createdUsers = [];
        for (const user of demoUsers) {
            createdUsers.push(await requestJson("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user)
            }));
        }

        for (const bot of demoBots) {
            await requestJson("/api/bots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bot)
            });
        }

        state.activeUserId = createdUsers[0]?.id || state.activeUserId;
        await Promise.all([fetchUsers(), fetchBots()]);

        if (state.activeUserId) {
            await requestJson("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    authorId: state.activeUserId,
                    content: "Welcome to the Guardrails Console. Create users, configure bots, publish posts, and test nested comment threads."
                })
            });
            await fetchPosts();
        }

        showToast("Demo Data Ready", "Seed records were created.", "success");
        addEventLog("Demo seed completed.", "success");
    } catch (error) {
        showToast("Seed Failed", error.message, "error");
        addEventLog(`Seed failed: ${error.message}`, "error");
    } finally {
        els.seedDatabaseBtn.disabled = false;
    }
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
        if (contentType.includes("application/json")) {
            const data = await response.json();
            throw new Error(formatApiError(data));
        }
        throw new Error(await response.text() || `Request failed with ${response.status}`);
    }

    if (!contentType.includes("application/json")) {
        return null;
    }

    return response.json();
}

function formatApiError(data) {
    if (!data) return "Request failed";
    const detail = Array.isArray(data.details) && data.details.length ? ` ${data.details.join(" ")}` : "";
    return `${data.message || "Request failed"}${detail}`;
}

function getAuthorName(authorId, authorType) {
    if (authorType === "BOT") {
        return state.bots.find((bot) => bot.id === authorId)?.name || `Bot #${authorId}`;
    }

    return state.users.find((user) => user.id === authorId)?.username || `User #${authorId}`;
}

function addEventLog(message, type = "info") {
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    els.warningLogs.appendChild(entry);
    els.warningLogs.scrollTop = els.warningLogs.scrollHeight;

    while (els.warningLogs.children.length > 60) {
        els.warningLogs.removeChild(els.warningLogs.firstElementChild);
    }
}

function clearEventLogs() {
    els.warningLogs.innerHTML = `<div class="log-entry">Console cleared.</div>`;
}

function showToast(title, body, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "error" : ""}`;
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span>`;
    els.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
}

function updateCharacterCounts() {
    els.postCharCount.textContent = `${els.postContent.value.length} / 1000`;
    els.commentCharCount.textContent = `${els.commentContent.value.length} / 1000`;
}

function setConnectionStatus(text, className) {
    els.connectionStatus.textContent = text;
    els.connectionStatus.className = `status-pill ${className || ""}`.trim();
}

function numberOrNull(value) {
    const number = Number(value);
    return Number.isFinite(number) && value !== "" ? number : null;
}

function initials(value) {
    return String(value || "?").trim().slice(0, 2).toUpperCase();
}

function truncate(value, maxLength) {
    const text = String(value || "");
    return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function uniqueName(prefix) {
    return `${prefix}_${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100)}`;
}

function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJsString(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
