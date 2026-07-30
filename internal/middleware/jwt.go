package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"gacfox-portal/internal/auth"
	"gacfox-portal/internal/helper"
	"gacfox-portal/internal/model"
)

// ContextKeyClaims 为 gin.Context 中存放 JWT Claims 的键
const ContextKeyClaims = "claims"

// JWTAuth 校验 Authorization: Bearer <token>，通过后将 Claims 放入 Context。
// 同时比对令牌中的密码版本与数据库当前版本：改密后旧令牌立即失效。
func JWTAuth(secret string, db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			helper.Unauthorized(c, "missing or malformed authorization header")
			return
		}

		claims, err := auth.ParseToken(secret, strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			helper.Unauthorized(c, "invalid or expired token")
			return
		}

		var user model.User
		if err := db.Select("id", "password_version").First(&user, claims.UserID).Error; err != nil {
			helper.Unauthorized(c, "user no longer exists")
			return
		}
		if user.PasswordVersion != claims.PwdVer {
			helper.Unauthorized(c, "password has been changed, please log in again")
			return
		}

		c.Set(ContextKeyClaims, claims)
		c.Next()
	}
}

// GetClaims 从 gin.Context 取出 JWT Claims（仅 JWTAuth 之后可用）
func GetClaims(c *gin.Context) *auth.Claims {
	if v, ok := c.Get(ContextKeyClaims); ok {
		if claims, ok := v.(*auth.Claims); ok {
			return claims
		}
	}
	return nil
}
