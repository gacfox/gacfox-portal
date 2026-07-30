package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"gacfox-portal/internal/auth"
	"gacfox-portal/internal/helper"
)

// ContextKeyClaims 为 gin.Context 中存放 JWT Claims 的键
const ContextKeyClaims = "claims"

// JWTAuth 校验 Authorization: Bearer <token>，通过后将 Claims 放入 Context
func JWTAuth(secret string) gin.HandlerFunc {
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

		c.Set(ContextKeyClaims, claims)
		c.Next()
	}
}
