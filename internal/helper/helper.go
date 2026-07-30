package helper

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Error 统一错误响应：{"error": "msg"}
func Error(c *gin.Context, status int, msg string) {
	c.AbortWithStatusJSON(status, gin.H{"error": msg})
}

// BadRequest 400
func BadRequest(c *gin.Context, msg string) {
	Error(c, http.StatusBadRequest, msg)
}

// Unauthorized 401
func Unauthorized(c *gin.Context, msg string) {
	Error(c, http.StatusUnauthorized, msg)
}

// NotFound 404
func NotFound(c *gin.Context, msg string) {
	Error(c, http.StatusNotFound, msg)
}

// InternalError 500
func InternalError(c *gin.Context, msg string) {
	Error(c, http.StatusInternalServerError, msg)
}
