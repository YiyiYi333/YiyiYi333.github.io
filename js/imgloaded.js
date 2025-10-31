// 首页头图加载优化
console.log('imgloaded.js 已加载 - 调试版本');

/**
 * @description 实现medium的渐进加载背景的效果
 */
class ProgressiveLoad {
  constructor(smallSrc, largeSrc) {
    // 验证图片路径
    this.smallSrc = this.validateImageSrc(smallSrc);
    this.largeSrc = this.validateImageSrc(largeSrc);
    
    console.log('ProgressiveLoad 初始化:', {
      smallSrc: this.smallSrc,
      largeSrc: this.largeSrc
    });
    
    this.initScrollListener();
    this.initTpl();
  }

  // 验证图片路径
  validateImageSrc(src) {
    if (!src || src === 'null' || src.includes('null')) {
      console.warn('检测到无效的图片路径，使用默认图片:', src);
      // 使用一个默认的透明像素占位图
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
    return src;
  }

  initScrollListener() {
    window.addEventListener("scroll", (() => {
      var e = Math.min(window.scrollY / window.innerHeight, 1);
      if (this.container) {
        this.container.style.setProperty("--process", e);
      }
    }));
  }

  /**
   * @description 生成ui模板
   */
  initTpl() {
    this.container = document.createElement('div');
    this.smallStage = document.createElement('div');
    this.largeStage = document.createElement('div');
    this.video = document.createElement('div');
    this.smallImg = new Image();
    this.largeImg = new Image();
    
    this.container.className = 'pl-container';
    this.container.style.setProperty("--process", 0);
    this.smallStage.className = 'pl-img pl-blur';
    this.largeStage.className = 'pl-img';
    this.video.className = 'pl-video';
    
    this.container.appendChild(this.smallStage);
    this.container.appendChild(this.largeStage);
    this.container.appendChild(this.video);
    
    this.smallImg.onload = this._onSmallLoaded.bind(this);
    this.largeImg.onload = this._onLargeLoaded.bind(this);
    
    // 添加错误处理
    this.smallImg.onerror = this._onImageError.bind(this, 'small');
    this.largeImg.onerror = this._onImageError.bind(this, 'large');
  }

  /**
   * @description 图片加载错误处理
   */
  _onImageError(type) {
    console.error(`${type}图片加载失败:`, this[`${type}Src`]);
  }

  /**
   * @description 加载背景
   */
  progressiveLoad() {
    console.log('开始加载图片:', {
      small: this.smallSrc,
      large: this.largeSrc
    });
    
    this.smallImg.src = this.smallSrc;
    this.largeImg.src = this.largeSrc;
  }

  /**
   * @description 大图加载完成
   */
  _onLargeLoaded() {
    console.log('大图加载完成');
    this.largeStage.classList.add('pl-visible');
    this.largeStage.style.backgroundImage = `url('${this.largeSrc}')`;
  }

  /**
   * @description 小图加载完成
   */
  _onSmallLoaded() {
    console.log('小图加载完成');
    this.smallStage.classList.add('pl-visible');
    this.smallStage.style.backgroundImage = `url('${this.smallSrc}')`;
  }
}

const executeLoad = (config, target) => {
  console.log('执行渐进背景替换，目标元素:', target);
  
  // 验证配置
  const validatedConfig = {
    smallSrc: config.smallSrc && !config.smallSrc.includes('null') ? config.smallSrc : '/img/tu.jpg',
    largeSrc: config.largeSrc && !config.largeSrc.includes('null') ? config.largeSrc : '/img/tu.jpg',
    mobileSmallSrc: config.mobileSmallSrc && !config.mobileSmallSrc.includes('null') ? config.mobileSmallSrc : '/img/tu.jpg',
    mobileLargeSrc: config.mobileLargeSrc && !config.mobileLargeSrc.includes('null') ? config.mobileLargeSrc : '/img/tu.jpg',
  };

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  console.log('是否是移动设备:', isMobile);
  
  const loader = new ProgressiveLoad(
    isMobile ? validatedConfig.mobileSmallSrc : validatedConfig.smallSrc,
    isMobile ? validatedConfig.mobileLargeSrc : validatedConfig.largeSrc
  );

  if (target.children[0]) {
    target.insertBefore(loader.container, target.children[0]);
  } else {
    target.appendChild(loader.container);
  }
  
  loader.progressiveLoad();
};

// 使用绝对路径确保图片可访问
const config = {
  smallSrc: 'https://imgyi.ranranran.qzz.io/file/iuurX3Kh.png',
  largeSrc: 'https://imgyi.ranranran.qzz.io/file/1761464847137_IMG_6604.PNG',
  mobileSmallSrc: 'https://imgyi.ranranran.qzz.io/file/iuurX3Kh.png',
  mobileLargeSrc: 'https://imgyi.ranranran.qzz.io/file/1761464847137_IMG_6604.PNG',
  enableRoutes: ['/'],
};

console.log('配置信息:', config);

function initProgressiveLoad(config) {
  console.log('initProgressiveLoad 被调用');
  
  const container = document.querySelector('.pl-container'); 
  if (container) {
    console.log('移除已存在的 pl-container');
    container.remove(); 
  }
  
  const target = document.getElementById('page-header');
  console.log('找到的 page-header 元素:', target);
  
  if (target && target.classList.contains('full_page')) {
    console.log('条件满足，执行加载');
    executeLoad(config, target);
  } else {
    console.log('条件不满足，跳过加载。target:', target, '有 full_page 类:', target?.classList?.contains('full_page'));
  }
}

function onPJAXComplete(config) {
  console.log('PJAX 完成，重新初始化');
  setTimeout(() => {
    initProgressiveLoad(config);
  }, 100);
}

document.addEventListener("DOMContentLoaded", function() {
  console.log('DOMContentLoaded 事件触发');
  setTimeout(() => {
    initProgressiveLoad(config);
  }, 100);
});

document.addEventListener("pjax:complete", function() {
  console.log('pjax:complete 事件触发');
  onPJAXComplete(config);
});