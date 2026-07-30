package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"gacfox-portal/internal/auth"
	"gacfox-portal/internal/database"
	"gacfox-portal/internal/helper"
	"gacfox-portal/internal/model"
)

// Status GET /api/status — 返回系统是否已初始化（是否存在管理员）
func (h *Handler) Status(c *gin.Context) {
	var count int64
	if err := h.DB.Model(&model.User{}).Count(&count).Error; err != nil {
		helper.InternalError(c, "query user count failed")
		return
	}
	c.JSON(http.StatusOK, gin.H{"initialized": count > 0})
}

type credentialsRequest struct {
	Username string `json:"username" binding:"required,min=1,max=64"`
	Password string `json:"password" binding:"required,min=6,max=128"`
}

// Init POST /api/init — 创建管理员并导入种子数据，仅允许在空库执行一次
func (h *Handler) Init(c *gin.Context) {
	var count int64
	if err := h.DB.Model(&model.User{}).Count(&count).Error; err != nil {
		helper.InternalError(c, "query user count failed")
		return
	}
	if count > 0 {
		helper.Error(c, http.StatusConflict, "system already initialized")
		return
	}

	var req credentialsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.BadRequest(c, "username required, password at least 6 characters")
		return
	}

	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		helper.InternalError(c, "hash password failed")
		return
	}

	user := model.User{Username: req.Username, PasswordHash: hash}
	err = h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		return database.ImportSeed(tx)
	})
	if err != nil {
		helper.InternalError(c, "initialize failed")
		return
	}

	h.respondWithToken(c, &user)
}

// Login POST /api/login — 校验用户名密码并颁发 JWT
func (h *Handler) Login(c *gin.Context) {
	var req credentialsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.BadRequest(c, "username and password required")
		return
	}

	var user model.User
	if err := h.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		helper.Unauthorized(c, "invalid username or password")
		return
	}
	if !auth.CheckPassword(user.PasswordHash, req.Password) {
		helper.Unauthorized(c, "invalid username or password")
		return
	}

	h.respondWithToken(c, &user)
}

func (h *Handler) respondWithToken(c *gin.Context, user *model.User) {
	token, err := auth.GenerateToken(h.JWTSecret, user.ID, user.Username, h.Config.JWT.ExpireHours)
	if err != nil {
		helper.InternalError(c, "generate token failed")
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token, "username": user.Username})
}
