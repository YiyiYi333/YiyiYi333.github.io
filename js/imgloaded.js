// 首页头图渐进加载优化 - 综合优化版
console.log('imgloaded.js 已加载 - 综合优化版本');

/**
 * @description 实现medium的渐进加载背景的效果
 */
(function() {
    'use strict';
    
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
            
            // 动画结束后隐藏小图以优化性能
            this.container.addEventListener('animationend', () => {
                console.log('动画结束，隐藏小图');
                this.smallStage.style.display = 'none'; 
            }, {once: true});
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

        // 初始化滚动监听
        initScrollListener() {
            window.addEventListener("scroll", (() => {
                const scrollProgress = Math.min(window.scrollY / window.innerHeight, 1);
                if (this.container) {
                    this.container.style.setProperty("--process", scrollProgress);
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
            this.smallImg = new Image();
            this.largeImg = new Image();
            
            this.container.className = 'pl-container';
            this.container.style.setProperty("--process", 0);
            this.smallStage.className = 'pl-img pl-blur';
            this.largeStage.className = 'pl-img';
            
            this.container.appendChild(this.smallStage);
            this.container.appendChild(this.largeStage);
            
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
            // 错误时使用默认图片
            const defaultImg = '/img/default-bg.jpg';
            if (type === 'small') {
                this.smallStage.style.backgroundImage = `url('${defaultImg}')`;
            } else {
                this.largeStage.style.backgroundImage = `url('${defaultImg}')`;
            }
        }

        /**
         * @description 加载背景
         */
        progressiveLoad() {
            console.log('开始加载图片:', {
                small: this.smallSrc,
                large: this.largeSrc
            });
            
            // 添加加载超时处理
            this.setLoadTimeout();
            
            this.smallImg.src = this.smallSrc;
            this.largeImg.src = this.largeSrc;
        }
        
        /**
         * @description 设置加载超时
         */
        setLoadTimeout() {
            this.loadTimeout = setTimeout(() => {
                console.warn('图片加载超时，使用默认图片');
                this._onImageError('small');
                this._onImageError('large');
            }, 10000); // 10秒超时
        }

        /**
         * @description 大图加载完成
         */
        _onLargeLoaded() {
            console.log('大图加载完成');
            clearTimeout(this.loadTimeout);
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
        
        /**
         * @description 清理资源
         */
        destroy() {
            if (this.loadTimeout) {
                clearTimeout(this.loadTimeout);
            }
            
            // 移除事件监听器
            this.smallImg.onload = null;
            this.largeImg.onload = null;
            this.smallImg.onerror = null;
            this.largeImg.onerror = null;
        }
    }

    const executeLoad = (config, target) => {
        console.log('执行渐进背景替换，目标元素:', target);
        
        // 验证配置
        const validatedConfig = {
            smallSrc: config.smallSrc && !config.smallSrc.includes('null') ? config.smallSrc : '/img/default-bg.jpg',
            largeSrc: config.largeSrc && !config.largeSrc.includes('null') ? config.largeSrc : '/img/default-bg.jpg',
            mobileSmallSrc: config.mobileSmallSrc && !config.mobileSmallSrc.includes('null') ? config.mobileSmallSrc : '/img/default-bg.jpg',
            mobileLargeSrc: config.mobileLargeSrc && !config.mobileLargeSrc.includes('null') ? config.mobileLargeSrc : '/img/default-bg.jpg',
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
        return loader;
    };

    // 主题配置
    const ldconfig = {
        light: {
            smallSrc: 'https://imgyi.ranranran.qzz.io/file/iuurX3Kh.png', //浅色模式 小图链接 尽可能配置小于100k的图片 
            largeSrc: 'https://image.ranranran.qzz.io/file/AgACAgUAAyEGAASlNkLQAAMMaQQ9JYEh2kw-a70SbX68BiSxHv0AAn0OaxtmPSBUHPfUWUSk9PQBAAMCAAN3AAM2BA.png', //浅色模式 大图链接 最终显示的图片
            mobileSmallSrc: 'https://imgyi.ranranran.qzz.io/file/iuurX3Kh.png', //手机端浅色小图链接 尽可能配置小于100k的图片
            mobileLargeSrc: 'https://image.ranranran.qzz.io/file/AgACAgUAAyEGAASlNkLQAAMMaQQ9JYEh2kw-a70SbX68BiSxHv0AAn0OaxtmPSBUHPfUWUSk9PQBAAMCAAN3AAM2BA.png', //手机端浅色大图链接 最终显示的图片
            enableRoutes: ['/'],
        },
        dark: {
            smallSrc: 'https://imgyi.ranranran.qzz.io/file/iuurX3Kh.png', //深色模式 小图链接 尽可能配置小于100k的图片 
            largeSrc: 'https://image.ranranran.qzz.io/file/AgACAgUAAyEGAASlNkLQAAMMaQQ9JYEh2kw-a70SbX68BiSxHv0AAn0OaxtmPSBUHPfUWUSk9PQBAAMCAAN3AAM2BA.png', //深色模式 大图链接 最终显示的图片
            mobileSmallSrc: 'https://imgyi.ranranran.qzz.io/file/iuurX3Kh.png', //手机端深色模式小图链接 尽可能配置小于100k的图片
            mobileLargeSrc: 'https://image.ranranran.qzz.io/file/AgACAgUAAyEGAASlNkLQAAMMaQQ9JYEh2kw-a70SbX68BiSxHv0AAn0OaxtmPSBUHPfUWUSk9PQBAAMCAAN3AAM2BA.png', //手机端深色大图链接 最终显示的图片
            enableRoutes: ['/'],
        },
    };

    // 当前加载器实例
    let currentLoader = null;

    // 获取当前主题
    const getCurrentTheme = () => {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    // 主题变化处理
    const onThemeChange = () => {
        console.log('检测到主题变化');
        const currentTheme = getCurrentTheme();
        const config = ldconfig[currentTheme];
        initProgressiveLoad(config);
    }

    // 初始化渐进加载
    function initProgressiveLoad(config) {
        console.log('initProgressiveLoad 被调用');
        
        // 清理之前的加载器
        if (currentLoader) {
            currentLoader.destroy();
            currentLoader = null;
        }
        
        const container = document.querySelector('.pl-container'); 
        if (container) {
            console.log('移除已存在的 pl-container');
            container.remove(); 
        }
        
        const target = document.getElementById('page-header');
        console.log('找到的 page-header 元素:', target);
        
        if (target && target.classList.contains('full_page')) {
            console.log('条件满足，执行加载');
            currentLoader = executeLoad(config, target);
        } else {
            console.log('条件不满足，跳过加载。target:', target, '有 full_page 类:', target?.classList?.contains('full_page'));
        }
    }

    // PJAX完成处理
    function onPJAXComplete(config) {
        console.log('PJAX 完成，重新初始化');
        setTimeout(() => {
            initProgressiveLoad(config);
        }, 100);
    }

    // 初始化
    const initTheme = getCurrentTheme();
    const initConfig = ldconfig[initTheme];
    
    console.log('初始主题:', initTheme, '配置:', initConfig);
    
    // DOM加载完成后初始化
    document.addEventListener("DOMContentLoaded", function() {
        console.log('DOMContentLoaded 事件触发');
        setTimeout(() => {
            initProgressiveLoad(initConfig);
        }, 100);
    });

    // PJAX支持
    document.addEventListener("pjax:complete", function() {
        console.log('pjax:complete 事件触发');
        const currentTheme = getCurrentTheme();
        const config = ldconfig[currentTheme];
        onPJAXComplete(config);
    });

    // 监听主题变化
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === "data-theme" && location.pathname === '/') {
                onThemeChange();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]  
    });

})();