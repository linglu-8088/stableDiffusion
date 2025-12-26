// ================= 单图审图页面逻辑 =================

import { LogSystem } from '../modules/logSystem.js';

// 单图审图页面对象
const SingleImageReview = {
    // 画布实例
    canvas: null,
    
    // 当前状态
    state: {
        hasImage: false,
        isDrawing: false,
        currentMode: 'select', // 'select' 或 'draw'
        selectedDefect: null,
        defects: [],
        nextDefectId: 1
    },
    
    // 初始化
    init() {
        this.initCanvas();
        this.bindEvents();
        this.updateButtonStates();
        this.initDefectSelector();

        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.PAGE_ACCESS,
            '单图审图页面初始化完成',
            JSON.stringify({ timestamp: new Date().toISOString() }),
            'SingleImageReview'
        );
    },
    
    // 初始化画布
    initCanvas() {
        const canvasElement = document.getElementById('reviewCanvas');
        if (!canvasElement) {
            console.error('找不到画布元素');
            return;
        }

        // 创建 Fabric.js 画布
        this.canvas = new fabric.Canvas('reviewCanvas', {
            width: 800,
            height: 600,
            backgroundColor: 'transparent', // 透明背景，让PCB网格显示
            selection: true,
            preserveObjectStacking: true
        });

        // 设置画布容器样式
        const canvasContainer = canvasElement.parentElement;
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';
        canvasContainer.style.display = 'flex';
        canvasContainer.style.alignItems = 'center';
        canvasContainer.style.justifyContent = 'center';

        // 初始化模拟数据
        this.initMockData();

        // 绑定画布事件
        this.bindCanvasEvents();
    },
    
    // 绑定页面事件
    bindEvents() {
        // 监听页面切换
        document.addEventListener('pageChanged', (event) => {
            if (event.detail.pageId === 'single-image-review') {
                this.onPageShow();
            }
        });
    },
    
    // 绑定画布事件
    bindCanvasEvents() {
        // 对象选择事件
        this.canvas.on('selection:created', (e) => {
            const selectedObject = e.selected[0];
            if (selectedObject && selectedObject.defectId) {
                this.selectDefect(selectedObject.defectId);
            }
        });
        
        this.canvas.on('selection:updated', (e) => {
            const selectedObject = e.selected[0];
            if (selectedObject && selectedObject.defectId) {
                this.selectDefect(selectedObject.defectId);
            } else {
                this.clearSelection();
            }
        });
        
        this.canvas.on('selection:cleared', () => {
            this.clearSelection();
        });
        
        // 对象修改事件
        this.canvas.on('object:modified', (e) => {
            const modifiedObject = e.target;
            if (modifiedObject && modifiedObject.defectId) {
                this.updateDefectData(modifiedObject.defectId, modifiedObject);
            }
        });
        
        // 鼠标事件（用于绘制模式）
        this.canvas.on('mouse:down', (e) => {
            if (this.state.currentMode === 'draw' && !this.state.hasImage) {
                this.showNotification('请先上传图片', 'warning');
                return;
            }
            
            if (this.state.currentMode === 'draw' && this.state.hasImage) {
                this.startDrawing(e.pointer);
            }
        });
        
        this.canvas.on('mouse:up', (e) => {
            if (this.state.currentMode === 'draw' && this.isDrawing) {
                this.finishDrawing(e.pointer);
            }
        });
        
        // 滚轮缩放
        this.canvas.on('mouse:wheel', (e) => {
            if (!this.state.hasImage) return;
            
            e.e.preventDefault();
            const delta = e.e.deltaY;
            let zoom = this.canvas.getZoom();
            zoom *= delta > 0 ? 0.9 : 1.1;
            zoom = Math.max(0.1, Math.min(zoom, 5)); // 限制缩放范围
            
            this.canvas.setZoom(zoom);
            this.canvas.renderAll();
        });
        
        // 拖拽画布
        let isDragging = false;
        let lastPosX = 0;
        let lastPosY = 0;
        
        this.canvas.on('mouse:down', (e) => {
            if (!this.state.hasImage || e.target) return; // 只在空白区域拖拽
            
            isDragging = true;
            lastPosX = e.e.clientX;
            lastPosY = e.e.clientY;
            this.canvas.defaultCursor = 'grab';
        });
        
        this.canvas.on('mouse:move', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.e.clientX - lastPosX;
            const deltaY = e.e.clientY - lastPosY;
            
            const vpt = this.canvas.viewportTransform;
            vpt[4] += deltaX;
            vpt[5] += deltaY;
            
            this.canvas.requestRenderAll();
            this.canvas.setViewportTransform(vpt);
            
            lastPosX = e.e.clientX;
            lastPosY = e.e.clientY;
        });
        
        this.canvas.on('mouse:up', () => {
            isDragging = false;
            this.canvas.defaultCursor = 'default';
        });
    },
    
    // 页面显示时调用
    onPageShow() {
        // 重新调整画布大小
        setTimeout(() => {
            if (this.canvas) {
                this.resizeCanvas();
            }
        }, 100);
    },
    
    // 调整画布大小
    resizeCanvas() {
        const container = this.canvas.getElement().parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.setDimensions({
            width: rect.width - 40,
            height: rect.height - 40
        });
        
        this.canvas.renderAll();
    },
    
    // 上传图片
    uploadImage() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    },
    
    // 处理文件选择
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showNotification('请选择图片文件', 'error');
            return;
        }
        
        // 验证文件大小（限制为10MB）
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('图片文件大小不能超过10MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImage(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    },
    
    // 加载图片到画布
    loadImage(dataUrl, fileName) {
        fabric.Image.fromURL(dataUrl, (img) => {
            if (!img) {
                this.showNotification('图片加载失败', 'error');
                return;
            }
            
            // 清除现有内容
            this.canvas.clear();
            this.state.defects = [];
            this.state.selectedDefect = null;
            this.updateDefectList();
            this.updateDetailCard();
            
            // 调整图片大小以适应画布
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;
            const imgWidth = img.width;
            const imgHeight = img.height;
            
            let scale = 1;
            if (imgWidth > canvasWidth || imgHeight > canvasHeight) {
                scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.9;
            }
            
            img.set({
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                selectable: false,
                evented: false
            });
            
            this.canvas.add(img);
            this.canvas.sendToBack(img);
            
            // 更新状态
            this.state.hasImage = true;
            this.updateButtonStates();
            
            // 重置视图
            this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            
            LogSystem.addLog(
                LogSystem.levels.INFO,
                LogSystem.types.USER_ACTION,
                '图片上传成功',
                JSON.stringify({ fileName, size: dataUrl.length }),
                'SingleImageReview'
            );
            
            this.showNotification('图片上传成功', 'success');
        });
    },
    
    // AI 检测
    async runAIDetection() {
        if (!this.state.hasImage) {
            this.showNotification('请先上传图片', 'warning');
            return;
        }
        
        // 显示加载动画
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = 'flex';
        
        try {
            // 模拟AI检测延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 生成模拟检测结果
            const detections = this.generateMockDetections();
            
            // 清除现有缺陷框
            this.clearDefectBoxes();
            
            // 绘制新的缺陷框
            detections.forEach(detection => {
                this.drawDefectBox(detection);
            });
            
            // 更新缺陷列表
            this.updateDefectList();
            
            LogSystem.addLog(
                LogSystem.levels.INFO,
                LogSystem.types.USER_ACTION,
                'AI检测完成',
                JSON.stringify({ defectCount: detections.length }),
                'SingleImageReview'
            );
            
            this.showNotification(`AI检测完成，发现${detections.length}个缺陷`, 'success');
            
        } catch (error) {
            console.error('AI检测失败:', error);
            this.showNotification('AI检测失败', 'error');
            
            LogSystem.addLog(
                LogSystem.levels.ERROR,
                LogSystem.types.USER_ACTION,
                'AI检测失败',
                JSON.stringify({ error: error.message }),
                'SingleImageReview'
            );
        } finally {
            // 隐藏加载动画
            loadingOverlay.style.display = 'none';
        }
    },
    
    // 生成模拟检测结果
    generateMockDetections() {
        const defectTypes = ['Scratch', 'Stain', 'Chip', 'Crack', 'Particle', 'Void'];
        const defectNames = ['表面划痕', '污点', '碎裂', '裂纹', '颗粒', '空洞'];
        const numDefects = Math.floor(Math.random() * 3) + 3; // 3-5个缺陷
        const detections = [];
        
        for (let i = 0; i < numDefects; i++) {
            const typeIndex = Math.floor(Math.random() * defectTypes.length);
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;
            
            detections.push({
                id: this.state.nextDefectId++,
                x: Math.random() * (canvasWidth - 100) + 50,
                y: Math.random() * (canvasHeight - 100) + 50,
                width: Math.random() * 80 + 40,
                height: Math.random() * 60 + 30,
                label: defectTypes[typeIndex],
                labelName: defectNames[typeIndex],
                score: Math.random() * 0.3 + 0.7 // 0.7-1.0的置信度
            });
        }
        
        return detections;
    },
    
    // 绘制缺陷框
    drawDefectBox(detection) {
        const rect = new fabric.Rect({
            left: detection.x,
            top: detection.y,
            width: detection.width,
            height: detection.height,
            fill: 'rgba(255, 77, 79, 0.1)',
            stroke: '#ff4d4f',
            strokeWidth: 2,
            selectable: true,
            evented: true,
            defectId: detection.id,
            defectData: detection
        });
        
        // 添加标签
        const label = new fabric.Text(`${detection.labelName} (${(detection.score * 100).toFixed(0)}%)`, {
            left: detection.x,
            top: detection.y - 20,
            fontSize: 12,
            fontWeight: 'bold',
            fill: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 4,
            borderRadius: 4,
            selectable: false,
            evented: false,
            defectId: detection.id
        });
        
        this.canvas.add(rect);
        this.canvas.add(label);
        
        // 保存到状态
        this.state.defects.push(detection);
    },
    
    // 清除所有缺陷框
    clearDefectBoxes() {
        const objects = this.canvas.getObjects();
        objects.forEach(obj => {
            if (obj.defectId) {
                this.canvas.remove(obj);
            }
        });
        this.state.defects = [];
    },
    
    // 切换绘制模式
    toggleDrawMode() {
        this.state.currentMode = 'draw';
        this.updateModeButtons();
        this.updateCursor();
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '切换到画框模式',
            JSON.stringify({ mode: this.state.currentMode }),
            'SingleImageReview'
        );
    },
    
    // 切换选择模式
    toggleSelectMode() {
        this.state.currentMode = 'select';
        this.updateModeButtons();
        this.updateCursor();
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '切换到选择模式',
            JSON.stringify({ mode: this.state.currentMode }),
            'SingleImageReview'
        );
    },
    
    // 更新模式按钮状态
    updateModeButtons() {
        const drawBtn = document.getElementById('drawModeBtn');
        const selectBtn = document.getElementById('selectModeBtn');
        
        if (this.state.currentMode === 'draw') {
            drawBtn.classList.add('active');
            selectBtn.classList.remove('active');
        } else {
            drawBtn.classList.remove('active');
            selectBtn.classList.add('active');
        }
    },
    
    // 更新鼠标样式
    updateCursor() {
        const container = document.querySelector('.canvas-container');
        if (this.state.currentMode === 'draw') {
            container.classList.add('drawing-mode');
            container.classList.remove('select-mode');
        } else {
            container.classList.add('select-mode');
            container.classList.remove('drawing-mode');
        }
    },
    
    // 开始绘制
    startDrawing(pointer) {
        this.isDrawing = true;
        this.drawingStartPoint = pointer;
    },
    
    // 完成绘制
    finishDrawing(pointer) {
        if (!this.isDrawing) return;
        
        const x = Math.min(this.drawingStartPoint.x, pointer.x);
        const y = Math.min(this.drawingStartPoint.y, pointer.y);
        const width = Math.abs(pointer.x - this.drawingStartPoint.x);
        const height = Math.abs(pointer.y - this.drawingStartPoint.y);
        
        // 最小尺寸限制
        if (width < 20 || height < 20) {
            this.isDrawing = false;
            return;
        }
        
        const newDefect = {
            id: this.state.nextDefectId++,
            x: x,
            y: y,
            width: width,
            height: height,
            label: 'Other',
            labelName: '其他',
            score: 0.5
        };
        
        this.drawDefectBox(newDefect);
        this.updateDefectList();
        this.isDrawing = false;
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '手动绘制缺陷框',
            JSON.stringify(newDefect),
            'SingleImageReview'
        );
    },
    
    // 选择缺陷
    selectDefect(defectId) {
        this.state.selectedDefect = defectId;

        // 高亮对应的对象
        const objects = this.canvas.getObjects();
        objects.forEach(obj => {
            if (obj.defectId === defectId) {
                obj.set('stroke', '#faad14');
                obj.set('strokeWidth', 3);
                obj.set('fill', 'rgba(250, 173, 20, 0.2)');
            } else if (obj.defectId) {
                obj.set('stroke', '#ff4d4f');
                obj.set('strokeWidth', 2);
                obj.set('fill', 'rgba(255, 77, 79, 0.1)');
            }
        });

        this.canvas.renderAll();

        // 更新详情卡片
        this.updateDetailCard();

        // 高亮列表项
        this.highlightDefectItem(defectId);

        // 更新缺陷选择器
        this.updateDefectSelector();
    },
    
    // 清除选择
    clearSelection() {
        this.state.selectedDefect = null;

        // 恢复所有对象样式
        const objects = this.canvas.getObjects();
        objects.forEach(obj => {
            if (obj.defectId) {
                obj.set('stroke', '#ff4d4f');
                obj.set('strokeWidth', 2);
                obj.set('fill', 'rgba(255, 77, 79, 0.1)');
            }
        });

        this.canvas.renderAll();

        // 清除详情卡片
        this.clearDetailCard();

        // 清除列表高亮
        this.clearDefectItemHighlight();

        // 更新缺陷选择器
        this.updateDefectSelector();
    },
    
    // 更新缺陷数据
    updateDefectData(defectId, object) {
        const defect = this.state.defects.find(d => d.id === defectId);
        if (defect) {
            defect.x = object.left;
            defect.y = object.top;
            defect.width = object.width * object.scaleX;
            defect.height = object.height * object.scaleY;
            
            this.updateDetailCard();
        }
    },
    
    // 初始化缺陷选择器
    initDefectSelector() {
        const defectSelector = document.getElementById('defectSelector');
        if (defectSelector) {
            defectSelector.addEventListener('change', (e) => {
                const defectId = parseInt(e.target.value);
                if (defectId) {
                    this.selectDefect(defectId);
                } else {
                    this.clearSelection();
                }
            });
        }

        // 添加拖拽功能
        this.initDragAndDrop();
    },

    // 初始化拖拽功能
    initDragAndDrop() {
        const rightPanel = document.getElementById('reviewRightPanel');
        if (!rightPanel) return;

        let isDragging = false;
        let startY = 0;
        let startScrollTop = 0;

        // 为右侧面板添加拖拽事件
        rightPanel.addEventListener('mousedown', (e) => {
            if (e.target.closest('.right-panel-module')) {
                isDragging = true;
                startY = e.clientY;
                startScrollTop = rightPanel.scrollTop;
                rightPanel.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaY = e.clientY - startY;
                rightPanel.scrollTop = startScrollTop - deltaY;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                rightPanel.style.cursor = '';
            }
        });
    },

    // 更新缺陷列表
    updateDefectList() {
        const defectList = document.getElementById('defectList');
        const defectCount = document.getElementById('defectCount');

        defectList.innerHTML = '';
        defectCount.textContent = this.state.defects.length;

        if (this.state.defects.length === 0) {
            defectList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">暂无缺陷</div>';
            this.updateDefectSelector();
        } else {
            this.state.defects.forEach(defect => {
                const item = document.createElement('div');
                item.className = 'defect-item';
                item.dataset.defectId = defect.id;
                item.innerHTML = `
                    <div class="defect-color-indicator" style="background: #ff4d4f;"></div>
                    <div class="defect-info">
                        <div class="defect-name">${defect.labelName}</div>
                        <div class="defect-score">${(defect.score * 100).toFixed(0)}%</div>
                    </div>
                `;

                item.addEventListener('click', () => {
                    this.selectDefect(defect.id);
                });

                defectList.appendChild(item);
            });

            // 更新缺陷选择器
            this.updateDefectSelector();
        }

        // 更新底部状态
        this.updateFooterStatus();
    },

    // 更新缺陷选择器
    updateDefectSelector() {
        const defectSelector = document.getElementById('defectSelector');
        const detailHorizontalRow = document.getElementById('detailHorizontalRow');

        if (!defectSelector || !detailHorizontalRow) return;

        // 清空现有选项
        defectSelector.innerHTML = '<option value="">请选择缺陷...</option>';

        if (this.state.defects.length > 0) {
            this.state.defects.forEach(defect => {
                const option = document.createElement('option');
                option.value = defect.id;
                option.textContent = `${defect.labelName} (${(defect.score * 100).toFixed(0)}%)`;
                defectSelector.appendChild(option);
            });
        }

        // 如果有选中的缺陷，设置为选中状态
        if (this.state.selectedDefect) {
            defectSelector.value = this.state.selectedDefect;
            detailHorizontalRow.style.display = 'flex';
        } else {
            defectSelector.value = '';
            detailHorizontalRow.style.display = 'none';
        }
    },
    
    // 高亮缺陷列表项
    highlightDefectItem(defectId) {
        document.querySelectorAll('.defect-item').forEach(item => {
            if (parseInt(item.dataset.defectId) === defectId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    },
    
    // 清除缺陷列表高亮
    clearDefectItemHighlight() {
        document.querySelectorAll('.defect-item').forEach(item => {
            item.classList.remove('selected');
        });
    },
    
    // 更新详情卡片
    updateDetailCard() {
        if (!this.state.selectedDefect) {
            this.clearDetailCard();
            return;
        }
        
        const defect = this.state.defects.find(d => d.id === this.state.selectedDefect);
        if (!defect) return;
        
        document.getElementById('detailX').value = Math.round(defect.x);
        document.getElementById('detailY').value = Math.round(defect.y);
        document.getElementById('detailWidth').value = Math.round(defect.width);
        document.getElementById('detailHeight').value = Math.round(defect.height);
        document.getElementById('detailType').value = defect.label;
        
        // 更新置信度进度条
        const confidencePercent = Math.round(defect.score * 100);
        document.getElementById('confidenceFill').style.width = confidencePercent + '%';
        document.getElementById('confidenceText').textContent = confidencePercent + '%';
        
        // 根据置信度设置颜色
        const confidenceFill = document.getElementById('confidenceFill');
        if (confidencePercent >= 90) {
            confidenceFill.style.background = '#52c41a';
        } else if (confidencePercent >= 70) {
            confidenceFill.style.background = '#faad14';
        } else {
            confidenceFill.style.background = '#ff4d4f';
        }
    },
    
    // 清除详情卡片
    clearDetailCard() {
        document.getElementById('detailX').value = '';
        document.getElementById('detailY').value = '';
        document.getElementById('detailWidth').value = '';
        document.getElementById('detailHeight').value = '';
        document.getElementById('detailType').value = 'Scratch';
        document.getElementById('confidenceFill').style.width = '0%';
        document.getElementById('confidenceText').textContent = '0%';
    },
    
    // 删除选中的缺陷
    deleteSelectedDefect() {
        if (!this.state.selectedDefect) {
            this.showNotification('请先选择要删除的缺陷', 'warning');
            return;
        }
        
        const defectId = this.state.selectedDefect;
        
        // 从画布删除
        const objects = this.canvas.getObjects();
        objects.forEach(obj => {
            if (obj.defectId === defectId) {
                this.canvas.remove(obj);
            }
        });
        
        // 从状态删除
        this.state.defects = this.state.defects.filter(d => d.id !== defectId);
        
        // 清除选择
        this.clearSelection();
        
        // 更新列表
        this.updateDefectList();
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '删除缺陷',
            JSON.stringify({ defectId }),
            'SingleImageReview'
        );
        
        this.showNotification('缺陷已删除', 'success');
    },
    
    // 更新缺陷详情
    updateDefectDetails() {
        if (!this.state.selectedDefect) {
            this.showNotification('请先选择要更新的缺陷', 'warning');
            return;
        }
        
        const defect = this.state.defects.find(d => d.id === this.state.selectedDefect);
        if (!defect) return;
        
        // 获取新的类型
        const newType = document.getElementById('detailType').value;
        const typeNames = {
            'Scratch': '表面划痕',
            'Stain': '污点',
            'Chip': '碎裂',
            'Crack': '裂纹',
            'Particle': '颗粒',
            'Void': '空洞',
            'Other': '其他'
        };
        
        defect.label = newType;
        defect.labelName = typeNames[newType] || '其他';
        
        // 更新标签文本
        const objects = this.canvas.getObjects();
        objects.forEach(obj => {
            if (obj.defectId === defect.id && obj.type === 'text') {
                obj.set('text', `${defect.labelName} (${(defect.score * 100).toFixed(0)}%)`);
            }
        });
        
        this.canvas.renderAll();
        this.updateDefectList();
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.DATA_CHANGE,
            '更新缺陷详情',
            JSON.stringify({ defectId, newType }),
            'SingleImageReview'
        );
        
        this.showNotification('缺陷详情已更新', 'success');
    },
    
    // 保存结果
    saveResults() {
        if (!this.state.hasImage) {
            this.showNotification('请先上传图片', 'warning');
            return;
        }
        
        if (this.state.defects.length === 0) {
            this.showNotification('没有缺陷数据可保存', 'warning');
            return;
        }
        
        const result = {
            timestamp: new Date().toISOString(),
            defects: this.state.defects,
            canvasSize: {
                width: this.canvas.width,
                height: this.canvas.height
            }
        };
        
        // 创建下载链接
        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `defect_result_${new Date().getTime()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '保存审图结果',
            JSON.stringify({ defectCount: this.state.defects.length }),
            'SingleImageReview'
        );
        
        this.showNotification('结果已保存', 'success');
    },
    
    // 更新按钮状态
    updateButtonStates() {
        const aiDetectBtn = document.getElementById('aiDetectBtn');
        const drawModeBtn = document.getElementById('drawModeBtn');
        const selectModeBtn = document.getElementById('selectModeBtn');
        const saveBtn = document.getElementById('saveBtn');
        
        aiDetectBtn.disabled = !this.state.hasImage;
        drawModeBtn.disabled = !this.state.hasImage;
        selectModeBtn.disabled = !this.state.hasImage;
        saveBtn.disabled = !this.state.hasImage;
    },
    
    // 初始化模拟数据
    initMockData() {
        // 填充基础信息
        this.populateBasicInfo();

        // 初始化缺陷统计
        this.updateDefectStats();

        // 初始化底部状态
        this.updateFooterStatus();
    },

    // 填充基础信息
    populateBasicInfo() {
        const machineInput = document.getElementById('machineInput');
        const lotInput = document.getElementById('lotInput');
        const partInput = document.getElementById('partInput');
        const panelInput = document.getElementById('panelInput');

        if (machineInput) machineInput.value = '机台-001';
        if (lotInput) lotInput.value = 'LOT-20251223-001';
        if (partInput) partInput.value = '料号-A001-Board';
        if (panelInput) panelInput.value = 'Panel-001-Top';
    },

    // 更新缺陷统计
    updateDefectStats() {
        const defectStatsBody = document.getElementById('defectStatsBody');
        if (!defectStatsBody) return;

        // 模拟缺陷统计数据
        const defectStats = [
            { type: '表面划痕', count: 5 },
            { type: '污点', count: 2 },
            { type: '碎裂', count: 8 },
            { type: '裂纹', count: 3 },
            { type: '颗粒', count: 6 },
            { type: '空洞', count: 1 }
        ];

        defectStatsBody.innerHTML = '';

        defectStats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stat.type}</td>
                <td>${stat.count}</td>
            `;
            defectStatsBody.appendChild(row);
        });
    },

    // 更新底部状态
    updateFooterStatus() {
        const footerStatusText = document.getElementById('footerStatusText');
        if (footerStatusText) {
            const totalDefects = this.state.defects.length;
            footerStatusText.textContent = `总缺陷数: ${totalDefects} | 剩余待判: ${totalDefects}`;
        }
    },

    // 更新缺陷统计（当缺陷变化时调用）
    refreshDefectStats() {
        this.updateDefectStats();
        this.updateFooterStatus();
    },

    // 上一张图片
    previousImage() {
        this.showNotification('上一张图片功能开发中', 'info');

        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '点击上一张按钮',
            JSON.stringify({ action: 'previous' }),
            'SingleImageReview'
        );
    },

    // 下一张图片
    nextImage() {
        this.showNotification('下一张图片功能开发中', 'info');

        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '点击下一张按钮',
            JSON.stringify({ action: 'next' }),
            'SingleImageReview'
        );
    },

    // 判定为NG（不合格）
    rejectImage() {
        if (!this.state.hasImage) {
            this.showNotification('请先上传图片', 'warning');
            return;
        }

        this.showNotification('图片判定为NG', 'error');

        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '图片判定NG',
            JSON.stringify({
                defectCount: this.state.defects.length,
                result: 'NG'
            }),
            'SingleImageReview'
        );
    },

    // 判定为OK（合格）
    acceptImage() {
        if (!this.state.hasImage) {
            this.showNotification('请先上传图片', 'warning');
            return;
        }

        this.showNotification('图片判定为OK', 'success');

        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '图片判定OK',
            JSON.stringify({
                defectCount: this.state.defects.length,
                result: 'OK'
            }),
            'SingleImageReview'
        );
    },

    // 显示通知
    showNotification(message, type = 'info') {
        // 这里可以使用现有的通知系统，或者创建简单的提示
        console.log(`[${type.toUpperCase()}] ${message}`);

        // 创建简单的通知元素
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
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
};

// 页面初始化时调用
document.addEventListener('DOMContentLoaded', () => {
    SingleImageReview.init();
});

export { SingleImageReview };
