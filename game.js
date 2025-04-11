document.addEventListener('DOMContentLoaded', () => {
    // 游戏元素
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const viewerCountElement = document.getElementById('viewer-count');
    const timerProgressElement = document.getElementById('timer-progress');
    const reputationValueElement = document.getElementById('reputation-value');
    const starsContainer = document.getElementById('stars-container');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-btn');
    const sceneTransitionElement = document.getElementById('scene-transition');
    const redTimeIndicator = document.getElementById('red-time-indicator');
    const branchIndicator = document.getElementById('branch-indicator');
    const commentsListElement = document.getElementById('comments-list');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomValueDisplay = document.getElementById('zoom-value');
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-btn');
    
    // 游戏UI元素数组，用于统一控制显示/隐藏
    const gameUIElements = [
        document.getElementById('ui-container'),
        document.getElementById('timer-pie'),
        document.getElementById('reputation-container'),
        document.getElementById('zoom-slider-container'),
        document.getElementById('comments-container')
    ];
    
    // 隐藏游戏UI元素
    function hideGameUI() {
        gameUIElements.forEach(element => {
            if (element) element.style.display = 'none';
        });
    }
    
    // 显示游戏UI元素
    function showGameUI() {
        gameUIElements.forEach(element => {
            if (element) element.style.display = '';
        });
    }
    
    // 游戏启动时隐藏UI
    hideGameUI();
    
    // 游戏变量
    let score = 0;
    let viewerCount = 0; // 当前观看人数
    let merchantReputation = 100; // 商家声誉
    let timeLeft = 10;
    let gameStarted = false;
    let gameOver = false;
    let firstLaunch = true; // 添加一个变量跟踪是否是首次启动
    let bgOffsetX = 0;
    let bgOffsetY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let greenRect = { x: 0, y: 0, width: 100, height: 100 };
    let redRect = { x: 0, y: 0, width: 100, height: 100 };
    let levelCount = 0;
    let nextImageLoaded = false;
    let branchImageLoaded = false;
    let countdownInterval = null;
    let redRectVisibleTime = 0; // 红色矩形在取景框内的连续时间
    let willEnterBranch = false; // 是否将要进入分支关卡
    let nextLevelId = 1; // 下一关的ID
    let commentInterval = null; // 评论生成定时器
    let activeComments = []; // 当前活跃的评论
    let scoreUpdateInterval = null; // 得分更新定时器
    let zoomLevel = 1.0; // 当前缩放级别
    
    // 窗口尺寸和背景尺寸
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let bgWidth = 0;
    let bgHeight = 0;
    
    // 网友昵称库
    const usernames = [
        // 中文类昵称
        "小王不姓王", "吃可爱长大的", "无敌小可爱", "一只小猫咪", "打工人007", 
        "社畜搬砖中", "摸鱼中勿扰", "深夜吃货", "孤独的美食家", "吃饭第一名",
        "可达鸭本鸭", "熬夜冠军", "南方小土豆", "摆烂小王子", "躺平中ing",
        
        // 英文类昵称
        "ElonFan2023", "GoodGuy_404", "iPhoneUser", "GameMaster", "CoolDude123",
        "MrBeast666", "BabyShark", "SweetDreams", "WildCat", "LOL_Player",
        "StarbuckLover", "DogeCoin", "Web3Builder", "NFT_Collector", "SuperIron",
        
        // 中英结合类
        "方狗Fanggo", "HI是小林", "Mike爱吃面", "小明Plus", "Tony今天不下雨",
        "Lisa要努力", "Jack没长高", "小C超可爱", "大橙子Orange", "超甜Candy",
        
        // 网络热梗昵称
        "真香警告", "柠檬精", "秃头少女", "打工魂", "肥宅不肥", 
        "修勾李弯弯", "原神启动", "永远18岁", "韭菜本韭", "开摆摆烂烂",
        "芝士雪豹", "我不是演员", "吹下去狗熊", "烤地瓜想吃", "内卷不止",
        
        // 保留一些原有的好昵称
        "星辰大海", "微风拂面", "夜空中最亮的星", "浮生若梦", "云端漫步"
    ];
    
    // 评论内容库
    const commentTexts = [
        "这家咖啡馆装修好有格调啊",
        "窗边的光线真不错，拍照一定很上镜",
        "好想去这种地方坐一下午",
        "这家店在哪里？有人知道吗？",
        "我上周刚去过，价格有点小贵",
        "这种薄荷绿的墙面搭配木质装饰真舒服",
        "又是别人的精致生活，羡慕了",
        "主播镜头真稳，拍得真清晰",
        "坐在窗边看书喝咖啡，想想就很惬意",
        "这家店人均消费多少啊？",
        "主播怎么又来这种网红店，能不能有点新意",
        "拍得不错，就是背景音乐有点吵",
        "这家店的面包好吃，咖啡一般般",
        "大家看右边桌子上的花，好像是玫瑰？",
        "今天直播间人好少啊，都去哪了？",
        "请问主播今天是什么相机拍的？超清晰",
        "这种小资情调我可消受不起",
        "看起来好悠闲，我还在加班...",
        "这种环境不适合工作，太舒适了会犯困",
        "主播讲一下这家店的位置吧，想去打卡",
        "这种复古风格的餐厅现在很流行啊",
        "墙上的装饰画挺有意思的",
        "旁边那对情侣好般配啊",
        "我已经三年没坐下来好好喝杯咖啡了，工作太忙",
        "这个角度拍的不错，有电影感",
        "感觉灯光有点暗，是不是滤镜拉得有点狠",
        "店里的装修风格很温馨，我喜欢这种氛围",
        "这种地方周末肯定爆满，能找到座位吗？",
        "主播胃口真好，我看到桌子上的面包了",
        "不知道这里的咖啡怎么样，看起来很精致"
    ];
    
    // 每个关卡的绿色和红色评论库
    const levelComments = [
        // 第1关 (ID: 0) 的评论库
        {
            green: [
                "这位小姐姐笑容真好看，给人感觉很治愈",
                "窗边的光线把她照得好漂亮，整个人都在发光",
                "请问主播认识这位女生吗？能不能介绍一下",
                "我刚进来，这是女朋友吗？拍得真好看",
                "有没有人觉得她长得有点像那个女明星？",
                "她手里拿的是菜单吗？想看看这家店有什么特色",
                "主播能不能问问她用的什么护肤品，皮肤也太好了",
                "这种精致的女生应该是别人家的女朋友吧，哎",
                "镜头里的女生气质真好，像是会讲很多故事的人",
                "怎么又是只拍女生，咖啡店环境也拍一下啊"
            ],
            red: []
        },
        // 第2关 (ID: 1) 的评论库
        {
            green: [
                "这美食看起来太诱人了！",
                "好想尝一口啊",
                "这道菜做得真精致",
                "看得我都饿了",
                "这摆盘也太漂亮了",
                "主播拍的美食让人流口水",
                "好想知道这家店在哪里！",
                "这色香味俱全啊",
                "吃播打卡必去的地方",
                "这家店的菜品看起来很专业"
            ],
            red: []
        },
        // 第3关 (ID: 2) 的评论库
        {
            green: [
                "吃得好香啊，看得我都馋了",
                "这人吃东西的样子好享受",
                "主播镜头捕捉的吃播画面真棒",
                "看别人吃饭都有食欲了",
                "这吃相真是太优雅了",
                "好想和他一起吃啊！",
                "吃得这么香，一定很好吃",
                "看来这家店的味道确实不错",
                "主播拍到的食客都好幸福的样子",
                "这美食真是太治愈了"
            ],
            red: [
                "卧槽！那是老鼠吗？",
                "天啊，桌上有老鼠在偷吃！",
                "那边那个灰色的东西是老鼠吧！",
                "谁看到桌上的老鼠了？！",
                "主播快拍那边的老鼠！",
                "这家店卫生也太差了吧，竟然有老鼠",
                "啊啊啊老鼠在偷吃桌上的食物！",
                "好恶心啊，那桌上有老鼠！",
                "主播快告诉服务员有老鼠啊",
                "我刚刚看到一只老鼠在那桌上窜过去了"
            ]
        },
        // 第4关 (ID: 3) 的评论库
        {
            green: [
                "这甜点看起来太精致了",
                "哇，服务员端上来的甜点好好看",
                "这甜点的摆盘太漂亮了",
                "主播拍到的甜点也太诱人了吧",
                "这个蛋糕看起来好好吃啊",
                "服务员端的这个甜品艺术感十足",
                "甜点上的装饰也太精美了",
                "这家店的甜点颜值真高",
                "服务员端上的甜点看得我都想吃了",
                "这甜品一看就很贵吧，太精致了"
            ],
            red: [
                "那服务员背上有什么东西！",
                "谁看到服务员背上有老鼠了？！",
                "卧槽，那服务员背后有老鼠爬",
                "主播快看那个服务员，背上有老鼠",
                "天啊，老鼠爬在服务员背上！",
                "这家店怎么回事，服务员背上都有老鼠",
                "吓死我了，服务员背后有只大老鼠",
                "主播你看到了吗，那服务员背上",
                "那个端甜点的服务员背上有只灰色的东西",
                "这画面也太吓人了，服务员背后爬着老鼠"
            ]
        },
        // 第5关 (ID: 4) 的评论库
        {
            green: [
                "这对情侣好甜蜜啊",
                "看到他们好恩爱，好羡慕",
                "餐厅约会氛围感真好",
                "这对情侣也太般配了吧",
                "他们看起来感情真好",
                "主播拍到的这对情侣好幸福啊",
                "这就是我想要的爱情",
                "他对她也太温柔了吧",
                "看他们互动真的好甜",
                "这种约会方式也太浪漫了"
            ],
            red: [
                "这女的脾气也太差了吧",
                "哇，这女的怎么这么野蛮啊",
                "那位女士也太凶了吧",
                "这女的好像很生气的样子",
                "我看到一个女生在发飙",
                "主播拍到野蛮女友现场",
                "那边那个女的在干嘛呢，太吓人了",
                "这种女生真的好可怕",
                "她这种性格太恐怖了吧",
                "这就是传说中的母老虎吗"
            ]
        },
        // 第6关 (ID: 5) 的评论库
        {
            green: [
                "这个女生假装矜持的样子好可爱",
                "看她装作不在意的样子真好笑",
                "这女生明明很想吃却装作不想要",
                "她这个矜持的样子也太可爱了",
                "主播拍到女生口是心非的瞬间",
                "这女生嘴上说不要，眼神都出卖她了",
                "哈哈，她那个表情太明显了",
                "这就是传说中的口嫌体直吗",
                "她这个矜持劲儿也太明显了",
                "女生假装不想要的样子真好玩"
            ],
            red: [
                "天啊，那个人差点被飞刀砸中！",
                "好危险！那个飞刀差点砸到人",
                "主播快看那边，飞刀差点伤人",
                "吓死我了，那把刀差点砸中那个人",
                "这也太危险了吧，飞刀差点出事",
                "这家店安全隐患太大了，飞刀乱飞",
                "我刚刚看到一把刀飞过去了，好吓人",
                "那个人运气真好，差点被刀砸中",
                "主播拍到危险一幕，飞刀险些伤人",
                "这种事故也太可怕了吧"
            ]
        },
        // 第7关 (ID: 6) 的评论库
        {
            green: [
                "那个人吃甜点的样子好幸福",
                "看他享受甜品的表情好满足",
                "这甜点看起来确实很好吃的样子",
                "主播拍到别人享用美味的瞬间",
                "吃甜食的时候表情也太享受了",
                "这个甜点一定很符合他的口味",
                "看着别人吃甜点都能感受到幸福",
                "这家店的甜品一定很出名",
                "他吃东西的样子让人也想尝尝",
                "这种幸福感隔着屏幕都能感受到"
            ],
            red: [
                "那对情侣在公共场合接吻诶",
                "主播拍到情侣当众亲热了",
                "这对情侣也不避讳啊，直接亲上了",
                "现在的年轻人这么开放的吗",
                "他们接吻也太投入了吧",
                "这是我们能看的直播内容吗",
                "主播镜头转一下吧，太尴尬了",
                "公共场合亲热有点不太礼貌吧",
                "旁边的人看起来也很尴尬",
                "这对情侣太不顾及周围人的感受了"
            ]
        },
        // 第8关 (ID: 7) 的评论库
        {
            green: [
                "这个男生身材也太好了吧",
                "看起来又高又瘦的，好羡慕",
                "这身材比例真的绝了",
                "主播拍到的这个男生腿好长",
                "这种身材是怎么练出来的",
                "腿长就是任性，羡慕了",
                "这个男生气质也很好",
                "这身高应该有一米八多吧",
                "这种身材是模特标准吧",
                "主播镜头里的帅哥真高"
            ],
            red: [
                "哈哈哈巧克力爆了一身，这也太惨了",
                "女孩子满脸巧克力的表情绝了，太真实了",
                "导播拍得太及时了，刚好拍到甜点爆炸现场",
                "这就是网红甜品的陷阱啊，又贵又容易翻车",
                "服务员呢？赶紧来个善后，这一身怎么洗啊",
                "看男生尴尬到抓头的样子，肯定是第一次约会",
                "估计这家店得给免单了，不然差评肯定刷爆",
                "这种社死现场我都不忍心看下去了，太惨了",
                "女生：我的约会，我的妆，我的衣服，我的发型...",
                "这一刻她的内心os：再也不相信网红甜点了！"
            ]
        },
        // 第9关 (ID: 8) 的评论库
        {
            green: [
                "天啊！有人在求婚，太浪漫了！",
                "这位帅哥求婚的样子也太帅了吧",
                "现场看求婚，好幸福的感觉",
                "主播拍到真实求婚现场，太幸运了",
                "这位男士准备得真充分，好浪漫",
                "公开场合求婚，勇气可嘉啊",
                "看他紧张的样子好可爱，希望成功",
                "这种仪式感满满的求婚太感人了",
                "这对新人看起来很般配，祝福他们",
                "围观群众都在起哄，气氛好好啊"
            ],
            red: [
                "这两个女人吵得也太凶了吧",
                "怎么公共场合就开始吵起来了",
                "主播拍到女人吵架现场，太尴尬了",
                "一言不合就开吵，素质有问题啊",
                "旁边的人都不敢靠近，场面好尴尬",
                "这种事情应该私下解决，太难看了",
                "两个女人吵架没人敢劝，太可怕了",
                "这场面太修罗场了，主播快跑",
                "围观的人越来越多，变成景点了",
                "她们吵架的样子太吓人了，声音好大"
            ]
        },
        // 第10关 (ID: 9) 的评论库
        {
            green: [
                "这个美食也太诱人了吧",
                "主播拍到的菜品看起来好好吃",
                "这道菜的卖相简直绝了",
                "看这个色泽，一定很美味",
                "这个餐厅的出品太精致了",
                "主播拍的这个菜我也想尝尝",
                "这个拍摄角度把美食拍得更诱人了",
                "这盘菜也太好看了吧",
                "看得我口水都要流出来了",
                "这家店的菜品看起来很专业"
            ],
            red: [
                "看那个人道歉的样子好真诚",
                "犯错了还主动赔礼道歉，素质真高",
                "这个人的态度真的很好",
                "主播拍到有人主动承认错误的画面",
                "这种道歉方式很有诚意",
                "这个人犯错后的反应很加分",
                "看得出来他是真心道歉的",
                "这种认错态度值得学习",
                "难得看到这么有素质的道歉",
                "犯错能主动认错的人越来越少了"
            ]
        }
    ];
    
    // 当前使用的评论库（默认使用基础评论库）
    let currentCommentTexts = commentTexts;
    
    // 关卡配置
    const levelConfigs = [
        // 第1关配置 (ID: 0)
        {
            green: { x: 400, y: 400 },
            red: undefined, // 无红色区域
            nextNormalId: 1,
            nextBranchId: undefined,
            bgImage: 'img/img_scene1.png', // 添加背景图片路径
            initialOffset: { x: 100, y: 600 }, // 初始偏移量
            initialZoom: 1.5 // 初始焦距
        },
        // 第2关配置 (ID: 1)
        {
            green: { x: 650, y: 700 },
            red: undefined, // 无红色区域
            nextNormalId: 2,
            nextBranchId: undefined,
            bgImage: 'img/img_scene2.png', // 添加背景图片路径
            initialOffset: { x: 600, y: 0 }, // 初始偏移量
            initialZoom: 1.5 // 初始焦距
        },
        // 第3关配置 (ID: 2)
        {
            green: { x: 350, y: 500 },
            red: { x: 100, y: 900 },
            nextNormalId: 3,
            nextBranchId: 4,
            bgImage: 'img/img_scene3.png', // 添加背景图片路径
            initialOffset: { x: 0, y: 200 }, // 初始偏移量
            initialZoom: 1.5 // 初始焦距
        },
        // 第4关配置 (ID: 3)
        {
            green: { x: 620, y: 720 },
            red: { x: 850, y: 250 },
            nextNormalId: 6,
            nextBranchId: 7,
            bgImage: 'img/img_scene3b.png', // 添加背景图片路径
            initialOffset: { x: 0, y: 300 }, // 初始偏移量
            initialZoom: 1.0 // 初始焦距
        },
        // 第5关配置 (ID: 4)
        {
            green: { x: 850, y: 350 },
            red: { x: 350, y: 400 },
            nextNormalId: 3,
            nextBranchId: 5,
            bgImage: 'img/img_scene3a.png', // 添加背景图片路径
            initialOffset: { x: 100, y: 800 }, // 初始偏移量
            initialZoom: 1.5 // 初始焦距
        },
        // 第6关配置 (ID: 5)
        {
            green: { x: 300, y: 400 },
            red: { x: 750, y: 250 },
            nextNormalId: 8,
            nextBranchId: 9,
            bgImage: 'img/img_scene3aa.png', // 添加背景图片路径
            initialOffset: { x: 600, y: 800 }, // 初始偏移量
            initialZoom: 1.8 // 初始焦距
        },
        // 第7关配置 (ID: 6)
        {
            green: { x: 300, y: 400 },
            red: { x: 750, y: 350 },
            nextNormalId: -1,
            nextBranchId: -1,
            bgImage: 'img/img_scene3bb.png', // 添加背景图片路径
            initialOffset: { x: 200, y: 800 }, // 初始偏移量
            initialZoom: 1.8 // 初始焦距
        },
        // 第8关配置 (ID: 7)
        {
            green: { x: 650, y: 600 },
            red: { x: 300, y: 350 },
            nextNormalId: -1, // 结束游戏并结算
            nextBranchId: -1,   // 结束游戏并结算
            bgImage: 'img/img_scene3ba.png', // 添加背景图片路径
            initialOffset: { x: 600, y: 0 }, // 初始偏移量
            initialZoom: 1.5 // 初始焦距
        },
        // 第9关配置 (ID: 8)
        {
            green: { x: 500, y: 500 },
            red: { x: 650, y: 150 },
            nextNormalId: -1, // 结束游戏并结算
            nextBranchId: -1,   // 结束游戏并结算
            bgImage: 'img/img_scene3aab.png', // 添加背景图片路径
            initialOffset: { x: 100, y: 600 }, // 初始偏移量
            initialZoom: 1.6 // 初始焦距
        },
        // 第10关配置 (ID: 9)
        {
            green: { x: 750, y: 550 },
            red: { x: 250, y: 450 },
            nextNormalId: -1, // 结束游戏并结算
            nextBranchId: -1,   // 结束游戏并结算
            bgImage: 'img/img_scene3aaa.png', // 添加背景图片路径
            initialOffset: { x: 650, y: 800 }, // 初始偏移量
            initialZoom: 2.0 // 初始焦距
        }
    ];
    
    // 当前背景图片、下一张背景图片和分支背景图片
    const currentBgImage = new Image();
    const nextBgImage = new Image();
    const branchBgImage = new Image(); // 分支关卡的背景图
    let currentLevelId = 0; // 当前关卡ID
    
    // 加载第一张背景图片
    currentBgImage.src = levelConfigs[currentLevelId].bgImage;
    
    // 图片加载完成后初始化游戏
    currentBgImage.onload = function() {
        bgWidth = currentBgImage.width;
        bgHeight = currentBgImage.height;
        
        // 根据是否首次启动决定是显示开始屏幕还是直接初始化游戏
        if (firstLaunch) {
            setupStartScreen();
        } else {
            initGame();
        }
    };
    
    // 设置开始屏幕
    function setupStartScreen() {
        // 设置画布大小为图片实际大小
        canvas.width = bgWidth;
        canvas.height = bgHeight;
        
        // 绘制第一关背景
        ctx.drawImage(currentBgImage, 0, 0, bgWidth, bgHeight);
        
        // 显示开始屏幕
        startScreen.style.display = 'flex';
        
        // 隐藏游戏UI
        hideGameUI();
        
        // 添加开始按钮点击事件
        startButton.addEventListener('click', startGame, { once: true });
    }
    
    // 开始游戏
    function startGame() {
        // 隐藏开始屏幕
        startScreen.style.display = 'none';
        
        // 显示游戏UI
        showGameUI();
        
        // 标记游戏已启动过
        firstLaunch = false;
        
        // 初始化游戏
        initGame();
    }
    
    // 初始化游戏
    function initGame() {
        // 设置画布大小为图片实际大小
        canvas.width = bgWidth;
        canvas.height = bgHeight;
        
        // 初始设置
        gameOver = false;
        
        // 初始化UI元素
        updateScore(); // 更新观看人数和商家声誉显示
        updateTimer(); // 更新倒计时进度条
        
        // 应用当前关卡的初始偏移量和缩放
        const currentConfig = levelConfigs[currentLevelId];
        
        // 先设置初始缩放级别
        if (currentConfig && currentConfig.initialZoom) {
            zoomLevel = currentConfig.initialZoom;
            // 更新滑块显示
            zoomSlider.value = zoomLevel * 100;
            zoomValueDisplay.textContent = zoomLevel.toFixed(1) + 'x';
            // 设置初始缩放
            canvas.style.transform = `scale(${zoomLevel})`;
            canvas.style.transformOrigin = 'top left';
            
            console.log(`应用初始缩放: ${zoomLevel}`);
        } else {
            zoomLevel = 1.0;
            zoomSlider.value = 100;
            zoomValueDisplay.textContent = '1.0x';
            canvas.style.transform = 'scale(1)';
            canvas.style.transformOrigin = 'top left';
        }
        
        // 计算缩放后的尺寸
        const scaledWidth = bgWidth * zoomLevel;
        const scaledHeight = bgHeight * zoomLevel;
        
        // 然后应用初始偏移量
        if (currentConfig && currentConfig.initialOffset) {
            // 计算考虑缩放的初始偏移量
            bgOffsetX = currentConfig.initialOffset.x * zoomLevel;
            bgOffsetY = currentConfig.initialOffset.y * zoomLevel;
            
            console.log(`应用初始偏移: 原始(${currentConfig.initialOffset.x}, ${currentConfig.initialOffset.y}), 缩放后(${bgOffsetX}, ${bgOffsetY})`);
        } else {
            bgOffsetX = 0;
            bgOffsetY = 0;
        }
        
        // 确保偏移量不超出范围
        if (bgOffsetX > scaledWidth - windowWidth) {
            bgOffsetX = Math.max(0, scaledWidth - windowWidth);
        }
        if (bgOffsetY > scaledHeight - windowHeight) {
            bgOffsetY = Math.max(0, scaledHeight - windowHeight);
        }
        
        // 更新画布位置
        canvas.style.left = `-${bgOffsetX}px`;
        canvas.style.top = `-${bgOffsetY}px`;
        
        console.log(`初始化完成 - 画布位置: left=${canvas.style.left}, top=${canvas.style.top}, 缩放=${canvas.style.transform}`);
        
        nextImageLoaded = false;
        branchImageLoaded = false;
        redRectVisibleTime = 0;
        willEnterBranch = false;
        
        // 重要：确保当前关卡ID在initGame中正确设置
        if (levelCount === 0) {
            // 只有在游戏首次开始或重启时才重置关卡ID、观看人数和商家声誉
            currentLevelId = 0;
            nextLevelId = 1;
            score = 0;
            viewerCount = 0; // 重置观看人数
            merchantReputation = 100; // 重置商家声誉
            timeLeft = 10;
            console.log(`游戏首次启动 - 重置所有数据`);
        } else {
            // 关卡切换时不重置观看人数和声誉，只重置时间
            timeLeft = 10;
            console.log(`关卡切换 - 保持观看人数(${viewerCount})和声誉(${merchantReputation})`);
        }
        
        console.log(`初始化游戏 - 当前关卡ID: ${currentLevelId}, 关卡计数: ${levelCount}`);
        
        // 重置UI元素
        redTimeIndicator.style.display = 'none';
        branchIndicator.style.display = 'none';
        
        // 只有在第一次启动游戏时才清空评论和开始评论系统
        if (activeComments.length === 0) {
            commentsListElement.innerHTML = '';
            
            // 开始评论生成
            startComments();
        }
        
        // 设置当前关卡的矩形位置
        setRectanglePositions(currentLevelId);
        
        // 隐藏游戏结束界面和场景切换提示
        gameOverElement.style.display = 'none';
        sceneTransitionElement.style.display = 'none';
        
        // 开始游戏
        gameStarted = true;
        
        // 开始倒计时
        startCountdown();
        
        // 开始得分更新
        startScoreUpdate();
        
        // 更新UI
        updateScore();
        updateTimer();
        
        // 开始游戏循环
        requestAnimationFrame(gameLoop);
    }
    
    // 开始评论系统
    function startComments() {
        if (commentInterval) {
            clearInterval(commentInterval);
        }
        
        // 初始时添加一条评论
        addNewComment();
        
        // 随机时间间隔生成新评论
        commentInterval = setInterval(() => {
            if (gameStarted && !gameOver) {
                addNewComment();
            }
        }, getRandomCommentInterval());
    }
    
    // 获取随机评论时间间隔
    function getRandomCommentInterval() {
        return Math.floor(Math.random() * 2000) + 800; // 800ms到2800ms之间
    }
    
    // 添加普通评论
    function addNewComment() {
        // 随机选择用户名和评论内容
        const username = usernames[Math.floor(Math.random() * usernames.length)];
        const commentText = currentCommentTexts[Math.floor(Math.random() * currentCommentTexts.length)];
        
        // 创建评论元素
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        // 创建用户名元素
        const usernameElement = document.createElement('span');
        usernameElement.className = 'username';
        usernameElement.textContent = username + ':';
        commentElement.appendChild(usernameElement);
        
        // 创建评论文本元素
        const textElement = document.createElement('span');
        textElement.className = 'text';
        textElement.textContent = ' ' + commentText; // 添加空格分隔
        
        // 根据评论库设置文本颜色
        const currentLevelComments = levelComments[currentLevelId] || { green: [], red: [] };
        if (currentLevelComments.red && currentLevelComments.red.includes(commentText)) {
            textElement.style.color = '#ff6666'; // 红色评论库
        } else if (currentLevelComments.green && currentLevelComments.green.includes(commentText)) {
            textElement.style.color = '#66ff66'; // 绿色评论库
        }
        
        commentElement.appendChild(textElement);
        
        // 添加到评论列表
        commentsListElement.appendChild(commentElement);
        
        // 将新评论添加到活跃评论数组
        activeComments.push(commentElement);
        
        // 如果评论超过6条，移除最旧的
        if (activeComments.length > 6) {
            const oldestComment = activeComments.shift();
            if (oldestComment.parentNode === commentsListElement) {
                commentsListElement.removeChild(oldestComment);
            }
        }
        
        // 滚动评论动画
        setTimeout(() => {
            scrollComments();
        }, 100);
    }
    
    // 滚动评论动画
    function scrollComments() {
        const comments = document.querySelectorAll('.comment');
        let totalHeight = 0;
        
        // 计算所有评论的总高度
        comments.forEach(comment => {
            totalHeight += comment.offsetHeight + 6; // 评论高度 + margin-bottom
        });
        
        // 只有当评论总高度超过容器高度时才滚动
        if (totalHeight > commentsListElement.offsetHeight) {
            const scrollDistance = totalHeight - commentsListElement.offsetHeight;
            
            // 添加平滑过渡
            comments.forEach(comment => {
                comment.style.transition = 'transform 0.5s ease-out';
                comment.style.transform = `translateY(-${scrollDistance}px)`;
            });
        } else {
            // 如果评论没有超出容器，确保重置所有评论的位置
            comments.forEach(comment => {
                comment.style.transform = 'translateY(0)';
            });
        }
    }
    
    // 设置关卡的矩形位置
    function setRectanglePositions(levelId) {
        console.log(`设置关卡${levelId}的矩形位置，当前levelCount=${levelCount}`); // 增强调试日志
        const config = levelConfigs[levelId];
        
        if (!config) {
            console.error(`错误：未找到关卡${levelId}的配置`);
            return;
        }
        
        // 应用绿色矩形的位置（假设所有关卡都有绿色矩形）
        if (config.green) {
            greenRect.x = config.green.x;
            greenRect.y = config.green.y;
        } else {
            console.warn(`警告: 关卡${levelId}没有设置绿色矩形位置`);
            // 设置一个默认位置
            greenRect.x = 300;
            greenRect.y = 300;
        }
        
        // 应用红色矩形的位置（如果有的话）
        if (config.red) {
            redRect.x = config.red.x;
            redRect.y = config.red.y;
        } else {
            // 如果没有设置红色矩形，将其移动到不可见区域外
            console.log(`关卡${levelId}没有红色矩形，将其移到不可见区域`);
            redRect.x = -200; // 移到画布之外
            redRect.y = -200;
        }
        
        // 确保矩形不超出背景边界
        ensureRectanglesWithinBounds();
    }
    
    // 确保矩形在背景范围内
    function ensureRectanglesWithinBounds() {
        if (greenRect.x + greenRect.width > bgWidth) {
            greenRect.x = bgWidth - greenRect.width;
        }
        if (greenRect.y + greenRect.height > bgHeight) {
            greenRect.y = bgHeight - greenRect.height;
        }
        if (redRect.x + redRect.width > bgWidth) {
            redRect.x = bgWidth - redRect.width;
        }
        if (redRect.y + redRect.height > bgHeight) {
            redRect.y = bgHeight - redRect.height;
        }
        
        // 确保x和y坐标不为负值
        greenRect.x = Math.max(0, greenRect.x);
        greenRect.y = Math.max(0, greenRect.y);
        redRect.x = Math.max(0, redRect.x);
        redRect.y = Math.max(0, redRect.y);
    }
    
    // 预加载下一张背景图片和可能的分支关卡背景图
    function preloadNextImages() {
        nextImageLoaded = false;
        branchImageLoaded = false;
        
        // 获取当前关卡配置
        const currentConfig = levelConfigs[currentLevelId];
        
        // 确定下一个正常关卡的图片索引
        const nextNormalId = currentConfig.nextNormalId;
        
        // 如果nextNormalId为-1，表示将结束游戏
        if (nextNormalId === -1) {
            nextImageLoaded = true;
            console.log("下一步将结束游戏，无需加载新背景");
        } else {
            // 正常加载下一关背景
            const nextNormalConfig = levelConfigs[nextNormalId];
            
            // 加载下一张正常关卡背景图片
            nextBgImage.onload = function() {
                nextImageLoaded = true;
                
                // 检查是否需要等待分支图片加载完成
                if (branchImageLoaded || !currentConfig.nextBranchId || currentConfig.nextBranchId === -1) {
                    // 不再触发场景切换提示，保持静默预加载
                    // 原代码: showSceneTransition();
                }
            };
            nextBgImage.src = nextNormalConfig.bgImage;
        }
        
        // 如果当前关卡有分支路径，则加载分支关卡的背景图片
        if (currentConfig.nextBranchId !== undefined && currentConfig.nextBranchId !== -1) {
            const nextBranchId = currentConfig.nextBranchId;
            const nextBranchConfig = levelConfigs[nextBranchId];
            
            // 加载下一张分支关卡背景图片
            branchBgImage.onload = function() {
                branchImageLoaded = true;
                
                // 只有正常关卡图片也加载完成才显示提示
                if (nextImageLoaded) {
                    // 不再触发场景切换提示，保持静默预加载
                    // 原代码: showSceneTransition();
                }
            };
            branchBgImage.src = nextBranchConfig.bgImage;
        } else {
            // 如果没有分支路径或分支为-1，标记为已加载完成
            branchImageLoaded = true;
            if (currentConfig.nextBranchId === -1) {
                console.log("分支路径将结束游戏，无需加载新背景");
            } else {
                console.log(`关卡${currentLevelId}没有分支路径配置`);
            }
        }
    }
    
    // 显示场景切换提示
    function showSceneTransition() {
        // 不再显示提示消息，场景预加载功能保留
        // 原代码: sceneTransitionElement.style.display = 'block';
        // 不执行任何操作，静默预加载
    }
    
    // 新增全屏遮罩转场动画函数
    function showTransitionMask(callback) {
        // 设置遮罩为黑色全屏，渐入渐出
        sceneTransitionElement.textContent = '';  // 移除提示文字
        sceneTransitionElement.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        sceneTransitionElement.style.display = 'block';
        sceneTransitionElement.style.top = '0';
        sceneTransitionElement.style.left = '0';
        sceneTransitionElement.style.width = '100%';
        sceneTransitionElement.style.height = '100%';
        sceneTransitionElement.style.transform = 'none';
        sceneTransitionElement.style.transition = 'opacity 0.5s ease-in-out';
        sceneTransitionElement.style.padding = '0';
        sceneTransitionElement.style.opacity = '0';
        
        // 强制浏览器重绘
        sceneTransitionElement.offsetHeight;
        
        // 开始淡入
        sceneTransitionElement.style.opacity = '1';
        
        // 淡入完成后执行场景切换
        setTimeout(() => {
            // 执行回调函数（场景切换）
            if (callback) callback();
            
            // 场景切换后开始淡出
            setTimeout(() => {
                sceneTransitionElement.style.opacity = '0';
                // 完全淡出后隐藏元素
                setTimeout(() => {
                    sceneTransitionElement.style.display = 'none';
                }, 500);
            }, 200); // 给切换留一点时间
        }, 500); // 淡入时间为0.5秒
    }
    
    // 切换到下一张背景图片
    function switchToNextImage() {
        if (nextImageLoaded && (branchImageLoaded || !levelConfigs[currentLevelId].nextBranchId)) {
            // 显示全屏转场遮罩
            showTransitionMask(() => {
                // 在遮罩完全不透明时执行场景切换逻辑
                
                // 获取当前关卡配置
                const currentConfig = levelConfigs[currentLevelId];
                
                if (!currentConfig) {
                    console.error(`错误：未找到关卡${currentLevelId}的配置`);
                    return;
                }
                
                // 记录切换前的关卡ID
                const oldLevelId = currentLevelId;
                
                // 根据是否进入分支路径决定下一关的ID
                if (willEnterBranch && currentConfig.nextBranchId !== undefined) {
                    nextLevelId = currentConfig.nextBranchId;
                    console.log(`进入分支关卡: 从${oldLevelId}到${nextLevelId}`);
                    
                    // 检查是否结束游戏
                    if (nextLevelId === -1) {
                        // 移除系统消息
                        setTimeout(() => {
                            endGame();
                        }, 2000);
                        return;
                    }
                    
                    // 使用分支关卡图片
                    currentBgImage.src = branchBgImage.src;
                    
                    // 移除系统消息
                } else {
                    nextLevelId = currentConfig.nextNormalId;
                    console.log(`进入正常关卡: 从${oldLevelId}到${nextLevelId}`);
                    
                    // 检查是否结束游戏
                    if (nextLevelId === -1) {
                        // 移除系统消息
                        setTimeout(() => {
                            endGame();
                        }, 2000);
                        return;
                    }
                    
                    // 使用正常关卡图片
                    currentBgImage.src = nextBgImage.src;
                    
                    // 移除系统消息
                }
                
                // 其余场景切换逻辑保持不变
                // 更新当前关卡ID
                currentLevelId = nextLevelId;
                console.log(`当前关卡ID已更新为: ${currentLevelId}, 关卡计数: ${levelCount}`);
                console.log(`保持观看人数: ${viewerCount}, 商家声誉: ${merchantReputation}`);
                
                // 重置当前评论库到基础评论库
                currentCommentTexts = commentTexts;
                
                // 测试一下这个关卡的评论库是否存在
                const newLevelComments = levelComments[currentLevelId];
                if (newLevelComments) {
                    console.log(`已找到关卡${currentLevelId}的评论库:`, 
                        `绿色评论库(${newLevelComments.green?.length || 0}条)`, 
                        `红色评论库(${newLevelComments.red?.length || 0}条)`);
                } else {
                    console.warn(`警告: 未找到关卡${currentLevelId}的评论库配置`);
                }
                
                // 更新画布大小（如果新图片尺寸不同）
                bgWidth = currentBgImage.width;
                bgHeight = currentBgImage.height;
                canvas.width = bgWidth;
                canvas.height = bgHeight;
                
                // 应用当前关卡的初始焦距和偏移量
                if (levelConfigs[currentLevelId]) {
                    // 先应用初始缩放
                    if (levelConfigs[currentLevelId].initialZoom) {
                        zoomLevel = levelConfigs[currentLevelId].initialZoom;
                        // 更新滑块显示
                        zoomSlider.value = zoomLevel * 100;
                        zoomValueDisplay.textContent = zoomLevel.toFixed(1) + 'x';
                        // 设置缩放
                        canvas.style.transform = `scale(${zoomLevel})`;
                        canvas.style.transformOrigin = 'top left';
                    }
                    
                    // 计算缩放后的尺寸
                    const scaledWidth = bgWidth * zoomLevel;
                    const scaledHeight = bgHeight * zoomLevel;
                    
                    // 然后应用偏移量
                    if (levelConfigs[currentLevelId].initialOffset) {
                        // 计算考虑缩放的偏移量
                        bgOffsetX = levelConfigs[currentLevelId].initialOffset.x * zoomLevel;
                        bgOffsetY = levelConfigs[currentLevelId].initialOffset.y * zoomLevel;
                        
                        // 确保偏移量不超出范围
                        if (bgOffsetX > scaledWidth - windowWidth) {
                            bgOffsetX = Math.max(0, scaledWidth - windowWidth);
                        }
                        if (bgOffsetY > scaledHeight - windowHeight) {
                            bgOffsetY = Math.max(0, scaledHeight - windowHeight);
                        }
                        
                        // 更新画布位置
                        canvas.style.left = `-${bgOffsetX}px`;
                        canvas.style.top = `-${bgOffsetY}px`;
                    }
                }
                
                console.log(`切换到新关卡ID: ${currentLevelId}, 背景偏移: (${bgOffsetX}, ${bgOffsetY}), 焦距: ${zoomLevel}`);
                
                // 重置预加载状态
                nextImageLoaded = false;
                branchImageLoaded = false;
                
                // 重置红色矩形可见时间和UI
                redRectVisibleTime = 0;
                willEnterBranch = false;
                redTimeIndicator.style.display = 'none';
                branchIndicator.style.display = 'none';
                
                // 主动进行一次评论库状态检查，确保关卡切换后立即更新评论库
                updateScoreBasedOnVisibility();
                
                // 确保更新UI显示正确的关卡ID
                updateTimer();
                
                // 更新得分UI显示
                updateScore();
                
                // 添加一波新评论，模拟观众对新场景的反应
                setTimeout(() => {
                    // 快速添加3条评论
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            addNewComment();
                        }, i * 300); // 每300ms添加一条
                    }
                }, 500);
            });
        }
    }
    
    // 游戏主循环
    function gameLoop() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制当前背景图片
        ctx.drawImage(currentBgImage, 0, 0, bgWidth, bgHeight);
        
        // 开发模式下可以取消注释以下代码来显示矩形（用于测试）
        // 绘制绿色矩形（设置为完全透明，使其不可见）
        // ctx.fillStyle = 'rgba(0, 255, 0, 0.6)'; // 注释掉可见的样式
        ctx.fillStyle = 'rgba(0, 255, 0, 0)'; // 完全透明
        ctx.fillRect(greenRect.x, greenRect.y, greenRect.width, greenRect.height);
        
        // 检查当前关卡是否配置了红色矩形
        const currentConfig = levelConfigs[currentLevelId];
        const redRectEnabled = currentConfig && currentConfig.red !== undefined;
        
        // 只在当前关卡配置了红色矩形的情况下才绘制红色矩形（但设为透明）
        if (redRectEnabled) {
            // ctx.fillStyle = 'rgba(255, 0, 0, 0.6)'; // 注释掉可见的样式
            ctx.fillStyle = 'rgba(255, 0, 0, 0)'; // 完全透明
            ctx.fillRect(redRect.x, redRect.y, redRect.width, redRect.height);
        }
        
        // 如果游戏未结束，更新得分
        if (!gameOver) {
            updateScoreBasedOnVisibility();
            requestAnimationFrame(gameLoop);
        }
    }
    
    // 开始倒计时
    function startCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        countdownInterval = setInterval(() => {
            if (timeLeft > 0 && !gameOver) {
                timeLeft--;
                updateTimer();
                
                // 当倒计时剩余5秒时预加载下一张图片
                if (timeLeft === 5) {
                    // 获取当前关卡配置
                    const currentConfig = levelConfigs[currentLevelId];
                    
                    // 检查是否有下一关
                    const hasNextLevel = (currentConfig.nextNormalId !== -1) || 
                                         (currentConfig.nextBranchId !== undefined && currentConfig.nextBranchId !== -1);
                    
                    if (hasNextLevel) {
                        preloadNextImages();
                    } else {
                        // 如果没有下一关，显示即将结束游戏的提示
                        sceneTransitionElement.textContent = "即将结束游戏！";
                        showSceneTransition();
                        sceneTransitionElement.textContent = "即将切换到新场景!"; // 恢复原来的提示文本
                    }
                }
            } else if (timeLeft <= 0 && !gameOver) {
                // 获取当前关卡配置
                const currentConfig = levelConfigs[currentLevelId];
                
                // 检查是否应该结束游戏
                if ((currentConfig.nextNormalId === -1 && !willEnterBranch) || 
                    (willEnterBranch && currentConfig.nextBranchId !== undefined && currentConfig.nextBranchId === -1)) {
                    // 结束游戏并结算
                    // 移除系统消息
                    endGame();
                    return;
                }
                
                // 增加关卡计数
                levelCount++;
                
                // 切换背景图片 - 这会更新currentLevelId
                switchToNextImage();
                
                // 设置新关卡的矩形位置 - 使用更新后的currentLevelId
                setRectanglePositions(currentLevelId);
                
                // 重置计时器 (注意：不要重置观看人数和声誉)
                timeLeft = 10;
                
                // 更新UI以显示新的关卡ID
                updateTimer();
                
                // 移除关卡变化的系统消息
                
                // 如果达到一定关卡数（例如15关），则结束游戏
                if (levelCount >= 15) {
                    clearInterval(countdownInterval);
                    endGame();
                }
            }
        }, 1000);
    }
    
    // 开始定时更新得分
    function startScoreUpdate() {
        if (scoreUpdateInterval) {
            clearInterval(scoreUpdateInterval);
        }
        
        scoreUpdateInterval = setInterval(() => {
            if (gameStarted && !gameOver) {
                updateViewerCountAndReputation();
                updateScore();
                
                // 检查商家声誉是否降到0，如果是则结束游戏
                if (merchantReputation <= 0) {
                    merchantReputation = 0; // 确保不会显示负数
                    // 移除系统消息
                    endGameWithReputationLoss();
                }
            }
        }, 1000); // 每秒更新一次
    }
    
    // 根据当前矩形可见性更新观看人数和商家声誉
    function updateViewerCountAndReputation() {
        const visibleRegion = {
            x: bgOffsetX / zoomLevel,
            y: bgOffsetY / zoomLevel,
            width: windowWidth / zoomLevel,
            height: windowHeight / zoomLevel
        };
        
        // 检查绿色矩形是否在可见区域
        const greenVisible = isRectVisible(greenRect, visibleRegion);
        
        // 检查当前关卡是否启用红色矩形（通过配置判断）
        const currentConfig = levelConfigs[currentLevelId];
        const redRectEnabled = currentConfig && currentConfig.red !== undefined;
        
        // 检查红色矩形是否在可见区域
        const redVisible = redRectEnabled && isRectVisible(redRect, visibleRegion);
        
        // 添加绿色区域的视觉反馈
        if (greenVisible) {
            // 绿色矩形可见时添加微妙的绿色边框效果
            document.getElementById('game-container').style.boxShadow = 'inset 0 0 20px rgba(0, 255, 0, 0.3)';
        } else {
            // 不在绿色区域时移除绿色边框
            document.getElementById('game-container').style.boxShadow = '';
        }
        
        // 添加红色区域的视觉反馈
        if (redVisible) {
            // 红色矩形可见时添加微妙的红色边框效果，优先级高于绿色
            document.getElementById('game-container').style.boxShadow = 'inset 0 0 20px rgba(255, 0, 0, 0.3)';
        }
        
        // 根据可见情况更新观看人数和商家声誉
        if (greenVisible) {
            // 绿色矩形可见时，小幅增加观看人数和商家声誉
            const viewerIncrease = Math.floor(Math.random() * 11) + 10; // 10~20人
            viewerCount += viewerIncrease;
            merchantReputation += 1; // 每秒增加1点声誉
            
            // 确保声誉不超过100
            if (merchantReputation > 100) {
                merchantReputation = 100;
            }
        }
        
        if (redVisible) {
            // 红色矩形可见时，大幅增加观看人数，但减少商家声誉
            const viewerIncrease = Math.floor(Math.random() * 51) + 50; // 50~100人
            viewerCount += viewerIncrease;
            merchantReputation -= 5; // 每秒减少5点声誉
        }
        
        // 如果两种矩形都不可见，则减少观看人数
        if (!greenVisible && !redVisible) {
            const viewerDecrease = Math.floor(Math.random() * 10) + 1; // 1~10人
            viewerCount = Math.max(0, viewerCount - viewerDecrease); // 不让观看人数低于0
        }
    }
    
    // 游戏结束
    function endGame() {
        gameOver = true;
        gameStarted = false;
        
        // 清除定时器
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        if (scoreUpdateInterval) {
            clearInterval(scoreUpdateInterval);
        }
        
        // 移除游戏结束的系统消息
        
        // 显示游戏结束界面
        finalScoreElement.innerHTML = `
            <div>
                <div class="viewer-highlight">${viewerCount.toLocaleString()}</div>
                <div style="font-size: 24px; margin-bottom: 20px;">人观看了您的直播</div>
            </div>
            <div style="margin: 15px 0; font-size: 20px;">
                <span>商家声誉: </span>
                <span style="color:${merchantReputation > 60 ? '#4CAF50' : merchantReputation > 30 ? '#FFC107' : '#F44336'}">${merchantReputation}</span>
            </div>
            <div style="margin-top: 10px;">
                ${getStarsHTML(merchantReputation)}
            </div>
        `;
        gameOverElement.style.display = 'flex';
    }
    
    // 因声誉过低而结束游戏
    function endGameWithReputationLoss() {
        gameOver = true;
        gameStarted = false;
        
        // 清除定时器
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        if (scoreUpdateInterval) {
            clearInterval(scoreUpdateInterval);
        }
        
        // 移除游戏结束的系统消息
        
        // 显示游戏结束界面
        finalScoreElement.innerHTML = `
            <div style="color:#FF6B6B; margin-bottom: 15px; font-size: 24px;">商家中断了直播！</div>
            <div>
                <div class="viewer-highlight">${viewerCount.toLocaleString()}</div>
                <div style="font-size: 24px; margin-bottom: 20px;">人观看了您的直播</div>
            </div>
            <div style="margin: 15px 0; font-size: 20px;">
                <span>商家声誉: </span>
                <span style="color:#F44336">${merchantReputation}</span>
            </div>
            <div style="margin-top: 10px;">
                ${getStarsHTML(merchantReputation)}
            </div>
        `;
        gameOverElement.style.display = 'flex';
    }
    
    // 更新得分
    function updateScore() {
        // 记录当前的观众数
        const previousViewerCount = parseInt(viewerCountElement.textContent) || 0;
        
        // 更新显示
        viewerCountElement.textContent = `${viewerCount}人正在观看`;
        updateReputationStars();
        
        // 获取可见区域信息
        const visibleRegion = {
            x: bgOffsetX / zoomLevel,
            y: bgOffsetY / zoomLevel,
            width: windowWidth / zoomLevel,
            height: windowHeight / zoomLevel
        };
        
        // 检查是否在特殊区域
        const greenVisible = isRectVisible(greenRect, visibleRegion);
        const currentConfig = levelConfigs[currentLevelId];
        const redRectEnabled = currentConfig && currentConfig.red !== undefined;
        const redVisible = redRectEnabled && isRectVisible(redRect, visibleRegion);
        
        // 根据当前所在区域修改观众计数的颜色
        if (redVisible) {
            // 红色区域显示红色
            viewerCountElement.style.color = '#ff7777';
        } else if (greenVisible) {
            // 绿色区域显示绿色
            viewerCountElement.style.color = '#77ff77';
        } else {
            // 普通区域显示白色
            viewerCountElement.style.color = '#ffffff';
        }
        
        // 检查观众数是否发生变化
        if (previousViewerCount !== viewerCount && gameStarted && !gameOver) {
            const diff = viewerCount - previousViewerCount;
            
            // 先移除可能存在的旧观众变化提示
            const existingViewerNotice = document.getElementById('viewer-change-notice');
            if (existingViewerNotice) {
                existingViewerNotice.remove();
            }
            
            if (diff > 0) {
                // 增加了观众
                if (diff >= 10) { // 只有增加超过10人时才显示消息
                    // 创建观众变化提示
                    const viewerNotice = document.createElement('div');
                    viewerNotice.id = 'viewer-change-notice';
                    viewerNotice.style.color = redVisible ? '#ff6666' : '#66ff66'; // 红色区域用红色，其他用绿色
                    viewerNotice.style.fontSize = '14px';
                    viewerNotice.style.marginTop = '5px';
                    viewerNotice.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                    viewerNotice.style.padding = '3px 5px';
                    viewerNotice.style.borderRadius = '4px';
                    viewerNotice.textContent = `+${diff}人加入了直播间`;
                    
                    // 插入到观看人数显示下方
                    viewerCountElement.parentNode.insertBefore(viewerNotice, viewerCountElement.nextSibling);
                    
                    // 3秒后自动移除提示
                    setTimeout(() => {
                        if (viewerNotice.parentNode) {
                            viewerNotice.remove();
                        }
                    }, 3000);
                }
            } else if (diff < 0) {
                // 减少了观众
                if (diff <= -10) { // 只有减少超过10人时才显示消息
                    // 创建观众变化提示
                    const viewerNotice = document.createElement('div');
                    viewerNotice.id = 'viewer-change-notice';
                    viewerNotice.style.color = '#ff6666'; // 红色
                    viewerNotice.style.fontSize = '14px';
                    viewerNotice.style.marginTop = '5px';
                    viewerNotice.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                    viewerNotice.style.padding = '3px 5px';
                    viewerNotice.style.borderRadius = '4px';
                    viewerNotice.textContent = `-${Math.abs(diff)}人离开了直播间`;
                    
                    // 插入到观看人数显示下方
                    viewerCountElement.parentNode.insertBefore(viewerNotice, viewerCountElement.nextSibling);
                    
                    // 3秒后自动移除提示
                    setTimeout(() => {
                        if (viewerNotice.parentNode) {
                            viewerNotice.remove();
                        }
                    }, 3000);
                }
            }
        }
    }
    
    // 更新商家声誉星级显示
    function updateReputationStars() {
        // 更新声誉数值
        reputationValueElement.textContent = merchantReputation;
        
        // 根据声誉值设置颜色
        if (merchantReputation > 60) {
            reputationValueElement.style.color = '#4CAF50'; // 绿色，声誉好
        } else if (merchantReputation > 30) {
            reputationValueElement.style.color = '#FFC107'; // 黄色，声誉一般
        } else {
            reputationValueElement.style.color = '#F44336'; // 红色，声誉差
        }
        
        // 计算星星数量（每20分1颗星）
        const fullStarsCount = Math.floor(merchantReputation / 20);
        
        // 更新星星显示
        const stars = starsContainer.querySelectorAll('.star');
        for (let i = 0; i < stars.length; i++) {
            if (i < fullStarsCount) {
                stars[i].classList.remove('star-empty');
            } else {
                stars[i].classList.add('star-empty');
            }
        }
    }
    
    // 更新计时器
    function updateTimer() {
        // 更新倒计时进度条
        updateTimerProgress(timeLeft);
        
        // 记录日志
        console.log(`计时器更新 - 时间: ${timeLeft}, 关卡计数: ${levelCount}, 关卡ID: ${currentLevelId}`);
    }
    
    // 更新倒计时进度条
    function updateTimerProgress(seconds) {
        // 时间范围通常为10秒
        const maxTime = 10; 
        const percentage = Math.min(Math.max(seconds / maxTime, 0), 1) * 100;
        
        // 根据时间剩余百分比计算颜色
        let color;
        if (percentage >= 60) {
            // 绿色 (60%-100%)
            color = 'rgba(0, 255, 0, 0.7)';
        } else if (percentage >= 30) {
            // 黄色 (30%-60%)
            color = 'rgba(255, 255, 0, 0.7)';
        } else {
            // 红色 (0%-30%)
            color = 'rgba(255, 0, 0, 0.7)';
        }
        
        // 使用conic-gradient实现圆形进度条
        timerProgressElement.style.background = 
            `conic-gradient(${color} 0% ${percentage}%, rgba(0, 0, 0, 0.2) ${percentage}% 100%)`;
        
        // 给元素添加阴影效果，随颜色变化
        if (percentage >= 60) {
            timerProgressElement.style.boxShadow = 'inset 0 0 8px rgba(0, 255, 0, 0.5)';
        } else if (percentage >= 30) {
            timerProgressElement.style.boxShadow = 'inset 0 0 8px rgba(255, 255, 0, 0.5)';
        } else {
            timerProgressElement.style.boxShadow = 'inset 0 0 8px rgba(255, 0, 0, 0.5)';
        }
    }
    
    // 根据矩形的可见性更新得分和检查红色矩形的可见时间
    function updateScoreBasedOnVisibility() {
        const visibleRegion = {
            x: bgOffsetX / zoomLevel,
            y: bgOffsetY / zoomLevel,
            width: windowWidth / zoomLevel,
            height: windowHeight / zoomLevel
        };
        
        // 获取当前关卡的评论库
        const currentLevelComments = levelComments[currentLevelId] || { green: [], red: [] };
        
        // 检查绿色矩形是否在可见区域
        const greenVisible = isRectVisible(greenRect, visibleRegion);
        if (greenVisible) {
            // 如果绿色矩形可见，使用当前关卡的绿色评论库（如果有内容）
            if (currentLevelComments.green && currentLevelComments.green.length > 0) {
                currentCommentTexts = currentLevelComments.green;
                console.log(`使用关卡${currentLevelId}的绿色评论库`); // 添加调试日志
            } else {
                currentCommentTexts = commentTexts; // 如果该关卡没有绿色评论库，则使用默认评论库
                console.log(`关卡${currentLevelId}无绿色评论库，使用默认评论库`); // 添加调试日志
            }
        }
        
        // 检查当前关卡是否启用红色矩形（通过配置判断）
        const currentConfig = levelConfigs[currentLevelId];
        const redRectEnabled = currentConfig && currentConfig.red !== undefined;
        
        // 只有在当前关卡配置了红色矩形的情况下才检查红色矩形的可见性
        if (redRectEnabled) {
            // 检查红色矩形是否在可见区域
            const redVisible = isRectVisible(redRect, visibleRegion);
            if (redVisible) {
                // 如果红色矩形可见，使用当前关卡的红色评论库（如果有内容）
                if (currentLevelComments.red && currentLevelComments.red.length > 0) {
                    currentCommentTexts = currentLevelComments.red;
                    console.log(`使用关卡${currentLevelId}的红色评论库`); // 添加调试日志
                } else {
                    currentCommentTexts = commentTexts; // 如果该关卡没有红色评论库，则使用默认评论库
                    console.log(`关卡${currentLevelId}无红色评论库，使用默认评论库`); // 添加调试日志
                }
                
                // 增加红色矩形可见时间计数
                redRectVisibleTime += 1/60; // 假设游戏以约60FPS运行
                
                // 检查是否有分支路径配置
                const hasBranchPath = currentConfig.nextBranchId !== undefined;
                
                // 如果红色矩形可见超过5秒，并且当前关卡有分支配置，标记将进入分支关卡
                if (redRectVisibleTime >= 5 && !willEnterBranch && hasBranchPath) {
                    willEnterBranch = true;
                }
            } else {
                // 如果红色矩形不可见，重置计时
                redRectVisibleTime = 0;
            }
        } else {
            // 如果当前关卡没有红色矩形配置，确保红色指示器和分支标记都不显示
            redRectVisibleTime = 0;
        }
        
        // 如果绿色矩形不可见，并且没有红色矩形或红色矩形不可见，使用默认评论库
        const redVisible = redRectEnabled && isRectVisible(redRect, visibleRegion);
        if (!greenVisible && !redVisible) {
            currentCommentTexts = commentTexts;
            console.log(`无矩形可见，使用默认评论库`); // 添加调试日志
        }
    }
    
    // 判断矩形是否在可见区域内
    function isRectVisible(rect, visibleRegion) {
        // 考虑缩放因素，使矩形和可见区域比较时在同一坐标系中
        return (
            rect.x < visibleRegion.x + visibleRegion.width &&
            rect.x + rect.width > visibleRegion.x &&
            rect.y < visibleRegion.y + visibleRegion.height &&
            rect.y + rect.height > visibleRegion.y
        );
    }
    
    // 处理鼠标/触摸事件
    function handleDragStart(e) {
        if (gameStarted && !gameOver) {
            isDragging = true;
            startX = getEventX(e);
            startY = getEventY(e);
        }
    }
    
    function handleDragMove(e) {
        if (isDragging && gameStarted && !gameOver) {
            e.preventDefault();
            const currentX = getEventX(e);
            const currentY = getEventY(e);
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // 更新背景偏移，考虑缩放因素
            bgOffsetX -= deltaX;
            bgOffsetY -= deltaY;
            
            // 获取缩放后的尺寸
            const scaledWidth = bgWidth * zoomLevel;
            const scaledHeight = bgHeight * zoomLevel;
            
            // 限制背景偏移范围
            if (bgOffsetX < 0) {
                bgOffsetX = 0;
            } else if (bgOffsetX > scaledWidth - windowWidth) {
                bgOffsetX = Math.max(0, scaledWidth - windowWidth);
            }
            
            if (bgOffsetY < 0) {
                bgOffsetY = 0;
            } else if (bgOffsetY > scaledHeight - windowHeight) {
                bgOffsetY = Math.max(0, scaledHeight - windowHeight);
            }
            
            // 更新画布位置
            canvas.style.left = `-${bgOffsetX}px`;
            canvas.style.top = `-${bgOffsetY}px`;
            
            // 更新起始点位置
            startX = currentX;
            startY = currentY;
        }
    }
    
    function handleDragEnd() {
        isDragging = false;
    }
    
    // 获取事件的坐标，兼容鼠标和触摸事件
    function getEventX(e) {
        return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    }
    
    function getEventY(e) {
        return e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    }
    
    // 应用缩放
    function applyZoom() {
        // 获取变焦前的缩放级别
        const oldZoomLevel = parseFloat(canvas.style.transform.replace('scale(', '').replace(')', '')) || 1.0;
        
        // 计算当前视口中心点在背景图上的位置（相对于未缩放的背景图）
        const viewportCenterX = (bgOffsetX + windowWidth / 2) / oldZoomLevel;
        const viewportCenterY = (bgOffsetY + windowHeight / 2) / oldZoomLevel;
        
        console.log(`变焦: ${oldZoomLevel} -> ${zoomLevel}, 中心点: (${viewportCenterX}, ${viewportCenterY})`);
        
        // 应用变焦转换
        canvas.style.transform = `scale(${zoomLevel})`;
        canvas.style.transformOrigin = 'top left';
        
        // 重新计算偏移以保持视口中心点
        adjustOffsetAfterZoom(viewportCenterX, viewportCenterY);
    }
    
    // 在变焦后调整偏移量以保持视口中心点
    function adjustOffsetAfterZoom(centerX, centerY) {
        // 基于新的缩放级别计算中心点的新位置
        const newOffsetX = centerX * zoomLevel - windowWidth / 2;
        const newOffsetY = centerY * zoomLevel - windowHeight / 2;
        
        // 更新背景偏移
        bgOffsetX = newOffsetX;
        bgOffsetY = newOffsetY;
        
        // 确保背景不会超出可见区域
        const scaledWidth = bgWidth * zoomLevel;
        const scaledHeight = bgHeight * zoomLevel;
        
        // 限制偏移范围
        if (scaledWidth <= windowWidth) {
            // 如果缩放后的宽度小于窗口宽度，居中显示
            bgOffsetX = (scaledWidth - windowWidth) / 2;
            if (bgOffsetX < 0) bgOffsetX = 0;
        } else {
            // 确保不会超出缩放后的图片边界
            bgOffsetX = Math.max(0, Math.min(bgOffsetX, scaledWidth - windowWidth));
        }
        
        if (scaledHeight <= windowHeight) {
            // 如果缩放后的高度小于窗口高度，居中显示
            bgOffsetY = (scaledHeight - windowHeight) / 2;
            if (bgOffsetY < 0) bgOffsetY = 0;
        } else {
            // 确保不会超出缩放后的图片边界
            bgOffsetY = Math.max(0, Math.min(bgOffsetY, scaledHeight - windowHeight));
        }
        
        console.log(`新偏移量: (${bgOffsetX}, ${bgOffsetY}), 缩放尺寸: ${scaledWidth}x${scaledHeight}`);
        
        // 更新画布位置
        canvas.style.left = `-${bgOffsetX}px`;
        canvas.style.top = `-${bgOffsetY}px`;
    }
    
    // 变焦滑块事件监听
    zoomSlider.addEventListener('input', function() {
        zoomLevel = this.value / 100;
        zoomValueDisplay.textContent = zoomLevel.toFixed(1) + 'x';
        applyZoom();
    });
    
    // 窗口大小改变时调整画布
    function handleResize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        
        // 限制背景偏移范围
        const scaledWidth = bgWidth * zoomLevel;
        const scaledHeight = bgHeight * zoomLevel;
        
        if (bgOffsetX > scaledWidth - windowWidth) {
            bgOffsetX = Math.max(0, scaledWidth - windowWidth);
            canvas.style.left = `-${bgOffsetX}px`;
        }
        
        if (bgOffsetY > scaledHeight - windowHeight) {
            bgOffsetY = Math.max(0, scaledHeight - windowHeight);
            canvas.style.top = `-${bgOffsetY}px`;
        }
    }
    
    // 事件监听
    canvas.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    canvas.addEventListener('touchstart', handleDragStart);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
    
    window.addEventListener('resize', handleResize);
    
    // 初始化时设置变焦滑块
    window.addEventListener('load', () => {
        // 确保滑块初始值正确
        const initialZoom = levelConfigs[currentLevelId].initialZoom || 1.0;
        zoomSlider.value = initialZoom * 100;
        zoomValueDisplay.textContent = initialZoom.toFixed(1) + 'x';
    });
    
    restartButton.addEventListener('click', function() {
        // 重置游戏状态
        levelCount = 0;
        currentLevelId = 0;  // 确保重置为第一关
        nextLevelId = 1;
        viewerCount = 0;     // 重置观看人数
        merchantReputation = 100; // 重置商家声誉
        firstLaunch = true;  // 重新启用开始屏幕
        
        console.log(`游戏重启 - 关卡ID重置为: ${currentLevelId}`);
        
        // 隐藏游戏结束界面
        gameOverElement.style.display = 'none';
        
        // 重新加载第一张背景图片
        currentBgImage.src = levelConfigs[currentLevelId].bgImage;
    });
    
    // 添加特殊评论（系统提示或特殊事件相关）
    function addSpecialComment(message) {
        // 创建评论元素
        const commentElement = document.createElement('div');
        commentElement.className = 'comment system-comment';
        commentElement.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        commentElement.style.padding = '3px 5px';
        commentElement.style.borderRadius = '4px';
        commentElement.style.marginBottom = '8px';
        
        // 创建评论文本元素（不再有系统消息前缀）
        const textElement = document.createElement('span');
        textElement.className = 'text';
        textElement.textContent = message;
        commentElement.appendChild(textElement);
        
        // 添加到评论列表的底部（而不是顶部）
        commentsListElement.appendChild(commentElement);
        
        // 将新评论添加到活跃评论数组
        activeComments.push(commentElement);
        
        // 如果评论超过8条，移除最旧的
        if (activeComments.length > 8) {
            const oldestComment = activeComments.shift();
            if (oldestComment.parentNode === commentsListElement) {
                commentsListElement.removeChild(oldestComment);
            }
        }
        
        // 滚动评论动画
        setTimeout(() => {
            scrollComments();
        }, 100);
    }
    
    // 获取星星HTML
    function getStarsHTML(reputation) {
        const fullStarsCount = Math.floor(reputation / 20);
        let starsHTML = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStarsCount) {
                starsHTML += '<span style="color: #ffcc00; font-size: 32px; margin: 0 5px; text-shadow: 0 0 10px rgba(255, 204, 0, 0.6);">★</span>';
            } else {
                starsHTML += '<span style="color: rgba(255, 255, 255, 0.2); font-size: 32px; margin: 0 5px;">★</span>';
            }
        }
        
        return starsHTML;
    }
}); 