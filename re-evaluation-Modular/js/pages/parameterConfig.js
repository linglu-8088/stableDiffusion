// ================= 参数配置页面 =================

import { LogSystem } from '../modules/logSystem.js';

export const ParameterConfig = {
    // 当前激活的配置节
    currentSection: 'reviewStrategySection',

    // 初始化
    init: function() {
        console.log('🔧 初始化参数配置页面...');

        try {
            this.bindEvents();
            this.loadConfiguration();
            this.showSection('reviewStrategySection');

            console.log('✅ 参数配置页面初始化完成');
        } catch (error) {
            console.error('❌ 参数配置页面初始化失败:', error);
            LogSystem.addLog(LogSystem.levels.ERROR, LogSystem.types.SYSTEM_CONFIG, '参数配置页面初始化失败', error.message, 'ParameterConfig');
        }
    },

    // 绑定事件
    bindEvents: function() {
        try {
            // Tab切换事件
            const navItems = document.querySelectorAll('.config-right-sidebar .nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const sectionId = e.target.getAttribute('data-section');
                    if (sectionId) {
                        this.showSection(sectionId);
                    }
                });
            });

            // 滑块值变化事件
            const thresholdSlider = document.getElementById('passFailThreshold');
            if (thresholdSlider) {
                thresholdSlider.addEventListener('input', (e) => {
                    this.updateSliderValue(e.target.value);
                });
            }

            // 表单值变化监听（用于实时保存提示）
            this.bindFormChangeEvents();

        } catch (error) {
            console.error('❌ 绑定事件失败:', error);
        }
    },

    // 显示指定配置节
    showSection: function(sectionId) {
        try {
            // 隐藏所有配置节
            const allSections = document.querySelectorAll('.config-section');
            allSections.forEach(section => {
                section.classList.remove('active');
            });

            // 移除所有导航项的激活状态
            const allNavItems = document.querySelectorAll('.config-right-sidebar .nav-item');
            allNavItems.forEach(item => {
                item.classList.remove('active');
            });

            // 显示指定配置节
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // 激活对应的导航项
            const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
            if (targetNavItem) {
                targetNavItem.classList.add('active');
            }

            // 更新当前节
            this.currentSection = sectionId;

            // 记录用户操作
            LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '切换配置节', sectionId, 'ParameterConfig');

        } catch (error) {
            console.error('❌ 显示配置节失败:', error);
        }
    },

    // 更新滑块值显示
    updateSliderValue: function(value) {
        const valueDisplay = document.getElementById('thresholdValue');
        if (valueDisplay) {
            valueDisplay.textContent = value + '%';
        }
    },

    // 绑定表单变化事件
    bindFormChangeEvents: function() {
        try {
            // 监听所有输入框的变化
            const inputs = document.querySelectorAll('#parameterConfigPage input, #parameterConfigPage select');
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    this.markAsModified();
                });
            });

            // 监听单选按钮变化
            const radios = document.querySelectorAll('#parameterConfigPage input[type="radio"]');
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    this.markAsModified();
                });
            });

            // 监听复选框变化
            const checkboxes = document.querySelectorAll('#parameterConfigPage input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.markAsModified();
                });
            });

        } catch (error) {
            console.error('❌ 绑定表单变化事件失败:', error);
        }
    },

    // 标记为已修改
    markAsModified: function() {
        // 可以在这里添加视觉提示，表示配置已修改但未保存
        console.log('📝 配置已修改');
    },

    // 加载配置
    loadConfiguration: function() {
        try {
            // 从localStorage加载配置
            const savedConfig = localStorage.getItem('parameterConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.applyConfiguration(config);
                console.log('✅ 配置已加载');
            } else {
                // 使用默认配置
                this.applyDefaultConfiguration();
                console.log('ℹ️ 使用默认配置');
            }
        } catch (error) {
            console.error('❌ 加载配置失败:', error);
            this.applyDefaultConfiguration();
        }
    },

    // 应用配置到界面
    applyConfiguration: function(config) {
        try {
            // 复判策略配置
            if (config.reviewStrategy) {
                // 复判模式
                const reviewMode = document.querySelector(`input[name="reviewMode"][value="${config.reviewStrategy.mode}"]`);
                if (reviewMode) {
                    reviewMode.checked = true;
                }

                // 阈值
                const thresholdSlider = document.getElementById('passFailThreshold');
                if (thresholdSlider && config.reviewStrategy.threshold !== undefined) {
                    thresholdSlider.value = config.reviewStrategy.threshold;
                    this.updateSliderValue(config.reviewStrategy.threshold);
                }

                // NG判定规则
                const ngRuleCheckbox = document.querySelector('.checkbox-group input[type="checkbox"]');
                if (ngRuleCheckbox && config.reviewStrategy.ngRule !== undefined) {
                    ngRuleCheckbox.checked = config.reviewStrategy.ngRule;
                }
            }

            // 通讯设置配置
            if (config.communication) {
                const mesServer = document.getElementById('mesServer');
                if (mesServer) mesServer.value = config.communication.mesServer || '';

                const mesPort = document.getElementById('mesPort');
                if (mesPort) mesPort.value = config.communication.mesPort || '';

                const heartbeatInterval = document.getElementById('heartbeatInterval');
                if (heartbeatInterval) heartbeatInterval.value = config.communication.heartbeatInterval || '';
            }

            // 图像存储配置
            if (config.storage) {
                const storagePath = document.getElementById('storagePath');
                if (storagePath) storagePath.value = config.storage.path || '';

                const retentionDays = document.getElementById('retentionDays');
                if (retentionDays) retentionDays.value = config.storage.retentionDays || '';

                const autoCleanup = document.getElementById('autoCleanup');
                if (autoCleanup && config.storage.autoCleanup !== undefined) {
                    autoCleanup.checked = config.storage.autoCleanup;
                }
            }

        } catch (error) {
            console.error('❌ 应用配置失败:', error);
        }
    },

    // 应用默认配置
    applyDefaultConfiguration: function() {
        const defaultConfig = {
            reviewStrategy: {
                mode: 'ai-manual',
                threshold: 75,
                ngRule: true
            },
            communication: {
                mesServer: '192.168.1.100',
                mesPort: '8080',
                heartbeatInterval: '30'
            },
            storage: {
                path: '/data/images',
                retentionDays: '30',
                autoCleanup: true
            }
        };

        this.applyConfiguration(defaultConfig);
    },

    // 保存配置
    saveConfiguration: function() {
        try {
            // 收集当前配置
            const config = {
                reviewStrategy: {
                    mode: document.querySelector('input[name="reviewMode"]:checked')?.value || 'ai-manual',
                    threshold: parseInt(document.getElementById('passFailThreshold')?.value || '75'),
                    ngRule: document.querySelector('.checkbox-group input[type="checkbox"]')?.checked || false
                },
                communication: {
                    mesServer: document.getElementById('mesServer')?.value || '',
                    mesPort: document.getElementById('mesPort')?.value || '',
                    heartbeatInterval: document.getElementById('heartbeatInterval')?.value || ''
                },
                storage: {
                    path: document.getElementById('storagePath')?.value || '',
                    retentionDays: document.getElementById('retentionDays')?.value || '',
                    autoCleanup: document.getElementById('autoCleanup')?.checked || false
                },
                lastModified: new Date().toISOString()
            };

            // 保存到localStorage
            localStorage.setItem('parameterConfig', JSON.stringify(config));

            // 记录日志
            LogSystem.addLog(LogSystem.levels.SUCCESS, LogSystem.types.SYSTEM_CONFIG, '参数配置已保存', '', 'ParameterConfig');

            // 显示成功提示
            this.showSuccessMessage('配置保存成功！');

            console.log('💾 配置已保存');

        } catch (error) {
            console.error('❌ 保存配置失败:', error);
            LogSystem.addLog(LogSystem.levels.ERROR, LogSystem.types.SYSTEM_CONFIG, '保存参数配置失败', error.message, 'ParameterConfig');
            this.showErrorMessage('配置保存失败，请重试！');
        }
    },

    // 恢复默认设置
    resetToDefaults: function() {
        try {
            if (confirm('确定要恢复所有设置为默认值吗？此操作不可撤销。')) {
                // 清除保存的配置
                localStorage.removeItem('parameterConfig');

                // 应用默认配置
                this.applyDefaultConfiguration();

                // 记录日志
                LogSystem.addLog(LogSystem.levels.WARNING, LogSystem.types.SYSTEM_CONFIG, '参数配置已恢复默认值', '', 'ParameterConfig');

                // 显示提示
                this.showSuccessMessage('已恢复默认配置！');

                console.log('🔄 配置已恢复默认值');
            }
        } catch (error) {
            console.error('❌ 恢复默认配置失败:', error);
            this.showErrorMessage('恢复默认配置失败！');
        }
    },

    // 测试连接
    testConnection: function() {
        try {
            const serverInput = document.getElementById('mesServer');
            const portInput = document.getElementById('mesPort');

            if (!serverInput || !portInput) {
                this.showErrorMessage('无法获取服务器信息！');
                return;
            }

            const server = serverInput.value.trim();
            const port = portInput.value.trim();

            if (!server) {
                this.showErrorMessage('请输入服务器地址！');
                return;
            }

            // 显示测试中状态
            const testButton = document.querySelector('.input-with-button .btn');
            if (testButton) {
                testButton.disabled = true;
                testButton.textContent = '测试中...';
            }

            // 模拟连接测试（实际项目中应该调用真实的API）
            setTimeout(() => {
                // 模拟成功（80%概率）或失败（20%概率）
                const isSuccess = Math.random() > 0.2;

                if (testButton) {
                    testButton.disabled = false;
                    testButton.textContent = '测试连接';
                }

                if (isSuccess) {
                    this.showSuccessMessage(`连接成功！服务器 ${server}:${port} 响应正常。`);

                    // 记录成功日志
                    LogSystem.addLog(LogSystem.levels.SUCCESS, LogSystem.types.SYSTEM_CONFIG,
                        'MES服务器连接测试成功', `服务器: ${server}:${port}`, 'ParameterConfig');
                } else {
                    this.showErrorMessage(`连接失败！无法连接到服务器 ${server}:${port}。`);

                    // 记录失败日志
                    LogSystem.addLog(LogSystem.levels.ERROR, LogSystem.types.SYSTEM_CONFIG,
                        'MES服务器连接测试失败', `服务器: ${server}:${port}`, 'ParameterConfig');
                }
            }, 1000); // 1秒延迟模拟网络请求

        } catch (error) {
            console.error('❌ 测试连接失败:', error);
            this.showErrorMessage('测试连接过程中发生错误！');
        }
    },

    // 显示成功消息
    showSuccessMessage: function(message) {
        this.showMessage(message, 'success');
    },

    // 显示错误消息
    showErrorMessage: function(message) {
        this.showMessage(message, 'error');
    },

    // 显示消息
    showMessage: function(message, type = 'info') {
        try {
            // 移除现有的消息
            const existingMessages = document.querySelectorAll('.config-message');
            existingMessages.forEach(msg => msg.remove());

            // 创建新消息
            const messageDiv = document.createElement('div');
            messageDiv.className = `config-message ${type}`;
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;

            // 根据类型设置颜色
            if (type === 'success') {
                messageDiv.style.backgroundColor = '#52c41a';
            } else if (type === 'error') {
                messageDiv.style.backgroundColor = '#ff4d4f';
            } else {
                messageDiv.style.backgroundColor = '#1890ff';
            }

            messageDiv.textContent = message;

            // 添加到页面
            document.body.appendChild(messageDiv);

            // 3秒后自动移除
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => {
                        if (messageDiv.parentNode) {
                            messageDiv.parentNode.removeChild(messageDiv);
                        }
                    }, 300);
                }
            }, 3000);

        } catch (error) {
            console.error('❌ 显示消息失败:', error);
        }
    },

    // 页面显示时的处理
    onPageShow: function() {
        console.log('📱 参数配置页面显示');
        // 可以在这里添加页面显示时的特殊处理
    },

    // 页面隐藏时的处理
    onPageHide: function() {
        console.log('📱 参数配置页面隐藏');
        // 可以在这里添加页面隐藏时的清理工作
    }
};

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
