var posts=["2025/10/20/伊伊伊/","2025/10/18/染/","2025/10/18/hello-world/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };