package handler

import (
	"gorm.io/gorm"

	"gacfox-portal/internal/config"
)

// Handler 聚合所有 API 处理器需要的依赖
type Handler struct {
	DB        *gorm.DB
	Config    *config.Config
	JWTSecret string
}

// New 创建 Handler
func New(db *gorm.DB, cfg *config.Config, jwtSecret string) *Handler {
	return &Handler{DB: db, Config: cfg, JWTSecret: jwtSecret}
}
