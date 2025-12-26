// ================= 多图审图页面逻辑 =================

import { LogSystem } from '../modules/logSystem.js';

// 多图审图页面对象
const MultiImageReview = {
    // 数据状态
    allImages: [],
    currentPage: 1,
    pageSize: 8, // 每页显示8张图片（2行x4列）
    selectedImageId: null,
    
    // 初始化
    init() {
        this.bindEvents();
        this.renderEmptyGrid(); // 修改：初始化时渲染空卡片
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.PAGE_ACCESS,
            '多图审图页面初始化完成',
            JSON.stringify({ 
                timestamp: new Date().toISOString(),
                pageSize: this.pageSize
            }),
            'MultiImageReview'
        );
    },
    
    // 绑定事件
    bindEvents() {
        // 监听页面切换
        document.addEventListener('pageChanged', (event) => {
            if (event.detail.pageId === 'multi-image-review') {
                this.onPageShow();
            }
        });

        // 文件夹导入事件 - 直接在HTML中处理
        // HTML: <button class="btn btn-primary" onclick="document.getElementById('folderInput').click()">
    },
    
    // 页面显示时调用
    onPageShow() {
        // 如果没有图片，显示空卡片网格；否则渲染当前页
        if (this.allImages.length === 0) {
            this.renderEmptyGrid();
        } else {
            this.renderGrid();
        }
    },
    
    // 处理文件夹导入
    async handleFolderImport(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) {
            this.showNotification('请选择包含图片的文件夹', 'warning');
            return;
        }
        
        // 过滤图片文件
        const imageFiles = files.filter(file => {
            return file.type.startsWith('image/');
        });
        
        if (imageFiles.length === 0) {
            this.showNotification('所选文件夹中没有图片文件', 'warning');
            return;
        }
        
        try {
            // 显示加载状态
            this.showLoadingState(true);
            
            // 处理图片文件
            await this.loadFolder(imageFiles);
            
            // 重置到第一页并渲染
            this.currentPage = 1;
            this.renderPage(1); // 修改：调用renderPage(1)函数
            
            this.showNotification(`成功导入 ${imageFiles.length} 张图片`, 'success');
            
            LogSystem.addLog(
                LogSystem.levels.INFO,
                LogSystem.types.USER_ACTION,
                '文件夹导入成功',
                JSON.stringify({ 
                    fileCount: imageFiles.length,
                    firstFile: imageFiles[0]?.name
                }),
                'MultiImageReview'
            );
            
        } catch (error) {
            console.error('文件夹导入失败:', error);
            this.showNotification('文件夹导入失败: ' + error.message, 'error');
            
            LogSystem.addLog(
                LogSystem.levels.ERROR,
                LogSystem.types.USER_ACTION,
                '文件夹导入失败',
                JSON.stringify({ error: error.message, fileCount: files.length }),
                'MultiImageReview'
            );
        } finally {
            this.showLoadingState(false);
        }
    },
    
    // 加载文件夹
    async loadFolder(files) {
        this.allImages = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                // 创建图片URL
                const imageUrl = URL.createObjectURL(file);
                
                // 获取图片尺寸
                const dimensions = await this.getImageDimensions(imageUrl);
                
                // 生成随机缺陷数据
                const defects = this.generateMockDefects();
                
                // 创建图片对象
                const imageObject = {
                    id: `img_${Date.now()}_${i}`,
                    name: file.name,
                    url: imageUrl,
                    size: file.size,
                    type: file.type,
                    width: dimensions.width,
                    height: dimensions.height,
                    status: Math.random() > 0.3 ? 'OK' : 'NG', // 70%概率为OK
                    defects: defects,
                    uploadTime: new Date().toISOString(),
                    judged: false
                };
                
                this.allImages.push(imageObject);
                
            } catch (error) {
                console.warn(`处理图片 ${file.name} 失败:`, error);
            }
        }
        
        if (this.allImages.length === 0) {
            throw new Error('没有有效的图片文件');
        }
    },
    
    // 获取图片尺寸
    getImageDimensions(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height
                });
                URL.revokeObjectURL(imageUrl); // 释放内存
            };
            img.onerror = () => {
                reject(new Error('无法加载图片'));
            };
            img.src = imageUrl;
        });
    },
    
    // 生成模拟缺陷数据 - 增强版本，包含更详细的缺陷信息
    generateMockDefects() {
        // 随机生成0-3个缺陷
        const defectCount = Math.floor(Math.random() * 4);
        if (defectCount === 0) {
            return [];
        }
        
        const defectTypes = [
            { type: 'Scratch', name: '表面划痕' },
            { type: 'Stain', name: '污点' },
            { type: 'Chip', name: '碎裂' },
            { type: 'Crack', name: '裂纹' },
            { type: 'Particle', name: '颗粒' },
            { type: 'Void', name: '空洞' }
        ];
        
        const defects = [];
        const usedTypes = [];
        
        for (let i = 0; i < defectCount; i++) {
            let defectType;
            do {
                defectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
            } while (usedTypes.includes(defectType.type));
            
            usedTypes.push(defectType.type);
            
            // 生成随机位置和尺寸
            const x = Math.floor(Math.random() * 800) + 50; // 50-850
            const y = Math.floor(Math.random() * 600) + 50; // 50-650
            const width = Math.floor(Math.random() * 50) + 10; // 10-60
            const height = Math.floor(Math.random() * 50) + 10; // 10-60
            const score = Math.floor(Math.random() * 40) + 60; // 60-99
            
            defects.push({
                id: `defect_${Date.now()}_${i}`,
                type: defectType.type,
                name: defectType.name,
                x: x,
                y: y,
                width: width,
                height: height,
                score: score,
                confidence: score / 100
            });
        }
        
        return defects;
    },
    
    // 渲染指定页 - 新增方法，用于分页渲染
    renderPage(page) {
        if (page < 1) return;
        
        const totalPages = Math.ceil(this.allImages.length / this.pageSize);
        if (page > totalPages) return;
        
        this.currentPage = page;
        this.renderGrid();
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '渲染页面',
            JSON.stringify({ 
                page: page,
                totalPages: totalPages,
                imageCount: this.allImages.length
            }),
            'MultiImageReview'
        );
    },
    
    // 渲染图片网格 - 修改以支持固定布局和分页
    renderGrid() {
        const gridContainer = document.getElementById('imageGrid');
        const paginationContainer = document.getElementById('paginationControls');
        
        if (!gridContainer) return;
        
        if (this.allImages.length === 0) {
            this.renderEmptyGrid(); // 修改：使用空卡片网格而非空状态
            return;
        }
        
        // 计算当前页的图片
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const currentImages = this.allImages.slice(startIndex, endIndex);
        
        // 清空网格
        gridContainer.innerHTML = '';
        
        // 渲染当前页的图片
        currentImages.forEach(image => {
            const imageCard = this.createImageCard(image);
            gridContainer.appendChild(imageCard);
        });
        
        // 如果当前页图片不足8张，用空卡片填充
        const emptyCardCount = this.pageSize - currentImages.length;
        for (let i = 0; i < emptyCardCount; i++) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'multi-image-card empty-card';
            emptyCard.innerHTML = `
                <div class="multi-image-thumbnail empty-thumbnail">
                    <div class="empty-placeholder">
                        <div class="empty-icon">📷</div>
                        <div class="empty-text">暂无图片</div>
                    </div>
                </div>
                <div class="multi-image-info">
                    <div class="multi-image-name">等待导入...</div>
                    <div class="multi-image-meta">
                        <span class="multi-image-resolution">-</span>
                        <span class="multi-image-defects">0 缺陷</span>
                    </div>
                </div>
            `;
            gridContainer.appendChild(emptyCard);
        }
        
        // 渲染分页控件
        this.renderPagination();
        
        // 更新统计信息
        this.updateStatistics();
    },
    
    // 创建图片卡片 - 增强版本，显示真实缩略图
    createImageCard(image) {
        const card = document.createElement('div');
        card.className = 'multi-image-card';
        card.dataset.imageId = image.id;
        
        if (this.selectedImageId === image.id) {
            card.classList.add('selected');
        }
        
        // 确定状态颜色
        const statusClass = image.status === 'OK' ? 'ok' : 'ng';
        const statusText = image.status;
        
        // 缺陷数量
        const defectCount = image.defects.length;
        
        card.innerHTML = `
            <div class="multi-image-thumbnail">
                <img src="${image.url}" alt="${image.name}" loading="lazy" style="object-fit: cover; width: 100%; height: 100%;">
                <div class="multi-image-status ${statusClass}">${statusText}</div>
            </div>
            <div class="multi-image-info">
                <div class="multi-image-name" title="${image.name}">${image.name}</div>
                <div class="multi-image-meta">
                    <span class="multi-image-resolution">${image.width}×${image.height}</span>
                    <span class="multi-image-defects">${defectCount} 缺陷</span>
                </div>
            </div>
        `;
        
        // 点击事件
        card.addEventListener('click', () => {
            this.selectImage(image.id);
        });
        
        return card;
    },
    
    // 选择图片
    selectImage(imageId) {
        const image = this.allImages.find(img => img.id === imageId);
        if (!image) return;
        
        // 更新选中状态
        this.selectedImageId = imageId;
        
        // 更新卡片的选中样式
        document.querySelectorAll('.multi-image-card').forEach(card => {
            if (card.dataset.imageId === imageId) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
        
        // 更新右侧详情
        this.updateImageDetails(image);
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '选择图片',
            JSON.stringify({ 
                imageId: imageId,
                imageName: image.name,
                defectCount: image.defects.length
            }),
            'MultiImageReview'
        );
    },
    
    // 更新图片详情 - 重写以适配新的右侧栏结构
    updateImageDetails(image) {
        if (!image) {
            // 重置右侧栏为空状态
            document.getElementById('multiFileName').value = '请选择左侧图片查看详情';
            document.getElementById('multiResolution').value = '-';
            document.getElementById('multiFileSize').value = '-';
            document.getElementById('multiStatus').value = '-';
            document.getElementById('multiDefectCount').value = '-';
            document.getElementById('multiDefectCountBadge').textContent = '0';
            document.getElementById('multiDefectList').innerHTML = '';
            document.getElementById('multiDefectSelector').innerHTML = '<option value="">请选择缺陷...</option>';
            document.getElementById('multiDetailRow').style.display = 'none';
            document.getElementById('multiJudgeOK').disabled = true;
            document.getElementById('multiJudgeNG').disabled = true;
            return;
        }
        
        // 更新基础信息
        document.getElementById('multiFileName').value = image.name;
        document.getElementById('multiResolution').value = `${image.width} × ${image.height}`;
        document.getElementById('multiFileSize').value = this.formatFileSize(image.size);
        document.getElementById('multiStatus').value = image.status;
        document.getElementById('multiDefectCount').value = image.defects.length;
        
        // 更新缺陷列表
        document.getElementById('multiDefectCountBadge').textContent = image.defects.length;
        this.renderDefectList(image.defects);
        
        // 更新缺陷选择器
        this.updateDefectSelector(image.defects);
        
        // 启用判定按钮
        document.getElementById('multiJudgeOK').disabled = false;
        document.getElementById('multiJudgeNG').disabled = false;
    },
    
    // 渲染缺陷列表
    renderDefectList(defects) {
        const defectListContainer = document.getElementById('multiDefectList');
        
        if (defects.length === 0) {
            defectListContainer.innerHTML = '<div class="no-defects">暂无缺陷</div>';
            return;
        }
        
        const defectsHtml = defects.map(defect => `
            <div class="defect-item" data-defect-id="${defect.id}">
                <div class="defect-name">${defect.name}</div>
                <div class="defect-score">${defect.score}%</div>
            </div>
        `).join('');
        
        defectListContainer.innerHTML = defectsHtml;
        
        // 添加点击事件
        defectListContainer.querySelectorAll('.defect-item').forEach(item => {
            item.addEventListener('click', () => {
                const defectId = item.dataset.defectId;
                this.selectDefect(defectId);
            });
        });
    },
    
    // 更新缺陷选择器
    updateDefectSelector(defects) {
        const selector = document.getElementById('multiDefectSelector');
        
        if (defects.length === 0) {
            selector.innerHTML = '<option value="">请选择缺陷...</option>';
            return;
        }
        
        let optionsHtml = '<option value="">请选择缺陷...</option>';
        defects.forEach(defect => {
            optionsHtml += `<option value="${defect.id}">${defect.name} (${defect.score}%)</option>`;
        });
        
        selector.innerHTML = optionsHtml;
        
        // 添加变化事件
        selector.addEventListener('change', () => {
            const defectId = selector.value;
            if (defectId) {
                this.selectDefect(defectId);
            } else {
                document.getElementById('multiDetailRow').style.display = 'none';
            }
        });
    },
    
    // 选择缺陷
    selectDefect(defectId) {
        const image = this.allImages.find(img => img.id === this.selectedImageId);
        if (!image) return;
        
        const defect = image.defects.find(d => d.id === defectId);
        if (!defect) return;
        
        // 更新选择器
        document.getElementById('multiDefectSelector').value = defectId;
        
        // 更新缺陷列表中的选中状态
        document.querySelectorAll('.defect-item').forEach(item => {
            if (item.dataset.defectId === defectId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // 显示详细信息
        document.getElementById('multiDetailRow').style.display = 'flex';
        document.getElementById('multiDetailCoords').textContent = `X: ${defect.x}, Y: ${defect.y}`;
        document.getElementById('multiDetailSize').textContent = `宽: ${defect.width}, 高: ${defect.height}`;
        document.getElementById('multiDetailType').value = defect.type;
        
        // 更新置信度
        const confidenceFill = document.getElementById('multiConfidenceFill');
        const confidenceText = document.getElementById('multiConfidenceText');
        confidenceFill.style.width = `${defect.score}%`;
        confidenceText.textContent = `${defect.score}%`;
        
        // 根据置信度设置颜色
        if (defect.score >= 90) {
            confidenceFill.style.backgroundColor = '#52c41a'; // 绿色
        } else if (defect.score >= 70) {
            confidenceFill.style.backgroundColor = '#faad14'; // 橙色
        } else {
            confidenceFill.style.backgroundColor = '#ff4d4f'; // 红色
        }
    },
    
    // 渲染分页控件 - 修改以符合要求
    renderPagination() {
        const paginationContainer = document.getElementById('paginationControls');
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(this.allImages.length / this.pageSize);
        
        // 如果只有一页，不显示分页控件
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        paginationContainer.innerHTML = `
            <button class="btn btn-secondary" 
                    onclick="MultiImageReview.goToPage(${this.currentPage - 1})"
                    ${this.currentPage <= 1 ? 'disabled' : ''}>
                上一页
            </button>
            <div class="pagination-info">
                第 ${this.currentPage} / ${totalPages} 页
            </div>
            <button class="btn btn-secondary" 
                    onclick="MultiImageReview.goToPage(${this.currentPage + 1})"
                    ${this.currentPage >= totalPages ? 'disabled' : ''}>
                下一页
            </button>
        `;
    },
    
    // 跳转到指定页 - 修改以调用renderPage方法
    goToPage(page) {
        this.renderPage(page);
    },
    
    // 判定图片为NG - 更新方法名
    judgeImage(status) {
        if (!this.selectedImageId) {
            this.showNotification('请先选择一张图片', 'warning');
            return;
        }
        
        const image = this.allImages.find(img => img.id === this.selectedImageId);
        if (!image) return;
        
        image.status = status;
        image.judged = true;
        
        // 更新UI
        this.renderGrid();
        this.updateImageDetails(image);
        
        this.showNotification(`图片已标记为 ${status}`, 'success');
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            `图片标记为${status}`,
            JSON.stringify({ 
                imageId: image.id,
                imageName: image.name,
                status: status
            }),
            'MultiImageReview'
        );
    },
    
    // 渲染空卡片网格 - 新增方法，用于初始化时显示空卡片
    renderEmptyGrid() {
        const gridContainer = document.getElementById('imageGrid');
        if (!gridContainer) return;
        
        // 清空网格
        gridContainer.innerHTML = '';
        
        // 创建8个空卡片（2行x4列）
        for (let i = 0; i < 8; i++) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'multi-image-card empty-card';
            emptyCard.innerHTML = `
                <div class="multi-image-thumbnail empty-thumbnail">
                    <div class="empty-placeholder">
                        <div class="empty-icon">📷</div>
                        <div class="empty-text">暂无图片</div>
                    </div>
                </div>
                <div class="multi-image-info">
                    <div class="multi-image-name">等待导入...</div>
                    <div class="multi-image-meta">
                        <span class="multi-image-resolution">-</span>
                        <span class="multi-image-defects">0 缺陷</span>
                    </div>
                </div>
            `;
            gridContainer.appendChild(emptyCard);
        }
        
        // 清空分页控件
        const paginationContainer = document.getElementById('paginationControls');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        
        // 重置右侧栏
        this.updateImageDetails(null);
        
        // 更新统计
        this.updateStatistics();
    },
    
    // 渲染空状态 - 保留原方法，用于无图片导入时的状态
    renderEmptyState() {
        const gridContainer = document.getElementById('imageGrid');
        
        if (gridContainer) {
            gridContainer.innerHTML = `
                <div class="multi-image-empty">
                    <div class="empty-icon">📁</div>
                    <div class="empty-text">请点击"导入文件夹"按钮选择图片文件夹</div>
                    <div class="empty-hint">支持 JPG、PNG、GIF 等常见图片格式</div>
                </div>
            `;
        }
        
        // 重置右侧栏
        this.updateImageDetails(null);
        
        // 清空分页控件
        const paginationContainer = document.getElementById('paginationControls');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        
        // 更新统计
        this.updateStatistics();
    },
    
    // 更新统计信息
    updateStatistics() {
        const statsContainer = document.getElementById('statistics');
        if (!statsContainer) return;
        
        const total = this.allImages.length;
        const okCount = this.allImages.filter(img => img.status === 'OK').length;
        const ngCount = this.allImages.filter(img => img.status === 'NG').length;
        const judgedCount = this.allImages.filter(img => img.judged).length;
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">总图片:</span>
                <span class="stat-value">${total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">OK:</span>
                <span class="stat-value success">${okCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">NG:</span>
                <span class="stat-value danger">${ngCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">已判定:</span>
                <span class="stat-value">${judgedCount}</span>
            </div>
        `;
    },
    
    // 显示/隐藏加载状态
    showLoadingState(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 显示通知
    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : type === 'warning' ? '#faad14' : '#1890ff'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
};

// 页面初始化时调用
document.addEventListener('DOMContentLoaded', () => {
    MultiImageReview.init();
});

export { MultiImageReview };