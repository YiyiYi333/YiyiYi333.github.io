var posts=["2025/10/18/hello-world/","2025/10/18/染/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };