package handler

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"gacfox-portal/internal/helper"
	"gacfox-portal/internal/model"
)

// 允许上传的图片扩展名
var allowedUploadExts = map[string]bool{
	".png": true, ".jpg": true, ".jpeg": true, ".webp": true,
	".gif": true, ".svg": true, ".ico": true,
}

const maxUploadSize = 5 << 20 // 5MB

// Upload POST /api/upload — 上传图片到 data/uploads，返回可访问 URL
func (h *Handler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		helper.BadRequest(c, "file field required")
		return
	}
	if file.Size > maxUploadSize {
		helper.BadRequest(c, "file too large (max 5MB)")
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedUploadExts[ext] {
		helper.BadRequest(c, "unsupported file type")
		return
	}

	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		helper.InternalError(c, "generate filename failed")
		return
	}
	filename := hex.EncodeToString(buf) + ext

	uploadDir := filepath.Join(h.Config.DataDir, "uploads")
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		helper.InternalError(c, "create upload dir failed")
		return
	}

	if err := c.SaveUploadedFile(file, filepath.Join(uploadDir, filename)); err != nil {
		helper.InternalError(c, "save file failed")
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": fmt.Sprintf("/uploads/%s", filename)})
}

// generatedFilePattern 匹配服务端生成的上传文件名（32 位 hex + 白名单扩展名）
var generatedFilePattern = regexp.MustCompile(`^[0-9a-f]{32}\.(png|jpe?g|webp|gif|svg|ico)$`)

// uploadGracePeriod 上传后的宽限期：刚上传但尚未保存到字段的文件不会被 GC
const uploadGracePeriod = 10 * time.Minute

// CleanupUploads 删除 uploads 目录中不再被任何站点设置或书签引用的文件。
// 在站点设置/书签/分类变更成功后调用；清理失败仅记录日志，不影响请求。
// 仅处理符合生成文件名模式且超过宽限期的文件，用户手动放入的文件不受影响。
func (h *Handler) CleanupUploads() {
	uploadDir := filepath.Join(h.Config.DataDir, "uploads")

	referenced := make(map[string]bool)
	var settings []model.Setting
	if err := h.DB.Where("value LIKE ?", "/uploads/%").Find(&settings).Error; err != nil {
		log.Printf("cleanup uploads: query settings: %v", err)
		return
	}
	for _, s := range settings {
		referenced[filepath.Base(s.Value)] = true
	}
	var icons []string
	if err := h.DB.Model(&model.Bookmark{}).Where("icon LIKE ?", "/uploads/%").
		Pluck("icon", &icons).Error; err != nil {
		log.Printf("cleanup uploads: query bookmarks: %v", err)
		return
	}
	for _, icon := range icons {
		referenced[filepath.Base(icon)] = true
	}

	entries, err := os.ReadDir(uploadDir)
	if err != nil {
		return // 目录不存在则无需清理
	}
	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || referenced[name] || !generatedFilePattern.MatchString(name) {
			continue
		}
		info, err := entry.Info()
		if err != nil || time.Since(info.ModTime()) < uploadGracePeriod {
			continue
		}
		if err := os.Remove(filepath.Join(uploadDir, name)); err != nil {
			log.Printf("cleanup uploads: remove %s: %v", name, err)
		} else {
			log.Printf("cleanup uploads: removed unreferenced file %s", name)
		}
	}
}
